import {
  DowntimeType,
  prisma,
  type Downtime,
  type IndicatorSnapshot,
  type Machine,
  type ProductionEntry,
} from "@gmao/database";
import {
  calculateAvailability,
  calculateMtbfHours,
  calculateMttrMinutes,
  calculatePerformance,
  calculateQuality,
  calculateTrs,
  buildUtcDayPeriod,
} from "@gmao/shared";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import type { ListIndicatorsQueryDto } from "./dto/list-indicators-query.dto";
import type { RecalculateIndicatorsDto } from "./dto/recalculate-indicators.dto";

const DOWNTIME_CHANGED_EVENT: string = "downtime.changed";
const PRODUCTION_CHANGED_EVENT: string = "production.changed";
const MILLISECONDS_PER_MINUTE: number = 60_000;
const FAILURE_TYPES: readonly DowntimeType[] = [
  DowntimeType.MECHANICAL_FAILURE,
  DowntimeType.ELECTRICAL_FAILURE,
  DowntimeType.VORSCHUB_ADJUSTMENT,
];

interface DowntimeChangedEvent {
  readonly machineId: string;
}

interface Period {
  readonly periodStart: Date;
  readonly periodEnd: Date;
}

interface ProductionTotals {
  readonly idealOperatingSeconds: number;
  readonly openingMinutes: number;
  readonly quantityGood: number;
  readonly quantityProduced: number;
}

interface DowntimeTotals {
  readonly downtimeMinutes: number;
  readonly failureCount: number;
  readonly repairMinutesTotal: number;
}

function calculateOverlapMinutes(
  itemStart: Date,
  itemEnd: Date,
  period: Period,
): number {
  const overlapStart: number = Math.max(
    itemStart.getTime(),
    period.periodStart.getTime(),
  );
  const overlapEnd: number = Math.min(
    itemEnd.getTime(),
    period.periodEnd.getTime(),
  );
  return Math.max(0, overlapEnd - overlapStart) / MILLISECONDS_PER_MINUTE;
}

function calculateProductionRatio(
  entry: ProductionEntry,
  period: Period,
): number {
  const entryMinutes: number =
    (entry.periodEnd.getTime() - entry.periodStart.getTime()) /
    MILLISECONDS_PER_MINUTE;
  if (entryMinutes <= 0) return 0;
  return (
    calculateOverlapMinutes(entry.periodStart, entry.periodEnd, period) /
    entryMinutes
  );
}

/**
 * Recalculates and stores machine KPI snapshots.
 *
 * MTBF and MTTR failures are downtimes of type MECHANICAL_FAILURE,
 * ELECTRICAL_FAILURE, or VORSCHUB_ADJUSTMENT.
 */
@Injectable()
export class IndicatorsService {
  private readonly logger: Logger = new Logger(IndicatorsService.name);

  /**
   * Aggregates downtime and production data for an exact period.
   */
  public async recalculate(
    input: RecalculateIndicatorsDto,
  ): Promise<IndicatorSnapshot> {
    const period: Period = {
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
    };
    return this.recalculatePeriod(input.machineId, period);
  }

  /**
   * Lists snapshots overlapping a requested period.
   */
  public async getAll(
    query: ListIndicatorsQueryDto,
  ): Promise<IndicatorSnapshot[]> {
    const period: Period = {
      periodStart: new Date(query.periodStart),
      periodEnd: new Date(query.periodEnd),
    };
    this.validatePeriod(period);
    return prisma.indicatorSnapshot.findMany({
      where: {
        machineId: query.machineId,
        periodStart: { lt: period.periodEnd },
        periodEnd: { gt: period.periodStart },
      },
      orderBy: { periodStart: "desc" },
    });
  }

  /**
   * Recalculates the current UTC day after a downtime mutation.
   */
  @OnEvent(DOWNTIME_CHANGED_EVENT)
  public async handleDowntimeChanged(
    event: DowntimeChangedEvent,
  ): Promise<void> {
    await this.recalculateCurrentUtcDay(event.machineId);
  }

  /**
   * Recalculates the current UTC day after a production entry is saved.
   */
  @OnEvent(PRODUCTION_CHANGED_EVENT)
  public async handleProductionChanged(
    event: DowntimeChangedEvent,
  ): Promise<void> {
    await this.handleDowntimeChanged(event);
  }

  private async recalculateCurrentUtcDay(machineId: string): Promise<void> {
    const now: Date = new Date();
    const { periodStart } = buildUtcDayPeriod(now);
    try {
      await this.recalculatePeriod(machineId, {
        periodStart,
        periodEnd: now,
      });
    } catch (error: unknown) {
      const message: string =
        error instanceof Error ? error.message : "Unknown recalculation error";
      this.logger.error(
        `Unable to recalculate indicators for machine ${machineId}: ${message}`,
      );
    }
  }

