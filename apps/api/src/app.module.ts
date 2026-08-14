import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";

/**
 * Configures the API application.
 */
@Module({
  controllers: [HealthController],
})
export class AppModule {}
