import type { User } from "@gmao/database";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { PublicUser } from "../users/public-user.interface";
import { UsersService } from "../users/users.service";
import type { AuthResult } from "./auth-result.interface";
import type { LoginDto } from "./login.dto";

const INVALID_CREDENTIALS_MESSAGE: string = "Invalid credentials";

function mapPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    workshop: user.workshop,
  };
}

/**
 * Authenticates users and issues signed access tokens.
 */
@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verifies credentials and returns a JWT with the authenticated user.
   */
  public async login(input: LoginDto): Promise<AuthResult> {
    const user: User | null = await this.usersService.findByEmail(input.email);
    if (!user?.isActive) throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    const isPasswordValid: boolean = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    const accessToken: string = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });
    return { accessToken, user: mapPublicUser(user) };
  }
}
