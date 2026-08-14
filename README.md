# GMAO

Monorepo Turborepo + pnpm for the GMAO MVP.

## Packages

| Package | Path |
|---------|------|
| `@gmao/api` | `apps/api` |
| `@gmao/web` | `apps/web` |
| `@gmao/shared` | `packages/shared` |
| `@gmao/database` | `packages/database` |

## Requirements

- Node.js ≥ 20
- pnpm 9.x

## Scripts

```bash
pnpm install
pnpm dev      # Start all dev servers
pnpm build    # Build all packages
pnpm test     # Run tests
pnpm lint     # Lint all packages
```

## Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```
