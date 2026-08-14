# Task 8 — Indicator engine API

## Summary

The authenticated NestJS API exposes:

- `POST /production` and `GET /production` for KPI production inputs;
- `POST /indicators/recalculate` to aggregate one machine period and persist its
  snapshot;
- `GET /indicators?machineId=&periodStart=&periodEnd=` to list overlapping
  snapshots.

Recalculation uses the shared MTBF, MTTR, availability, performance, quality,
and TRS formulas. Production entries that partially overlap the requested
period are prorated. Downtime durations are clipped to the requested period,
including open downtimes up to the period end.

## Failure definition and automatic recalculation

MTBF and MTTR count `MECHANICAL_FAILURE`, `ELECTRICAL_FAILURE`, and
`VORSCHUB_ADJUSTMENT` as failures. Other downtime types affect availability
but do not affect failure count or repair duration.

The engine listens to `downtime.changed`. Each event recalculates the period
from the start of the current UTC day to the event processing time.

## Persistence

Snapshots are upserted by machine, period start, and period end. The database
migration adds the corresponding unique index, so it must be applied before
deploying the API.

## Verification

Backend tests were intentionally omitted according to the Task 8 override.
Production code was verified with:

```bash
pnpm --filter @gmao/api build
```
