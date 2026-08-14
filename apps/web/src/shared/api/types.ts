export type Role = "OPERATOR" | "TECHNICIAN" | "MANAGER" | "ADMIN";

export interface PublicUser {
  readonly id: string;
  readonly employeeCode: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: Role;
  readonly workshop: string | null;
}

export interface AuthResult {
  readonly accessToken: string;
  readonly user: PublicUser;
}

export interface DashboardResponse {
  readonly machine: {
    readonly code: string;
    readonly designation: string;
    readonly line: string;
    readonly status: "RUNNING" | "DOWN";
  };
  readonly updatedAt: string;
  readonly kpis: {
    readonly trs: { readonly value: number; readonly target: number };
    readonly availability: { readonly value: number; readonly target: number };
    readonly mtbfHours: number;
    readonly mttrMinutes: number;
  };
  readonly production: {
    readonly workOrderCode: string | null;
    readonly quantityGood: number;
    readonly quantityProduced: number;
  } | null;
  readonly openDowntime: {
    readonly id: string;
    readonly type: string;
    readonly startedAt: string;
    readonly cause: string | null;
  } | null;
  readonly recentActivity: ReadonlyArray<{
    readonly id: string;
    readonly type: string;
    readonly label: string;
    readonly at: string;
  }>;
}

export interface MachineDetail {
  readonly id: string;
  readonly code: string;
  readonly designation: string;
  readonly workshop: string;
  readonly line: string;
  readonly commissionedAt: string | null;
  readonly components: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly criticality: number;
    readonly level: "NEGLIGIBLE" | "MEDIUM" | "HIGH";
  }>;
}
