import type { Downtime } from "@gmao/database";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { PublicUser } from "../users/public-user.interface";
import { DowntimesService } from "./downtimes.service";
import { EndDowntimeDto } from "./dto/end-downtime.dto";
import { ListDowntimesQueryDto } from "./dto/list-downtimes-query.dto";
import { StartDowntimeDto } from "./dto/start-downtime.dto";

interface AuthenticatedRequest extends Request {
  readonly user: PublicUser;
}

/**
 * Exposes authenticated downtime declaration endpoints.
 */
@Controller("downtimes")
@UseGuards(JwtAuthGuard)
export class DowntimesController {
  public constructor(private readonly downtimesService: DowntimesService) {}

  /**
   * Starts a downtime declaration.
   */
  @Post()
  public async start(
    @Body() input: StartDowntimeDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Downtime> {
    return this.downtimesService.start(input, request.user.id);
  }

  /**
   * Ends an existing downtime declaration.
   */
  @Patch(":id/end")
  public async end(
    @Param("id") downtimeId: string,
    @Body() input: EndDowntimeDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Downtime> {
    return this.downtimesService.end(downtimeId, input, request.user.id);
  }

  /**
   * Lists downtime declarations matching optional filters.
   */
  @Get()
  public async getAll(
    @Query() query: ListDowntimesQueryDto,
  ): Promise<Downtime[]> {
    return this.downtimesService.getAll(query);
  }
}
