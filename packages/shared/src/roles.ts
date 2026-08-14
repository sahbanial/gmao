export const ROLES = ["OPERATOR", "TECHNICIAN", "MANAGER", "ADMIN"] as const;

export type Role = (typeof ROLES)[number];
