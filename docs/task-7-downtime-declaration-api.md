# Task 7 — Downtime declaration API

## Summary

The authenticated NestJS API exposes the downtime declaration workflow through:

- `POST /downtimes` to start a declaration for the authenticated user;
- `PATCH /downtimes/:id/end` to close an open declaration;
- `GET /downtimes?machineId=&from=&to=` to list and filter declarations.

Start and end operations write an `AuditLog` in the same database transaction.
After each committed mutation, the API emits the internal
`downtime.changed` event with the downtime ID, machine ID, and operation.

## Validation

The start endpoint validates the downtime type, machine, and optional component.
The component must belong to the selected machine. The end endpoint rejects
unknown or already closed downtimes and requires `endedAt` to be greater than or
equal to `startedAt`. The computed duration is stored in whole minutes.

All downtime routes use JWT authentication. The declarant ID is always read from
the authenticated user and is never accepted from request input.

## Verification

Backend tests were intentionally omitted for MVP delivery according to the Task
7 controller ruling. Production code was verified with:

```bash
pnpm --filter @gmao/api build
```
