import type { Role } from "@gmao/shared";

export interface JwtPayload {
  readonly sub: string;
  readonly role: Role;
}
