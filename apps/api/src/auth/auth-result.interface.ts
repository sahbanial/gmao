import type { PublicUser } from "../users/public-user.interface";

export interface AuthResult {
  readonly accessToken: string;
  readonly user: PublicUser;
}
