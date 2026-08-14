import type { User } from "@gmao/database";
import type { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import type { UsersService } from "../users/users.service";

const VALID_PASSWORD: string = "SecurePassword123!";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, "findByEmail">>;
  let jwtService: jest.Mocked<Pick<JwtService, "signAsync">>;
  let activeUser: User;

  beforeAll(async (): Promise<void> => {
    activeUser = {
      id: "user-id",
      employeeCode: "EMP-001",
      firstName: "Olivia",
      lastName: "Operator",
      email: "op@gmao.local",
      passwordHash: await bcrypt.hash(VALID_PASSWORD, 4),
      role: "OPERATOR",
      workshop: "Assembly",
      isActive: true,
      createdAt: new Date("2026-08-14T00:00:00.000Z"),
      updatedAt: new Date("2026-08-14T00:00:00.000Z"),
    };
  });

  beforeEach((): void => {
    usersService = {
      findByEmail: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue("signed-token"),
    };
    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it("returns a token and public user for valid credentials", async (): Promise<void> => {
    usersService.findByEmail.mockResolvedValue(activeUser);
    const actualResult = await authService.login({
      email: activeUser.email,
      password: VALID_PASSWORD,
    });
    expect(actualResult).toEqual({
      accessToken: "signed-token",
      user: {
        id: activeUser.id,
        employeeCode: activeUser.employeeCode,
        firstName: activeUser.firstName,
        lastName: activeUser.lastName,
        email: activeUser.email,
        role: activeUser.role,
        workshop: activeUser.workshop,
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: activeUser.id,
      role: activeUser.role,
    });
  });

  it("rejects an invalid password", async (): Promise<void> => {
    usersService.findByEmail.mockResolvedValue(activeUser);
    await expect(
      authService.login({
        email: activeUser.email,
        password: "wrong",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects an inactive user", async (): Promise<void> => {
    usersService.findByEmail.mockResolvedValue({
      ...activeUser,
      isActive: false,
    });
    await expect(
      authService.login({
        email: activeUser.email,
        password: VALID_PASSWORD,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
