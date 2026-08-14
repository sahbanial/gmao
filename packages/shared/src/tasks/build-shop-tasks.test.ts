import { describe, expect, it } from "vitest";
import { buildShopTasks } from "./build-shop-tasks";

describe("buildShopTasks", () => {
  it("lists open downtimes first then unmatched high AMDEC components", () => {
    const actual = buildShopTasks({
      openDowntimes: [
        {
          id: "dt-1",
          type: "MECHANICAL_FAILURE",
          startedAt: "2026-08-14T10:00:00.000Z",
          cause: "Cale Vorschub",
          componentName: "Vorschub",
        },
      ],
      highComponents: [
        { id: "c-1", name: "Vorschub", criticality: 18 },
        { id: "c-2", name: "SPAN", criticality: 16 },
      ],
    });
    expect(actual.map((task) => task.id)).toEqual(["downtime:dt-1", "component:c-2"]);
    expect(actual[0]?.kind).toBe("CURATIVE");
    expect(actual[0]?.downtimeId).toBe("dt-1");
    expect(actual[1]?.kind).toBe("INSPECTION");
    expect(actual[1]?.criticality).toBe(16);
  });

  it("returns an empty list when there is nothing to do", () => {
    expect(buildShopTasks({ openDowntimes: [], highComponents: [] })).toEqual([]);
  });
});
