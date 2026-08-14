import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

/**
 * Validates machine creation input.
 */
export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  public readonly code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  public readonly designation!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public readonly workshop!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public readonly line!: string;

  @IsOptional()
  @IsDateString()
  public readonly commissionedAt?: string;
}
