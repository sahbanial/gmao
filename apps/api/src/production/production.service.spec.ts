import { EventEmitter2 } from "@nestjs/event-emitter";
import { prisma } from "@gmao/database";
import { IndicatorsService } from "../indicators/indicators.service";
import { ProductionService } from "./production.service";

const TEST_MACHINE_CODE: string = "MA03-TASK-8";

describe("ProductionService", () => {
  const eventEmitter: EventEmitter2 = new EventEmitter2();
  const service: ProductionService = new ProductionService(eventEmitter);
  const indicatorsService: IndicatorsService = new IndicatorsService();
  let machineId: string;

  beforeAll(async (): Promise<void> => {
    eventEmitter.on(
      "production.changed",
      (event: { machineId: string }): Promise<void> => {
        return indicatorsService.handleProductionChanged(event);
      },
    );
    await prisma.indicatorSnapshot.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.productionEntry.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.machine.deleteMany({ where: { code: TEST_MACHINE_CODE } });
    const machine = await prisma.machine.create({
      data: {
        code: TEST_MACHINE_CODE,
        designation: "Test machine for task 8",
        workshop: "Test Workshop",
        line: "Test Line",
      },
    });
    machineId = machine.id;
  });

  afterAll(async (): Promise<void> => {
    await prisma.indicatorSnapshot.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.productionEntry.deleteMany({
      where: { machine: { code: TEST_MACHINE_CODE } },
    });
    await prisma.machine.deleteMany({ where: { code: TEST_MACHINE_CODE } });
    await prisma.$disconnect();
  });

  it("recalculates a KPI snapshot after a production entry", async (): Promise<void> => {
    const periodEnd: Date = new Date();
    const periodStart: Date = new Date(periodEnd);
    periodStart.setUTCHours(0, 0, 0, 0);
    await service.create({
      machineId,
      workOrderCode: "OF-TASK-8",
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      theoreticalCycleSec: 6,
      quantityProduced: 100,
      quantityGood: 90,
      openingMinutes: 480,
    });
    const snapshot = await prisma.indicatorSnapshot.findFirst({
      where: { machineId },
    });
    expect(snapshot).not.toBeNull();
    expect(snapshot?.quality).toBeCloseTo(0.9);
  });
});
