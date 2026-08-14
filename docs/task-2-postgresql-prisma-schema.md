# PostgreSQL and Prisma MVP Schema

## Summary

The `@gmao/database` package provides the shared Prisma client and the initial PostgreSQL schema for the GMAO MVP.

The schema includes:

- `User`
- `Machine`
- `Component`
- `Downtime`
- `ProductionEntry`
- `IndicatorSnapshot`
- `AuditLog`
- `SystemSetting`

It intentionally excludes intervention and preventive-plan entities, which are outside the MVP scope.

## Local setup

```bash
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
```

The default local connection is:

```text
postgresql://gmao:gmao@localhost:5432/gmao?schema=public
```

The Prisma client is exported as `prisma` from `@gmao/database`.
