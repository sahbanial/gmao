import { describe, expect, it } from "vitest";
import { aggregatePareto } from "./aggregate";

describe("aggregatePareto", () => {
  it("sorts causes by duration and marks the vital 80%", () => {
    const actual = aggregatePareto([
      { label: "Electrical", durationMin: 60 },
      { label: "Vorschub", durationMin: 240 },
      { label: "Vorschub", durationMin: 60 },
      { label: "Lubrication", durationMin: 30 },
    ]);
    expect(actual.map((bar) => bar.label)).toEqual([
      "Vorschub",
      "Electrical",
      "Lubrication",
    ]);
    expect(actual[0]?.durationMin).toBe(300);
    expect(actual[0]?.isVital).toBe(true);
    expect(actual[0]?.heightPercent).toBe(100);
    expect(actual[0]?.cumulativeShare).toBeCloseTo(300 / 390);
  });

  it("returns an empty list when there is no downtime", () => {
    expect(aggregatePareto([{ label: "None", durationMin: 0 }])).toEqual([]);
  });
});
