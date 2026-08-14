export interface ParetoInput {
  readonly label: string;
  readonly durationMin: number;
}

export interface ParetoBar {
  readonly label: string;
  readonly durationMin: number;
  readonly hours: number;
  readonly share: number;
  readonly cumulativeShare: number;
  readonly heightPercent: number;
  readonly isVital: boolean;
}

const VITAL_SHARE = 0.8;

export function aggregatePareto(inputs: readonly ParetoInput[]): ParetoBar[] {
  const totals = new Map<string, number>();
  for (const item of inputs) {
    if (item.durationMin <= 0) continue;
    totals.set(item.label, (totals.get(item.label) ?? 0) + item.durationMin);
  }
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const totalMin = sorted.reduce((sum, [, duration]) => sum + duration, 0);
  if (totalMin <= 0) return [];
  const maxMin = sorted[0]?.[1] ?? 0;
  let cumulativeMin = 0;
  return sorted.map(([label, durationMin]) => {
    const previousShare = cumulativeMin / totalMin;
    cumulativeMin += durationMin;
    return {
      label,
      durationMin,
      hours: durationMin / 60,
      share: durationMin / totalMin,
      cumulativeShare: cumulativeMin / totalMin,
      heightPercent: maxMin > 0 ? (durationMin / maxMin) * 100 : 0,
      isVital: previousShare < VITAL_SHARE,
    };
  });
}
