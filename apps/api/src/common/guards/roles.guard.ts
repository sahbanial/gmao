import type { Role } from "@gmao/shared";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { PublicUser } from "../../users/public-user.interface";
import { ROLES_METADATA_KEY } from "../decorators/roles.constants";

interface AuthenticatedRequest {
  readonly user: PublicUser;
}

/**
 * Authorizes authenticated users against route role metadata.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  /**
   * Allows unrestricted routes or users with one of the required roles.
   */
  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles: readonly Role[] | undefined =
      this.reflector.getAllAndOverride<readonly Role[]>(ROLES_METADATA_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (!requiredRoles?.length) return true;
    const request: AuthenticatedRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    return requiredRoles.includes(request.user.role);
  }
}
