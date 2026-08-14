import { prisma } from "@gmao/database";
import { MachinesService } from "./machines.service";

const TEST_MACHINE_CODE: string = "MA03-TASK-6";

describe("MachinesService", () => {
  const service: MachinesService = new MachinesService();
  let machineId: string;

  beforeAll(async (): Promise<void> => {
    await prisma.component.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.machine.deleteMany({ where: { code: TEST_MACHINE_CODE } });
    const machine = await prisma.machine.create({
      data: {
        code: TEST_MACHINE_CODE,
        designation: "Test machining center",
        workshop: "Machining",
        line: "Line 3",
        components: {
          create: [
            {
              name: "Low criticality component",
              severity: 1,
              frequency: 1,
              detection: 1,
              criticality: 1,
              level: "NEGLIGIBLE",
            },
            {
              name: "High criticality component",
              severity: 6,
              frequency: 3,
              detection: 1,
              criticality: 18,
              level: "HIGH",
            },
          ],
        },
      },
    });
    machineId = machine.id;
  });

  afterAll(async (): Promise<void> => {
    await prisma.component.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.machine.deleteMany({ where: { code: TEST_MACHINE_CODE } });
    await prisma.$disconnect();
  });

  it("returns MA03 with HIGH component first", async (): Promise<void> => {
    const machine = await service.getByCode(TEST_MACHINE_CODE);
    expect(machine.components[0]?.level).toBe("HIGH");
    expect(machine.components.map((component) => component.criticality)).toEqual([18, 1]);
  });

  it("computes criticality when creating a component", async (): Promise<void> => {
    const component = await service.createComponent(machineId, {
      name: "Medium criticality component",
      severity: 4,
      frequency: 2,
      detection: 1,
    });
    expect(component).toMatchObject({
      criticality: 8,
      level: "MEDIUM",
    });
  });
});
