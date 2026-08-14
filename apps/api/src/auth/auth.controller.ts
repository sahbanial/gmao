import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { PublicUser } from "../users/public-user.interface";
import type { AuthResult } from "./auth-result.interface";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LoginDto } from "./login.dto";

interface AuthenticatedRequest extends Request {
  readonly user: PublicUser;
}

/**
 * Exposes authentication endpoints.
 */
@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  /**
   * Authenticates credentials and returns an access token.
   */
  @Post("login")
  public async login(@Body() input: LoginDto): Promise<AuthResult> {
    return this.authService.login(input);
  }

  /**
   * Returns the current authenticated user.
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  public getCurrentUser(@Req() request: AuthenticatedRequest): PublicUser {
    return request.user;
  }
}
