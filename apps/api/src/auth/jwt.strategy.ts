import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { PublicUser } from "../users/public-user.interface";
import { UsersService } from "../users/users.service";
import type { JwtPayload } from "./jwt-payload.interface";

/**
 * Validates bearer tokens and resolves their active users.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  /**
   * Resolves the public user attached to an authenticated request.
   */
  public async validate(payload: JwtPayload): Promise<PublicUser> {
    const user: PublicUser | null =
      await this.usersService.findActivePublicById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
