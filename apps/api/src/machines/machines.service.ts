import { prisma, type Component, type Machine } from "@gmao/database";
import { computeCriticality, resolveCriticalityLevel } from "@gmao/shared";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateComponentDto } from "./dto/create-component.dto";
import type { CreateMachineDto } from "./dto/create-machine.dto";

interface MachineWithComponents extends Machine {
  readonly components: readonly Component[];
}

/**
 * Provides machine catalog and AMDEC component operations.
 */
@Injectable()
export class MachinesService {
  /**
   * Lists machines by ascending code.
   */
  public async getAll(): Promise<Machine[]> {
    return prisma.machine.findMany({ orderBy: { code: "asc" } });
  }

  /**
   * Finds a machine by code with components ordered by decreasing criticality.
   */
  public async getByCode(code: string): Promise<MachineWithComponents> {
    const machine: MachineWithComponents | null = await prisma.machine.findUnique({
      where: { code },
      include: {
        components: {
          orderBy: [{ criticality: "desc" }, { name: "asc" }],
        },
      },
    });
    if (!machine) throw new NotFoundException(`Machine ${code} not found`);
    return machine;
  }

  /**
   * Creates a machine.
   */
  public async createMachine(input: CreateMachineDto): Promise<Machine> {
    return prisma.machine.create({
      data: {
        code: input.code,
        designation: input.designation,
        workshop: input.workshop,
        line: input.line,
        commissionedAt: input.commissionedAt
          ? new Date(input.commissionedAt)
          : undefined,
      },
    });
  }

  /**
   * Creates a component and derives its AMDEC criticality.
   */
  public async createComponent(
    machineId: string,
    input: CreateComponentDto,
  ): Promise<Component> {
    const machine: Pick<Machine, "id"> | null = await prisma.machine.findUnique({
      where: { id: machineId },
      select: { id: true },
    });
    if (!machine) throw new NotFoundException(`Machine ${machineId} not found`);
    const criticality: number = computeCriticality(
      input.severity,
      input.frequency,
      input.detection,
    );
    return prisma.component.create({
      data: {
        machineId: machine.id,
        name: input.name,
        severity: input.severity,
        frequency: input.frequency,
        detection: input.detection,
        criticality,
        level: resolveCriticalityLevel(criticality),
      },
    });
  }
}
