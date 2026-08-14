import { IsDateString, IsNotEmpty, IsString } from "class-validator";

/**
 * Validates indicator snapshot filters.
 */
export class ListIndicatorsQueryDto {
  @IsString()
  @IsNotEmpty()
  public readonly machineId!: string;

  @IsDateString()
  public readonly periodStart!: string;

  @IsDateString()
  public readonly periodEnd!: string;
}
