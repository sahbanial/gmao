import { IsEmail, IsString, MinLength } from "class-validator";

const MINIMUM_PASSWORD_LENGTH: number = 8;

/**
 * Credentials accepted by the login endpoint.
 */
export class LoginDto {
  @IsEmail()
  public readonly email!: string;

  @IsString()
  @MinLength(MINIMUM_PASSWORD_LENGTH)
  public readonly password!: string;
}
