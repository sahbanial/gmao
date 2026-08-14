import { Controller, Get } from "@nestjs/common";

interface HealthResponse {
  readonly status: "ok";
}

/**
 * Exposes the API health status.
 */
@Controller("health")
export class HealthController {
  /**
   * Returns the current API health status.
   */
  @Get()
  getHealth(): HealthResponse {
    return { status: "ok" };
  }
}
