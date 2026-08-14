import { IsDateString, IsOptional } from "class-validator";

/**
 * Validates downtime closure input.
 */
export class EndDowntimeDto {
  @IsOptional()
  @IsDateString()
  public readonly endedAt?: string;
}
