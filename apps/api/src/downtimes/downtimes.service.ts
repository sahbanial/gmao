import {
  prisma,
  type Component,
  type Downtime,
  type Machine,
  type Prisma,
} from "@gmao/database";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { EndDowntimeDto } from "./dto/end-downtime.dto";
import type { ListDowntimesQueryDto } from "./dto/list-downtimes-query.dto";
import type { StartDowntimeDto } from "./dto/start-downtime.dto";

const DOWNTIME_CHANGED_EVENT: string = "downtime.changed";
const MILLISECONDS_PER_MINUTE: number = 60_000;

interface DowntimeChangedEvent {
  readonly downtimeId: string;
  readonly machineId: string;
  readonly operation: "started" | "ended";
}

function calculateDurationMinutes(startedAt: Date, endedAt: Date): number {
  return Math.round(
    (endedAt.getTime() - startedAt.getTime()) / MILLISECONDS_PER_MINUTE,
  );
}

/**
 * Manages downtime declarations and their audit trail.
 */
@Injectable()
export class DowntimesService {
  public constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Starts a downtime declaration for an authenticated user.
   */
  public async start(
    input: StartDowntimeDto,
    declarantId: string,
  ): Promise<Downtime> {
    const downtime: Downtime = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient): Promise<Downtime> => {
        await this.validateMachineAndComponent(
          transaction,
          input.machineId,
          input.componentId,
        );
        const openDowntime: Pick<Downtime, "id"> | null =
          await transaction.downtime.findFirst({
            where: { machineId: input.machineId, endedAt: null },
            select: { id: true },
          });
        if (openDowntime)
          throw new ConflictException("Machine already has an open downtime");
        const createdDowntime: Downtime = await transaction.downtime.create({
          data: {
            machineId: input.machineId,
            componentId: input.componentId,
            type: input.type,
            startedAt: input.startedAt ? new Date(input.startedAt) : new Date(),
            cause: input.cause,
            declarantId,
          },
        });
        await transaction.auditLog.create({
          data: {
            userId: declarantId,
            action: "DOWNTIME_STARTED",
            entity: "Downtime",
            entityId: createdDowntime.id,
            metadata: {
              machineId: createdDowntime.machineId,
              type: createdDowntime.type,
            },
          },
        });
        return createdDowntime;
      },
    );
    this.emitDowntimeChanged(downtime, "started");
    return downtime;
  }

  /**
   * Ends an open downtime and computes its duration in minutes.
   */
  public async end(
    downtimeId: string,
    input: EndDowntimeDto,
    userId: string,
  ): Promise<Downtime> {
    const downtime: Downtime = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient): Promise<Downtime> => {
        const existingDowntime: Downtime | null =
          await transaction.downtime.findUnique({ where: { id: downtimeId } });
        if (!existingDowntime)
          throw new NotFoundException(`Downtime ${downtimeId} not found`);
        if (existingDowntime.endedAt)
          throw new ConflictException(`Downtime ${downtimeId} is already ended`);
        const endedAt: Date = input.endedAt ? new Date(input.endedAt) : new Date();
        if (endedAt < existingDowntime.startedAt)
          throw new BadRequestException("endedAt must be after or equal to startedAt");
        const durationMin: number = calculateDurationMinutes(
          existingDowntime.startedAt,
          endedAt,
        );
        const updateResult: Prisma.BatchPayload =
          await transaction.downtime.updateMany({
            where: { id: downtimeId, endedAt: null },
            data: { endedAt, durationMin },
          });
        if (updateResult.count === 0)
          throw new ConflictException(`Downtime ${downtimeId} is already ended`);
        const updatedDowntime: Downtime =
          await transaction.downtime.findUniqueOrThrow({
            where: { id: downtimeId },
          });
        await transaction.auditLog.create({
          data: {
            userId,
            action: "DOWNTIME_ENDED",
            entity: "Downtime",
            entityId: updatedDowntime.id,
            metadata: { endedAt: endedAt.toISOString(), durationMin },
          },
        });
        return updatedDowntime;
      },
    );
    this.emitDowntimeChanged(downtime, "ended");
    return downtime;
  }

  /**
   * Lists downtime declarations matching optional filters.
   */
  public async getAll(query: ListDowntimesQueryDto): Promise<Downtime[]> {
    const from: Date | undefined = query.from ? new Date(query.from) : undefined;
    const to: Date | undefined = query.to ? new Date(query.to) : undefined;
    if (from && to && from > to)
      throw new BadRequestException("from must be before or equal to to");
    const where: Prisma.DowntimeWhereInput = {
      machineId: query.machineId,
      startedAt: { gte: from, lte: to },
    };
    return prisma.downtime.findMany({
      where,
      orderBy: { startedAt: "desc" },
    });
  }

  private async validateMachineAndComponent(
    transaction: Prisma.TransactionClient,
    machineId: string,
    componentId?: string,
  ): Promise<void> {
    const machine: Pick<Machine, "id"> | null =
      await transaction.machine.findUnique({
        where: { id: machineId },
        select: { id: true },
      });
    if (!machine) throw new NotFoundException(`Machine ${machineId} not found`);
    if (!componentId) return;
    const component: Pick<Component, "machineId"> | null =
      await transaction.component.findUnique({
        where: { id: componentId },
        select: { machineId: true },
      });
    if (!component)
      throw new NotFoundException(`Component ${componentId} not found`);
    if (component.machineId !== machineId)
      throw new BadRequestException("Component does not belong to the machine");
  }

  private emitDowntimeChanged(
    downtime: Downtime,
    operation: DowntimeChangedEvent["operation"],
  ): void {
    const event: DowntimeChangedEvent = {
      downtimeId: downtime.id,
      machineId: downtime.machineId,
      operation,
    };
    this.eventEmitter.emit(DOWNTIME_CHANGED_EVENT, event);
  }
}
