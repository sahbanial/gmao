import { PrismaClient, type Role } from "@prisma/client";
import { hash } from "bcrypt";
import { computeCriticality, resolveCriticalityLevel } from "@gmao/shared";

const prisma = new PrismaClient();
const PASSWORD = "Password123!";

interface SeedUser {
  readonly email: string;
  readonly employeeCode: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: Role;
}

const users: readonly SeedUser[] = [
  {
    email: "operator@gmao.local",
    employeeCode: "OP001",
    firstName: "Ali",
    lastName: "Operateur",
    role: "OPERATOR",
  },
  {
    email: "tech@gmao.local",
    employeeCode: "TECH001",
    firstName: "Sami",
    lastName: "Technicien",
    role: "TECHNICIAN",
  },
  {
    email: "manager@gmao.local",
    employeeCode: "MGR001",
    firstName: "Leila",
    lastName: "Responsable",
    role: "MANAGER",
  },
  {
    email: "admin@gmao.local",
    employeeCode: "ADM001",
    firstName: "Admin",
    lastName: "Systeme",
    role: "ADMIN",
  },
];

async function seed(): Promise<void> {
  const passwordHash = await hash(PASSWORD, 10);
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        role: user.role,
        isActive: true,
      },
      create: {
        ...user,
        passwordHash,
        workshop: "APT solenoides",
      },
    });
  }
  const machine = await prisma.machine.upsert({
    where: { code: "MA03" },
    update: {
      designation: "Inserter",
      workshop: "A2",
      line: "L4",
      isActive: true,
    },
    create: {
      code: "MA03",
      designation: "Inserter",
      workshop: "A2",
      line: "L4",
      commissionedAt: new Date("2019-03-14T00:00:00.000Z"),
    },
  });
  await prisma.component.deleteMany({ where: { machineId: machine.id } });
  const components = [
    { name: "Outil SPAN", severity: 6, frequency: 3, detection: 1 },
    { name: "Vorschub", severity: 4, frequency: 3, detection: 1 },
    { name: "Moteur CC", severity: 2, frequency: 2, detection: 1 },
  ] as const;
  for (const item of components) {
    const criticality = computeCriticality(
      item.severity,
      item.frequency,
      item.detection,
    );
    await prisma.component.create({
      data: {
        machineId: machine.id,
        name: item.name,
        severity: item.severity,
        frequency: item.frequency,
        detection: item.detection,
        criticality,
        level: resolveCriticalityLevel(criticality),
      },
    });
  }
  const periodStart = new Date();
  periodStart.setUTCHours(0, 0, 0, 0);
  const periodEnd = new Date();
  await prisma.productionEntry.create({
    data: {
      machineId: machine.id,
      workOrderCode: "OF #88392",
      periodStart,
      periodEnd,
      theoreticalCycleSec: 6,
      quantityProduced: 5000,
      quantityGood: 4500,
      openingMinutes: 480,
    },
  });
  const span = await prisma.component.findFirst({
    where: { machineId: machine.id, name: "Outil SPAN" },
  });
  const operator = await prisma.user.findUniqueOrThrow({
    where: { email: "operator@gmao.local" },
  });
  await prisma.downtime.create({
    data: {
      machineId: machine.id,
      componentId: span?.id,
      type: "MECHANICAL_FAILURE",
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 75 * 60 * 1000),
      durationMin: 45,
      cause: "Convoyeur bloque",
      declarantId: operator.id,
    },
  });
  await prisma.systemSetting.upsert({
    where: { key: "kpi.target.trs" },
    update: { value: "0.60" },
    create: { key: "kpi.target.trs", value: "0.60" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "kpi.target.availability" },
    update: { value: "0.85" },
    create: { key: "kpi.target.availability", value: "0.85" },
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
