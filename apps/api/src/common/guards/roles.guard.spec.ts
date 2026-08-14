import type { Role } from "@gmao/shared";
import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { PublicUser } from "../../users/public-user.interface";
import { RolesGuard } from "./roles.guard";

function createContext(role: Role): ExecutionContext {
  const user: PublicUser = {
    id: "user-id",
    employeeCode: "EMP-001",
    firstName: "Test",
    lastName: "User",
    email: "test@gmao.local",
    role,
    workshop: null,
  };
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  let reflector: jest.Mocked<Pick<Reflector, "getAllAndOverride">>;
  let rolesGuard: RolesGuard;

  beforeEach((): void => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    rolesGuard = new RolesGuard(reflector as unknown as Reflector);
  });

  it("allows routes without role metadata", (): void => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(rolesGuard.canActivate(createContext("OPERATOR"))).toBe(true);
  });

  it("allows a user with a required role", (): void => {
    reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
    expect(rolesGuard.canActivate(createContext("ADMIN"))).toBe(true);
  });

  it("rejects a user without a required role", (): void => {
    reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
    expect(rolesGuard.canActivate(createContext("TECHNICIAN"))).toBe(false);
  });
});
