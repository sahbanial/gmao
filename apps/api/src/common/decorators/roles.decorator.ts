import type { Role } from "@gmao/shared";
import { SetMetadata } from "@nestjs/common";
import { ROLES_METADATA_KEY } from "./roles.constants";

/**
 * Declares the roles authorized to invoke a route.
 */
export function Roles(...roles: readonly Role[]): MethodDecorator & ClassDecorator {
  return SetMetadata(ROLES_METADATA_KEY, roles);
}
