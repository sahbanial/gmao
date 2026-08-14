import { ConflictException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { prisma } from "@gmao/database";
import { DowntimesService } from "./downtimes.service";

const TEST_MACHINE_CODE: string = "MA03-TASK-3";
const TEST_USER_EMAIL: string = "task3@gmao.local";

describe("DowntimesService", () => {
  const service: DowntimesService = new DowntimesService(new EventEmitter2());
  let machineId: string;
  let userId: string;

  beforeAll(async (): Promise<void> => {
    // Clean up existing data
    await prisma.downtime.deleteMany({
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
        employeeCode: "EMP-TASK-3",
        email: TEST_USER_EMAIL,
        firstName: "Task3",
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
        designation: "Test machine for task 3",
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
            {
              name: "Test component 2",
              severity: 2,
              frequency: 1,
              detection: 1,
              criticality: 2,
              level: "NEGLIGIBLE",
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
    await prisma.component.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.machine.deleteMany({ where: { code: TEST_MACHINE_CODE } });
    await prisma.user.deleteMany({ where: { email: TEST_USER_EMAIL } });
    await prisma.$disconnect();
  });

  afterEach(async (): Promise<void> => {
    // Clean up downtimes after each test
    await prisma.downtime.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
  });

  it("rejects a second open downtime for the same machine", async (): Promise<void> => {
    const first = await service.start(
      { machineId, type: "MECHANICAL_FAILURE" },
      userId,
    );
    expect(first.endedAt).toBeNull();
    await expect(
      service.start({ machineId, type: "ELECTRICAL_FAILURE" }, userId),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("allows a second start after ending the first downtime", async (): Promise<void> => {
    const first = await service.start(
      { machineId, type: "MECHANICAL_FAILURE" },
      userId,
    );
    expect(first.endedAt).toBeNull();
    
    await service.end(first.id, {}, userId);
    
    const second = await service.start(
      { machineId, type: "ELECTRICAL_FAILURE" },
      userId,
    );
    expect(second.endedAt).toBeNull();
  });
});