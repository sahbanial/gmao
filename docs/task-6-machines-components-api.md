# Task 6 — Machines and components API

## Summary

The NestJS API exposes the machine catalog and AMDEC components through:

- `GET /machines` to list machines by ascending code;
- `GET /machines/:code` to return a machine with components ordered by decreasing criticality;
- `POST /machines` for administrators;
- `POST /machines/:id/components` for administrators and managers.

Mutating routes require both `JwtAuthGuard` and `RolesGuard`. Component creation
derives `criticality` and `level` with `computeCriticality` and
`resolveCriticalityLevel` from `@gmao/shared`.

## Validation

Machine inputs require a code, designation, workshop, and line. Component inputs
require a name and positive integer severity, frequency, and detection values.
Missing machines return HTTP `404`.

## Tests

The service test creates its machine and component fixtures through Prisma,
checks decreasing criticality order, verifies the resolved level, and cleans up
its records.

```bash
DATABASE_URL="<test-postgres-url>" pnpm --filter @gmao/api test -- --runInBand
pnpm --filter @gmao/api lint
pnpm --filter @gmao/api build
```
