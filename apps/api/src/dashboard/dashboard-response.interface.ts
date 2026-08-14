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
  readonly recentActivity: ReadonlyArray<{
    readonly id: string;
    readonly type: string;
    readonly label: string;
    readonly at: string;
  }>;
}
