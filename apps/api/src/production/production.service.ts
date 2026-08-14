import {
  prisma,
  type Machine,
  type Prisma,
  type ProductionEntry,
} from "@gmao/database";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CreateProductionEntryDto } from "./dto/create-production-entry.dto";
import type { ListProductionQueryDto } from "./dto/list-production-query.dto";

/**
 * Stores and retrieves production inputs used by the indicator engine.
 */
@Injectable()
export class ProductionService {
  /**
   * Creates one production entry after validating its machine and period.
   */
  public async create(
    input: CreateProductionEntryDto,
  ): Promise<ProductionEntry> {
    const periodStart: Date = new Date(input.periodStart);
    const periodEnd: Date = new Date(input.periodEnd);
    this.validatePeriod(periodStart, periodEnd);
    if (input.quantityGood > input.quantityProduced)
      throw new BadRequestException(
        "quantityGood must be less than or equal to quantityProduced",
      );
    const machine: Pick<Machine, "id"> | null =
      await prisma.machine.findUnique({
        where: { id: input.machineId },
        select: { id: true },
      });
    if (!machine)
      throw new NotFoundException(`Machine ${input.machineId} not found`);
    return prisma.productionEntry.create({
      data: {
        ...input,
        periodStart,
        periodEnd,
      },
    });
  }

  /**
   * Lists production entries overlapping the requested period.
   */
  public async getAll(
    query: ListProductionQueryDto,
  ): Promise<ProductionEntry[]> {
    const periodStart: Date | undefined = query.periodStart
      ? new Date(query.periodStart)
      : undefined;
    const periodEnd: Date | undefined = query.periodEnd
      ? new Date(query.periodEnd)
      : undefined;
    if (periodStart && periodEnd) this.validatePeriod(periodStart, periodEnd);
    const where: Prisma.ProductionEntryWhereInput = {
      machineId: query.machineId,
      periodStart: periodEnd ? { lt: periodEnd } : undefined,
      periodEnd: periodStart ? { gt: periodStart } : undefined,
    };
    return prisma.productionEntry.findMany({
      where,
      orderBy: { periodStart: "desc" },
    });
  }

  private validatePeriod(periodStart: Date, periodEnd: Date): void {
    if (periodStart >= periodEnd)
      throw new BadRequestException("periodStart must be before periodEnd");
  }
}
