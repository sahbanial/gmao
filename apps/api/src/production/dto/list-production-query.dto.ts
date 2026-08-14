import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * Validates production entry filters.
 */
export class ListProductionQueryDto {
  @IsString()
  @IsNotEmpty()
  public readonly machineId!: string;

  @IsOptional()
  @IsDateString()
  public readonly periodStart?: string;

  @IsOptional()
  @IsDateString()
  public readonly periodEnd?: string;
}
