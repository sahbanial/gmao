# Dockerfiles — résumé

## Objectif

Chaque application du monorepo a son propre Dockerfile, construit depuis la **racine** du dépôt (workspaces pnpm).

| App | Fichier | Runtime |
|-----|---------|---------|
| `@gmao/web` | `apps/web/Dockerfile` | Nginx 1.27 (SPA + proxy `/api`) |
| `@gmao/api` | `apps/api/Dockerfile` | Node 22 (NestJS) |

PostgreSQL reste l’image officielle dans `docker-compose.yml`.

## Démarrage stack complète

```bash
cp .env.example .env
# renseigner JWT_SECRET

docker compose up -d --build
```

- Web : [http://localhost:8080](http://localhost:8080)
- API : [http://localhost:3001/health](http://localhost:3001/health)
- Postgres hôte : `localhost:5433`

Le front appelle `VITE_API_URL=/api` (injecté au build). Nginx proxifie `/api/*` vers le service `api:3001`.

Au démarrage, l’API exécute `prisma migrate deploy` puis `node dist/main.js`.

Le fichier `.env` à la racine (s’il existe) est lu par Compose pour interpoler `JWT_SECRET` et `CORS_ORIGIN`.

## Seed (optionnel)

```bash
docker compose exec api node -e "console.log('use local pnpm db:seed against localhost:5433')"
```

Le seed reste un script workspace (`pnpm db:seed`) à lancer depuis l’hôte, avec `DATABASE_URL` pointant sur `localhost:5433`.

## Build isolé

```bash
docker build -f apps/api/Dockerfile -t gmao-api .
docker build -f apps/web/Dockerfile --build-arg VITE_API_URL=/api -t gmao-web .
```

Le contexte **doit** être la racine du monorepo (`packages/shared`, `packages/database`, lockfile pnpm).

## Variables

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | Prisma (dans Compose : hôte `postgres`) |
| `JWT_SECRET` | Auth JWT |
| `PORT` | Port interne API (`3001`) |
| `CORS_ORIGIN` | Origines CORS, séparées par des virgules |
| `VITE_API_URL` | Build arg du front (`/api` en Docker) |
