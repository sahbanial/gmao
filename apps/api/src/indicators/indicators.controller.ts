import type { IndicatorSnapshot } from "@gmao/database";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ListIndicatorsQueryDto } from "./dto/list-indicators-query.dto";
import { RecalculateIndicatorsDto } from "./dto/recalculate-indicators.dto";
import { IndicatorsService } from "./indicators.service";

/**
 * Exposes authenticated KPI snapshot endpoints.
 */
@Controller("indicators")
@UseGuards(JwtAuthGuard)
export class IndicatorsController {
  public constructor(private readonly indicatorsService: IndicatorsService) {}

  /**
   * Recalculates and persists one snapshot.
   */
  @Post("recalculate")
  public async recalculate(
    @Body() input: RecalculateIndicatorsDto,
  ): Promise<IndicatorSnapshot> {
    return this.indicatorsService.recalculate(input);
  }

  /**
   * Lists snapshots overlapping the requested period.
   */
  @Get()
  public async getAll(
    @Query() query: ListIndicatorsQueryDto,
  ): Promise<IndicatorSnapshot[]> {
    return this.indicatorsService.getAll(query);
  }
}
