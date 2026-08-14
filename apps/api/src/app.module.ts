import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AuthModule } from "./auth/auth.module";
import { DowntimesModule } from "./downtimes/downtimes.module";
import { HealthController } from "./health/health.controller";
import { IndicatorsModule } from "./indicators/indicators.module";
import { MachinesModule } from "./machines/machines.module";
import { ProductionModule } from "./production/production.module";

/**
 * Configures the API application.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", "../../.env"],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    MachinesModule,
    DowntimesModule,
    ProductionModule,
    IndicatorsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
