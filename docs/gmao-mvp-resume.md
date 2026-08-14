# GMAO MVP — résumé d'exécution

## Stack livrée

- Turborepo + pnpm
- `apps/api` NestJS (auth JWT, machines, arrêts, KPI, dashboard)
- `apps/web` Vite React PWA — design **Industrial Precision** (Stitch) : login, dashboard MA03, déclaration arrêt, fiche machine, Pareto/AMDEC
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

Si le port **5432** est déjà pris (autre Postgres), GMAO utilise **5433**.

`DATABASE_URL=postgresql://gmao:gmao@localhost:5433/gmao?schema=public`

L’API écoute sur **3001** (`PORT`) pour éviter le conflit avec d’autres Nest locaux. Le front utilise `VITE_API_URL=http://localhost:3001`.

## Hors MVP

Interventions / préventif / notifications / Pareto / docs / admin → plans Phase 2–3.
