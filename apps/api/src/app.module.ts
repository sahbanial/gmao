import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { MachinesModule } from "./machines/machines.module";

/**
 * Configures the API application.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", "../../.env"],
      isGlobal: true,
    }),
    AuthModule,
    MachinesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
