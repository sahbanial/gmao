import { DOWNTIME_TYPES, type DowntimeType } from "@gmao/shared";
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

/**
 * Validates downtime declaration input.
 */
export class StartDowntimeDto {
  @IsString()
  @IsNotEmpty()
  public readonly machineId!: string;

  @IsIn(DOWNTIME_TYPES)
  public readonly type!: DowntimeType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly componentId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  public readonly cause?: string;

  @IsOptional()
  @IsDateString()
  public readonly startedAt?: string;
}
