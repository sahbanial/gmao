import type { Role } from "@gmao/shared";

export interface PublicUser {
  readonly id: string;
  readonly employeeCode: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: Role;
  readonly workshop: string | null;
}
