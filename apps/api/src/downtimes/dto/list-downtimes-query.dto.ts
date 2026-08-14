import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * Validates downtime list filters.
 */
export class ListDowntimesQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly machineId?: string;

  @IsOptional()
  @IsDateString()
  public readonly from?: string;

  @IsOptional()
  @IsDateString()
  public readonly to?: string;
}
