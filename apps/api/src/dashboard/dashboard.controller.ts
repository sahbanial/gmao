import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { DashboardResponse } from "./dashboard-response.interface";
import { DashboardService } from "./dashboard.service";

/**
 * Exposes aggregated dashboard endpoints.
 */
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  public constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Returns dashboard data for a machine code.
   */
  @Get(":machineCode")
  public async getByMachineCode(
    @Param("machineCode") machineCode: string,
  ): Promise<DashboardResponse> {
    return this.dashboardService.getByMachineCode(machineCode);
  }
}
