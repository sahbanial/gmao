export const DOWNTIME_TYPES = [
  "MECHANICAL_FAILURE",
  "VORSCHUB_ADJUSTMENT",
  "SERIES_CHANGE",
  "ELECTRICAL_FAILURE",
  "QUALITY_STOP",
  "PLANNED_STOP",
  "OTHER",
] as const;

export type DowntimeType = (typeof DOWNTIME_TYPES)[number];
