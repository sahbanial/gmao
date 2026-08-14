export type ReportPeriodKey = "month" | "quarter" | "ytd";

export interface ReportPeriod {
  readonly from: string;
  readonly to: string;
}

export function resolveReportPeriod(key: ReportPeriodKey, now: Date): ReportPeriod {
  const to = now.toISOString();
  if (key === "ytd")
    return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to };
  if (key === "quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    return { from: new Date(now.getFullYear(), quarterStartMonth, 1).toISOString(), to };
  }
  return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to };
}
