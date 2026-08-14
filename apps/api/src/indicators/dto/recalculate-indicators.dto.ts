import { IsDateString, IsNotEmpty, IsString } from "class-validator";

/**
 * Validates a KPI recalculation period.
 */
export class RecalculateIndicatorsDto {
  @IsString()
  @IsNotEmpty()
  public readonly machineId!: string;

  @IsDateString()
  public readonly periodStart!: string;

  @IsDateString()
  public readonly periodEnd!: string;
}
