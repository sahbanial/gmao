import { describe, expect, it } from "vitest";
import { resolveReportPeriod } from "./resolve-report-period";

describe("resolveReportPeriod", () => {
  const now = new Date("2026-08-14T12:00:00.000Z");

  it("starts the month on the first local day", () => {
    const actual = resolveReportPeriod("month", now);
    expect(new Date(actual.from).getDate()).toBe(1);
    expect(actual.to).toBe(now.toISOString());
  });

  it("starts the year on January 1", () => {
    const actual = resolveReportPeriod("ytd", now);
    expect(new Date(actual.from).getMonth()).toBe(0);
    expect(new Date(actual.from).getDate()).toBe(1);
  });
});
