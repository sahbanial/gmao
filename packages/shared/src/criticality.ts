export function computeCriticality(severity: number, frequency: number, detection: number): number {
  return severity * frequency * detection;
}

export function resolveCriticalityLevel(criticality: number): "NEGLIGIBLE" | "MEDIUM" | "HIGH" {
  if (criticality >= 14) return "HIGH";
  if (criticality >= 7) return "MEDIUM";
  return "NEGLIGIBLE";
}
