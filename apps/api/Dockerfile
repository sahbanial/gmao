# syntax=docker/dockerfile:1
# Build context must be the monorepo root.
FROM node:22-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/database/package.json ./packages/database/package.json

RUN printf 'fetch-retries=5\nfetch-retry-mintimeout=20000\nfetch-retry-maxtimeout=120000\n' >> .npmrc \
    && pnpm install --frozen-lockfile --filter @gmao/api...

COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/api ./apps/api

ENV DATABASE_URL="postgresql://gmao:gmao@localhost:5432/gmao?schema=public"

RUN pnpm --filter @gmao/shared build \
    && pnpm --filter @gmao/database generate \
    && pnpm --filter @gmao/database build \
    && pnpm --filter @gmao/api build

FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system gmao \
    && useradd --system --gid gmao --create-home gmao

COPY --from=builder /app /app
COPY apps/api/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER gmao
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
