import { describe, expect, it } from "vitest";
import { buildUtcDayPeriod } from "./utc-day";

describe("buildUtcDayPeriod", () => {
  it("returns UTC midnight to next midnight", () => {
    const now = new Date("2026-08-14T13:45:00.000Z");
    const actual = buildUtcDayPeriod(now);
    expect(actual.periodStart.toISOString()).toBe("2026-08-14T00:00:00.000Z");
    expect(actual.periodEnd.toISOString()).toBe("2026-08-15T00:00:00.000Z");
  });
});