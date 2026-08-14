import type { ProductionEntry } from "@gmao/database";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProductionEntryDto } from "./dto/create-production-entry.dto";
import { ListProductionQueryDto } from "./dto/list-production-query.dto";
import { ProductionService } from "./production.service";

/**
 * Exposes authenticated production input endpoints.
 */
@Controller("production")
@UseGuards(JwtAuthGuard)
export class ProductionController {
  public constructor(private readonly productionService: ProductionService) {}

  /**
   * Creates one production entry.
   */
  @Post()
  public async create(
    @Body() input: CreateProductionEntryDto,
  ): Promise<ProductionEntry> {
    return this.productionService.create(input);
  }

  /**
   * Lists production entries for a machine and optional period.
   */
  @Get()
  public async getAll(
    @Query() query: ListProductionQueryDto,
  ): Promise<ProductionEntry[]> {
    return this.productionService.getAll(query);
  }
}
