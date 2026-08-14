import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";

/**
 * Validates AMDEC component creation input.
 */
export class CreateComponentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  public readonly name!: string;

  @IsInt()
  @Min(1)
  public readonly severity!: number;

  @IsInt()
  @Min(1)
  public readonly frequency!: number;

  @IsInt()
  @Min(1)
  public readonly detection!: number;
}
