import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from "class-validator";

/**
 * Validates production data used by KPI calculations.
 */
export class CreateProductionEntryDto {
  @IsString()
  @IsNotEmpty()
  public readonly machineId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly workOrderCode?: string;

  @IsDateString()
  public readonly periodStart!: string;

  @IsDateString()
  public readonly periodEnd!: string;

  @IsNumber()
  @IsPositive()
  public readonly theoreticalCycleSec!: number;

  @IsInt()
  @Min(0)
  public readonly quantityProduced!: number;

  @IsInt()
  @Min(0)
  public readonly quantityGood!: number;

  @IsInt()
  @Min(0)
  public readonly openingMinutes!: number;
}
