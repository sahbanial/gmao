import { prisma, type User } from "@gmao/database";
import { Injectable } from "@nestjs/common";
import type { PublicUser } from "./public-user.interface";

/**
 * Provides user lookups and safe user projections.
 */
@Injectable()
export class UsersService {
  /**
   * Finds a user by email, including authentication fields.
   */
  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Finds an active user by identifier and returns public fields only.
   */
  public async findActivePublicById(id: string): Promise<PublicUser | null> {
    return prisma.user.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        workshop: true,
      },
    });
  }
}