  private async recalculatePeriod(
    machineId: string,
    period: Period,
  ): Promise<IndicatorSnapshot> {
    this.validatePeriod(period);
    await this.validateMachine(machineId);
    const [downtimes, productionEntries]: [
      Downtime[],
      ProductionEntry[],
    ] = await Promise.all([
      prisma.downtime.findMany({
        where: {
          machineId,
          startedAt: { lt: period.periodEnd },
          OR: [{ endedAt: null }, { endedAt: { gt: period.periodStart } }],
        },
      }),
      prisma.productionEntry.findMany({
        where: {
          machineId,
          periodStart: { lt: period.periodEnd },
          periodEnd: { gt: period.periodStart },
        },
      }),
    ]);
    const downtimeTotals: DowntimeTotals = this.aggregateDowntimes(
      downtimes,
      period,
    );
    const productionTotals: ProductionTotals = this.aggregateProduction(
      productionEntries,
      period,
    );
    const operatingMinutes: number = Math.max(
      0,
      productionTotals.openingMinutes - downtimeTotals.downtimeMinutes,
    );
    const availability: number = calculateAvailability({
      operatingMinutes,
      downtimeMinutes: downtimeTotals.downtimeMinutes,
    });
    const performance: number = calculatePerformance({
      quantityProduced: productionTotals.quantityProduced,
      theoreticalCycleSec:
        productionTotals.quantityProduced > 0
          ? productionTotals.idealOperatingSeconds /
            productionTotals.quantityProduced
          : 0,
      operatingMinutes,
    });
    const quality: number = calculateQuality({
      quantityGood: productionTotals.quantityGood,
      quantityProduced: productionTotals.quantityProduced,
    });
    const snapshotData = {
      mtbfHours: calculateMtbfHours({
        operatingMinutes,
        failureCount: downtimeTotals.failureCount,
      }),
      mttrMinutes: calculateMttrMinutes({
        repairMinutesTotal: downtimeTotals.repairMinutesTotal,
        failureCount: downtimeTotals.failureCount,
      }),
      availability,
      performance,
      quality,
      trs: calculateTrs({ availability, performance, quality }),
      calculatedAt: new Date(),
    };
    return prisma.indicatorSnapshot.upsert({
      where: {
        machineId_periodStart: {
          machineId,
          periodStart: period.periodStart,
        },
      },
      create: {
        machineId,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        ...snapshotData,
      },
      update: snapshotData,
    });
  }

  private aggregateDowntimes(
    downtimes: readonly Downtime[],
    period: Period,
  ): DowntimeTotals {
    return downtimes.reduce<DowntimeTotals>(
      (totals: DowntimeTotals, downtime: Downtime): DowntimeTotals => {
        const durationMinutes: number = calculateOverlapMinutes(
          downtime.startedAt,
          downtime.endedAt ?? period.periodEnd,
          period,
        );
        const isFailure: boolean = FAILURE_TYPES.includes(downtime.type);
        return {
          downtimeMinutes: totals.downtimeMinutes + durationMinutes,
          failureCount: totals.failureCount + (isFailure ? 1 : 0),
          repairMinutesTotal:
            totals.repairMinutesTotal + (isFailure ? durationMinutes : 0),
        };
      },
      { downtimeMinutes: 0, failureCount: 0, repairMinutesTotal: 0 },
    );
  }

  private aggregateProduction(
    entries: readonly ProductionEntry[],
    period: Period,
  ): ProductionTotals {
    return entries.reduce<ProductionTotals>(
      (
        totals: ProductionTotals,
        entry: ProductionEntry,
      ): ProductionTotals => {
        const overlapRatio: number = calculateProductionRatio(entry, period);
        const quantityProduced: number =
          entry.quantityProduced * overlapRatio;
        return {
          idealOperatingSeconds:
            totals.idealOperatingSeconds +
            quantityProduced * entry.theoreticalCycleSec,
          openingMinutes:
            totals.openingMinutes + entry.openingMinutes * overlapRatio,
          quantityGood:
            totals.quantityGood + entry.quantityGood * overlapRatio,
          quantityProduced: totals.quantityProduced + quantityProduced,
        };
      },
      {
        idealOperatingSeconds: 0,
        openingMinutes: 0,
        quantityGood: 0,
        quantityProduced: 0,
      },
    );
  }

  private validatePeriod(period: Period): void {
    if (period.periodStart >= period.periodEnd)
      throw new BadRequestException("periodStart must be before periodEnd");
  }

  private async validateMachine(machineId: string): Promise<void> {
    const machine: Pick<Machine, "id"> | null =
      await prisma.machine.findUnique({
        where: { id: machineId },
        select: { id: true },
      });
    if (!machine)
      throw new NotFoundException(`Machine ${machineId} not found`);
  }
}
