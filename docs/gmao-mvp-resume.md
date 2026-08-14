# GMAO MVP — résumé d'exécution

## Stack livrée

- Turborepo + pnpm
- `apps/api` NestJS (auth JWT, machines, arrêts, KPI, dashboard)
- `apps/web` Vite React PWA (login, dashboard MA03, déclaration arrêt, fiche machine)
- `packages/database` Prisma + PostgreSQL
- `packages/shared` formules KPI/AMDEC

## Démarrage

```bash
# DB (si 5432 libre)
docker compose up -d
cp .env.example .env
# renseigner JWT_SECRET

pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed

pnpm --filter @gmao/api dev
pnpm --filter @gmao/web dev
```

Login seed : `operator@gmao.local` / `Password123!`

## Note environnement

Si le port 5432 est déjà pris, pointer `DATABASE_URL` vers l’IP du conteneur `gmao-postgres-migrate` (ou remapper le port Compose).

## Hors MVP

Interventions / préventif / notifications / Pareto / docs / admin → plans Phase 2–3.
