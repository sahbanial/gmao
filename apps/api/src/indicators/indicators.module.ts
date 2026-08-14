import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { IndicatorsController } from "./indicators.controller";
import { IndicatorsService } from "./indicators.service";

/**
 * Configures KPI recalculation and snapshot persistence.
 */
@Module({
  imports: [AuthModule],
  controllers: [IndicatorsController],
  providers: [IndicatorsService],
})
export class IndicatorsModule {}
