export function calculateMtbfHours(input: {
  readonly operatingMinutes: number;
  readonly failureCount: number;
}): number {
  if (input.failureCount <= 0) return input.operatingMinutes > 0 ? input.operatingMinutes / 60 : 0;
  return input.operatingMinutes / 60 / input.failureCount;
}

export function calculateMttrMinutes(input: {
  readonly repairMinutesTotal: number;
  readonly failureCount: number;
}): number {
  if (input.failureCount <= 0) return 0;
  return input.repairMinutesTotal / input.failureCount;
}

export function calculateAvailability(input: {
  readonly operatingMinutes: number;
  readonly downtimeMinutes: number;
}): number {
  const total = input.operatingMinutes + input.downtimeMinutes;
  if (total <= 0) return 0;
  return input.operatingMinutes / total;
}

export function calculatePerformance(input: {
  readonly quantityProduced: number;
  readonly theoreticalCycleSec: number;
  readonly operatingMinutes: number;
}): number {
  const operatingSec = input.operatingMinutes * 60;
  if (operatingSec <= 0) return 0;
  return (input.quantityProduced * input.theoreticalCycleSec) / operatingSec;
}

export function calculateQuality(input: {
  readonly quantityGood: number;
  readonly quantityProduced: number;
}): number {
  if (input.quantityProduced <= 0) return 0;
  return input.quantityGood / input.quantityProduced;
}

export function calculateTrs(input: {
  readonly availability: number;
  readonly performance: number;
  readonly quality: number;
}): number {
  return input.availability * input.performance * input.quality;
}
