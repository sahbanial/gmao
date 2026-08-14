export interface UtcDayPeriod {
  readonly periodStart: Date;
  readonly periodEnd: Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function buildUtcDayPeriod(now: Date): UtcDayPeriod {
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  return {
    periodStart,
    periodEnd: new Date(periodStart.getTime() + MS_PER_DAY),
  };
}