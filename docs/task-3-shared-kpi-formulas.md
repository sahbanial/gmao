# Task 3 — Shared KPI formulas

## Summary

`@gmao/shared` exposes KPI calculation functions (MTBF, MTTR, availability, performance, quality, TRS) and AMDEC criticality helpers, aligned with `gmao.md` Module 4 and criticité thresholds (C ≤ 6 / 7–13 / ≥ 14).

## Exports

| Symbol | Purpose |
|--------|---------|
| `calculateMtbfHours` | Mean time between failures (hours) |
| `calculateMttrMinutes` | Mean time to repair (minutes) |
| `calculateAvailability` | Operating time / total time |
| `calculatePerformance` | Actual vs theoretical cycle rate |
| `calculateQuality` | Good parts / total produced |
| `calculateTrs` | Availability × performance × quality |
| `computeCriticality` | C = G × F × D |
| `resolveCriticalityLevel` | NEGLIGIBLE / MEDIUM / HIGH |
| `ROLES`, `Role` | RBAC roles aligned with Prisma |
| `DOWNTIME_TYPES`, `DowntimeType` | Downtime categories aligned with Prisma |

## Tests

```bash
pnpm --filter @gmao/shared test
```

7 Vitest cases in `packages/shared/src/kpi/formulas.test.ts`.
