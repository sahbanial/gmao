import { prisma } from "@gmao/database";
import { DashboardService } from "./dashboard.service";

const TEST_MACHINE_CODE: string = "MA03-TASK-4";
const TEST_USER_EMAIL: string = "task4@gmao.local";

describe("DashboardService", () => {
  const service: DashboardService = new DashboardService();
  let machineId: string;
  let userId: string;

  beforeAll(async (): Promise<void> => {
    // Clean up existing data
    await prisma.downtime.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.productionEntry.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.indicatorSnapshot.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.component.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.machine.deleteMany({ where: { code: TEST_MACHINE_CODE } });
    await prisma.user.deleteMany({ where: { email: TEST_USER_EMAIL } });

    // Create test user
    const user = await prisma.user.create({
      data: {
        employeeCode: "EMP-TASK-4",
        email: TEST_USER_EMAIL,
        firstName: "Task4",
        lastName: "TestUser",
        passwordHash: "hashed_password",
        role: "OPERATOR",
      },
    });
    userId = user.id;

    // Create test machine with components
    const machine = await prisma.machine.create({
      data: {
        code: TEST_MACHINE_CODE,
        designation: "Test machine for task 4",
        workshop: "Test Workshop",
        line: "Test Line",
        components: {
          create: [
            {
              name: "Test component 1",
              severity: 3,
              frequency: 2,
              detection: 1,
              criticality: 6,
              level: "MEDIUM",
            },
          ],
        },
      },
    });
    machineId = machine.id;
  });

  afterAll(async (): Promise<void> => {
    // Clean up test data
    await prisma.downtime.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.productionEntry.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.indicatorSnapshot.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.component.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.machine.deleteMany({ where: { code: TEST_MACHINE_CODE } });
    await prisma.user.deleteMany({ where: { email: TEST_USER_EMAIL } });
    await prisma.$disconnect();
  });

  it("includes open downtime in dashboard response", async (): Promise<void> => {
    const open = await prisma.downtime.create({
      data: {
        machineId,
        type: "MECHANICAL_FAILURE",
        startedAt: new Date("2024-01-01T10:00:00Z"),
        cause: "Bearing failure",
        declarantId: userId,
      },
    });

    const actual = await service.getByMachineCode(TEST_MACHINE_CODE);

    expect(actual.openDowntime).toEqual({
      id: open.id,
      type: open.type,
      startedAt: open.startedAt.toISOString(),
      cause: open.cause,
    });
    expect(actual.machine.status).toBe("DOWN");
  });
});