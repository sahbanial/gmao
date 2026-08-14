import { describe, expect, it } from "vitest";
import {
  calculateAvailability,
  calculateMtbfHours,
  calculateMttrMinutes,
  calculatePerformance,
  calculateQuality,
  calculateTrs,
} from "./formulas";
import { computeCriticality, resolveCriticalityLevel } from "../criticality";

describe("KPI formulas", () => {
  it("calculates MTBF in hours", () => {
    expect(calculateMtbfHours({ operatingMinutes: 840, failureCount: 1 })).toBe(14);
  });

  it("returns 0 MTBF when no failures and no operating time edge", () => {
    expect(calculateMtbfHours({ operatingMinutes: 0, failureCount: 0 })).toBe(0);
  });

  it("calculates MTTR in minutes", () => {
    expect(calculateMttrMinutes({ repairMinutesTotal: 45, failureCount: 1 })).toBe(45);
  });

  it("calculates availability", () => {
    const actual = calculateAvailability({ operatingMinutes: 737.8, downtimeMinutes: 262.2 });
    expect(actual).toBeCloseTo(0.7378, 3);
  });

  it("calculates TRS as product of factors", () => {
    const availability = 0.7378;
    const performance = 0.6;
    const quality = 0.9;
    expect(calculateTrs({ availability, performance, quality })).toBeCloseTo(0.3984, 3);
  });

  it("calculates performance and quality", () => {
    expect(
      calculatePerformance({
        quantityProduced: 4500,
        theoreticalCycleSec: 6,
        operatingMinutes: 480,
      })
    ).toBeCloseTo(0.9375, 3);
    expect(calculateQuality({ quantityGood: 4500, quantityProduced: 5000 })).toBe(0.9);
  });
});

describe("AMDEC criticality", () => {
  it("computes C = G×F×D and levels", () => {
    expect(computeCriticality(6, 3, 1)).toBe(18);
    expect(resolveCriticalityLevel(18)).toBe("HIGH");
    expect(resolveCriticalityLevel(12)).toBe("MEDIUM");
    expect(resolveCriticalityLevel(4)).toBe("NEGLIGIBLE");
  });
});
