import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

const DEFAULT_PORT: number = 3001;
const DEFAULT_CORS_ORIGIN: string = "http://localhost:5173";
const LISTEN_HOST: string = "0.0.0.0";

function resolveCorsOrigins(): string[] {
  const raw: string = process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN;
  return raw
    .split(",")
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);
}

async function bootstrap(): Promise<void> {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.enableCors({ origin: resolveCorsOrigins() });
  const port: number = Number(process.env.PORT ?? DEFAULT_PORT);
  await app.listen(port, LISTEN_HOST);
}

void bootstrap();
