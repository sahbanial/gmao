import type { Component, Machine } from "@gmao/database";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateComponentDto } from "./dto/create-component.dto";
import { CreateMachineDto } from "./dto/create-machine.dto";
import { MachinesService } from "./machines.service";

interface MachineWithComponents extends Machine {
  readonly components: readonly Component[];
}

/**
 * Exposes machine catalog and AMDEC component endpoints.
 */
@Controller("machines")
export class MachinesController {
  public constructor(private readonly machinesService: MachinesService) {}

  /**
   * Lists all machines.
   */
  @Get()
  public async getAll(): Promise<Machine[]> {
    return this.machinesService.getAll();
  }

  /**
   * Returns a machine and its components by machine code.
   */
  @Get(":code")
  public async getByCode(@Param("code") code: string): Promise<MachineWithComponents> {
    return this.machinesService.getByCode(code);
  }

  /**
   * Creates a machine for administrators.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  public async createMachine(@Body() input: CreateMachineDto): Promise<Machine> {
    return this.machinesService.createMachine(input);
  }

  /**
   * Creates an AMDEC component for administrators and managers.
   */
  @Post(":id/components")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  public async createComponent(
    @Param("id") machineId: string,
    @Body() input: CreateComponentDto,
  ): Promise<Component> {
    return this.machinesService.createComponent(machineId, input);
  }
}
