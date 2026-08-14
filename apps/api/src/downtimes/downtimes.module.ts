import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DowntimesController } from "./downtimes.controller";
import { DowntimesService } from "./downtimes.service";

/**
 * Configures downtime declaration operations.
 */
@Module({
  imports: [AuthModule],
  controllers: [DowntimesController],
  providers: [DowntimesService],
})
export class DowntimesModule {}
