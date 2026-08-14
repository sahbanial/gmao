import { prisma } from "@gmao/database";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { DashboardResponse } from "./dashboard-response.interface";

const DEFAULT_TRS_TARGET = 0.6;
const DEFAULT_AVAILABILITY_TARGET = 0.85;
const RECENT_ACTIVITY_LIMIT = 10;

/**
 * Aggregates machine dashboard data for the PWA home screen.
 */
@Injectable()
export class DashboardService {
  /**
   * Builds the dashboard payload for a machine code.
   */
  public async getByMachineCode(machineCode: string): Promise<DashboardResponse> {
    const machine = await prisma.machine.findUnique({
      where: { code: machineCode },
    });
    if (!machine) throw new NotFoundException(`Machine ${machineCode} not found`);
    const [openDowntime, latestSnapshot, latestProduction, recentDowntimes, settings] =
      await Promise.all([
        prisma.downtime.findFirst({
          where: { machineId: machine.id, endedAt: null },
          orderBy: { startedAt: "desc" },
        }),
        prisma.indicatorSnapshot.findFirst({
          where: { machineId: machine.id },
          orderBy: { calculatedAt: "desc" },
        }),
        prisma.productionEntry.findFirst({
          where: { machineId: machine.id },
          orderBy: { periodEnd: "desc" },
        }),
        prisma.downtime.findMany({
          where: { machineId: machine.id },
          orderBy: { startedAt: "desc" },
          take: RECENT_ACTIVITY_LIMIT,
        }),
        prisma.systemSetting.findMany({
          where: {
            key: { in: ["kpi.target.trs", "kpi.target.availability"] },
          },
        }),
      ]);
    const settingMap = new Map(settings.map((item) => [item.key, item.value]));
    const trsTarget = Number(settingMap.get("kpi.target.trs") ?? DEFAULT_TRS_TARGET);
    const availabilityTarget = Number(
      settingMap.get("kpi.target.availability") ?? DEFAULT_AVAILABILITY_TARGET,
    );
    return {
      machine: {
        code: machine.code,
        designation: machine.designation,
        line: machine.line,
        status: openDowntime ? "DOWN" : "RUNNING",
      },
      updatedAt: new Date().toISOString(),
      kpis: {
        trs: {
          value: latestSnapshot?.trs ?? 0,
          target: Number.isFinite(trsTarget) ? trsTarget : DEFAULT_TRS_TARGET,
        },
        availability: {
          value: latestSnapshot?.availability ?? 0,
          target: Number.isFinite(availabilityTarget)
            ? availabilityTarget
            : DEFAULT_AVAILABILITY_TARGET,
        },
        mtbfHours: latestSnapshot?.mtbfHours ?? 0,
        mttrMinutes: latestSnapshot?.mttrMinutes ?? 0,
      },
      production: latestProduction
        ? {
            workOrderCode: latestProduction.workOrderCode,
            quantityGood: latestProduction.quantityGood,
            quantityProduced: latestProduction.quantityProduced,
          }
        : null,
      recentActivity: recentDowntimes.map((item) => ({
        id: item.id,
        type: item.type,
        label: item.cause ?? item.type,
        at: item.startedAt.toISOString(),
      })),
    };
  }
}
