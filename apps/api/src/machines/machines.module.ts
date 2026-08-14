import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MachinesController } from "./machines.controller";
import { MachinesService } from "./machines.service";

/**
 * Configures machine catalog and component operations.
 */
@Module({
  imports: [AuthModule],
  controllers: [MachinesController],
  providers: [MachinesService],
})
export class MachinesModule {}
