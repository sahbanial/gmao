import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";

/**
 * Exposes user lookup operations to application modules.
 */
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
