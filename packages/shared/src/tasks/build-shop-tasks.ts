export type ShopTaskKind = "CURATIVE" | "INSPECTION";

export interface OpenDowntimeTaskSource {
  readonly id: string;
  readonly type: string;
  readonly startedAt: string;
  readonly cause: string | null;
  readonly componentName: string | null;
}

export interface HighComponentTaskSource {
  readonly id: string;
  readonly name: string;
  readonly criticality: number;
}

export interface ShopTask {
  readonly id: string;
  readonly kind: ShopTaskKind;
  readonly title: string;
  readonly componentName: string | null;
  readonly startedAt: string | null;
  readonly downtimeId: string | null;
  readonly criticality: number | null;
}

export function buildShopTasks(input: {
  readonly openDowntimes: readonly OpenDowntimeTaskSource[];
  readonly highComponents: readonly HighComponentTaskSource[];
}): ShopTask[] {
  const occupiedNames = new Set(
    input.openDowntimes
      .map((item) => item.componentName)
      .filter((name): name is string => name != null),
  );
  const curative: ShopTask[] = input.openDowntimes.map((item) => ({
    id: `downtime:${item.id}`,
    kind: "CURATIVE",
    title: item.cause ?? item.type,
    componentName: item.componentName,
    startedAt: item.startedAt,
    downtimeId: item.id,
    criticality: null,
  }));
  const inspection: ShopTask[] = input.highComponents
    .filter((item) => !occupiedNames.has(item.name))
    .map((item) => ({
      id: `component:${item.id}`,
      kind: "INSPECTION",
      title: item.name,
      componentName: item.name,
      startedAt: null,
      downtimeId: null,
      criticality: item.criticality,
    }));
  return [...curative, ...inspection];
}
