# GMAO Monorepo MVP (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a working Turborepo GMAO MVP (auth, machine sheet, downtime declaration, KPI engine, real-time dashboard PWA) for machine INSERTER MA03, faithful to `gmao.md` Phase 1 and the Stitch prototype screens.

**Architecture:** Turborepo monorepo with `apps/api` (NestJS REST + JWT RBAC), `apps/web` (Vite React TypeScript PWA), `packages/database` (Prisma + PostgreSQL), and `packages/shared` (Zod DTOs + pure KPI formulas). Domain logic for MTBF/MTTR/Availability/TRS lives in `packages/shared` and is reused by NestJS services; the PWA mirrors Stitch screens (Dashboard, Declare Failure, Machine Technical File) using Industrial Precision tokens from `DESIGN.md`.

**Tech Stack:** Turborepo · pnpm · NestJS 10+ · Prisma 6 · PostgreSQL 16 · Vite 6 · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · TanStack Table · TanStack Query · React Router · vite-plugin-pwa · Jest (API) · Vitest (shared/web) · Docker Compose

**Spec:**
- Functional: `gmao.md` (Phase 1 = Modules 1, 2, 3, 4, 8)
- Design system: `DESIGN.md` (Stitch « Industrial Precision »)
- UI prototype: Stitch project `projects/13537135584261273264` — screens: MA03 KPI Dashboard, Declare Failure, Machine Technical File
- MCP setup reference: `docs/stitch-mcp-cursor.md`

## Global Constraints

- Code and identifiers in **English**; UI copy primarily **French** (atelier GRUNER).
- Clean code / SOLID / KISS; NestJS modular architecture (one module per domain).
- Prefer shared packages over duplication (`packages/shared`, `packages/database`).
- Multi-machine ready from day one: every operational row carries `machineId`.
- KPI recalculation after write must complete in **&lt; 2 s** (`gmao.md` §6).
- Auth required; RBAC roles: `OPERATOR` | `TECHNICIAN` | `MANAGER` | `ADMIN`.
- Frontend listings use **TanStack Table**; reuse shared UI components when they exist.
- Design tokens from `DESIGN.md`: primary `#00236f` / `#1e3a8a`, secondary `#fd761a`, Inter, radius `0.25rem`, touch targets ≥ 44px.
- No SSO in MVP (password + JWT only); no OPC-UA; no Phase 2/3 features beyond schema placeholders comments.
- Package manager: **pnpm**; Node ≥ 20.
- Docs: update `docs/` resumes when a phase ships.

## Scope split (mandatory)

This plan implements **Phase 0 (platform) + Phase 1 (MVP)** only.

| Later plan (do not implement here) | Modules |
|---|---|
| `YYYY-MM-DD-gmao-interventions-preventive.md` | 5, 6, 11 |
| `YYYY-MM-DD-gmao-pareto-docs-admin.md` | 7, 9, 10, 12 (+ Stitch Pareto screen) |

---

## File structure (create)

```text
gmao/
├── apps/
│   ├── api/                          # NestJS API
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── machines/
│   │   │   ├── downtimes/
│   │   │   ├── production/
│   │   │   ├── indicators/
│   │   │   ├── dashboard/
│   │   │   └── common/               # guards, filters, decorators
│   │   └── test/
│   └── web/                          # Vite React PWA
│       ├── src/
│       │   ├── main.tsx
│       │   ├── app/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── downtimes/
│       │   │   └── machines/
│       │   ├── shared/               # layout, api client, table helpers
│       │   └── styles/
│       └── public/
├── packages/
│   ├── database/
│   │   ├── prisma/schema.prisma
│   │   ├── prisma/seed.ts
│   │   └── src/index.ts              # re-export PrismaClient
│   └── shared/
│       ├── src/
│       │   ├── roles.ts
│       │   ├── downtime-types.ts
│       │   ├── kpi/
│       │   │   ├── formulas.ts
│       │   │   └── formulas.test.ts
│       │   └── index.ts
│       └── package.json
├── docker-compose.yml                # postgres:16
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

---

### Task 1: Turborepo + workspace scaffold

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.nvmrc`, `.env.example`, `README.md`
- Create: `apps/api/package.json`, `apps/web/package.json`, `packages/shared/package.json`, `packages/database/package.json`

**Interfaces:**
- Consumes: none
- Produces: workspace scripts `dev`, `build`, `test`, `lint`; packages named `@gmao/api`, `@gmao/web`, `@gmao/shared`, `@gmao/database`

- [ ] **Step 1: Initialize pnpm workspace root**

```json
{
  "name": "gmao",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:generate": "pnpm --filter @gmao/database generate",
    "db:migrate": "pnpm --filter @gmao/database migrate:dev",
    "db:seed": "pnpm --filter @gmao/database seed"
  },
  "devDependencies": {
    "turbo": "^2.5.0",
    "typescript": "^5.8.0"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["^build"] },
    "lint": {}
  }
}
```

- [ ] **Step 2: Add `.nvmrc` with `20` and `.gitignore` (node_modules, dist, .env, coverage, .turbo)**

- [ ] **Step 3: Create stub package.json for each workspace package with `"name": "@gmao/..."` and empty `"scripts": { "build": "echo ok", "test": "echo ok", "dev": "echo ok", "lint": "echo ok" }`**

- [ ] **Step 4: Run install and verify turbo graph**

Run: `pnpm install && pnpm exec turbo run build --dry-run`
Expected: lists `@gmao/api`, `@gmao/web`, `@gmao/shared`, `@gmao/database`

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .gitignore .nvmrc apps packages README.md
git commit -m "chore: scaffold turborepo workspace for GMAO"
```

---

### Task 2: PostgreSQL + Prisma domain schema (MVP entities)

**Files:**
- Create: `docker-compose.yml`
- Create: `packages/database/prisma/schema.prisma`
- Create: `packages/database/src/index.ts`
- Create: `packages/database/package.json` (scripts `generate`, `migrate:dev`, `seed`)
- Create: `.env.example` with `DATABASE_URL=postgresql://gmao:gmao@localhost:5432/gmao?schema=public`

**Interfaces:**
- Consumes: workspace from Task 1
- Produces: Prisma models `User`, `Machine`, `Component`, `Downtime`, `ProductionEntry`, `IndicatorSnapshot`, `AuditLog`, `SystemSetting`; client export `prisma` from `@gmao/database`

- [ ] **Step 1: Add docker-compose Postgres**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: gmao
      POSTGRES_PASSWORD: gmao
      POSTGRES_DB: gmao
    ports:
      - "5432:5432"
    volumes:
      - gmao_pg:/var/lib/postgresql/data
volumes:
  gmao_pg:
```

- [ ] **Step 2: Write Prisma schema (MVP only)**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  OPERATOR
  TECHNICIAN
  MANAGER
  ADMIN
}

enum DowntimeType {
  MECHANICAL_FAILURE
  VORSCHUB_ADJUSTMENT
  SERIES_CHANGE
  ELECTRICAL_FAILURE
  QUALITY_STOP
  PLANNED_STOP
  OTHER
}

enum CriticalityLevel {
  NEGLIGIBLE
  MEDIUM
  HIGH
}

model User {
  id           String   @id @default(cuid())
  employeeCode String   @unique
  firstName    String
  lastName     String
  email        String   @unique
  passwordHash String
  role         Role
  workshop     String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  declaredDowntimes Downtime[] @relation("DowntimeDeclarant")
  auditLogs    AuditLog[]
}

model Machine {
  id              String   @id @default(cuid())
  code            String   @unique
  designation     String
  workshop        String
  line            String
  commissionedAt  DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  components      Component[]
  downtimes       Downtime[]
  productionEntries ProductionEntry[]
  indicators      IndicatorSnapshot[]
}

model Component {
  id           String           @id @default(cuid())
  machineId    String
  machine      Machine          @relation(fields: [machineId], references: [id])
  name         String
  severity     Int
  frequency    Int
  detection    Int
  criticality  Int
  level        CriticalityLevel
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  downtimes    Downtime[]
  @@index([machineId])
}

model Downtime {
  id            String       @id @default(cuid())
  machineId     String
  machine       Machine      @relation(fields: [machineId], references: [id])
  componentId   String?
  component     Component?   @relation(fields: [componentId], references: [id])
  type          DowntimeType
  startedAt     DateTime
  endedAt       DateTime?
  durationMin   Int?
  cause         String?
  photoUrl      String?
  declarantId   String
  declarant     User         @relation("DowntimeDeclarant", fields: [declarantId], references: [id])
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  @@index([machineId, startedAt])
}

model ProductionEntry {
  id               String   @id @default(cuid())
  machineId        String
  machine          Machine  @relation(fields: [machineId], references: [id])
  workOrderCode    String?
  periodStart      DateTime
  periodEnd        DateTime
  theoreticalCycleSec Float
  quantityProduced Int
  quantityGood     Int
  openingMinutes   Int
  createdAt        DateTime @default(now())
  @@index([machineId, periodStart])
}

model IndicatorSnapshot {
  id            String   @id @default(cuid())
  machineId     String
  machine       Machine  @relation(fields: [machineId], references: [id])
  periodStart   DateTime
  periodEnd     DateTime
  mtbfHours     Float
  mttrMinutes   Float
  availability  Float
  trs           Float
  performance   Float
  quality       Float
  calculatedAt  DateTime @default(now())
  @@index([machineId, periodStart])
}

model SystemSetting {
  id    String @id @default(cuid())
  key   String @unique
  value String
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String
  entity    String?
  entityId  String?
  metadata  Json?
  createdAt DateTime @default(now())
}
```

- [ ] **Step 3: Export Prisma client**

```typescript
// packages/database/src/index.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export * from "@prisma/client";
```

- [ ] **Step 4: Start DB and migrate**

Run: `docker compose up -d && cp .env.example .env && pnpm db:generate && pnpm db:migrate`
Expected: migration applied; `User` / `Machine` tables exist

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml packages/database .env.example
git commit -m "feat(db): add Prisma MVP schema and Postgres compose"
```

---

### Task 3: Shared KPI formulas (TDD)

**Files:**
- Create: `packages/shared/src/kpi/formulas.ts`
- Create: `packages/shared/src/kpi/formulas.test.ts`
- Create: `packages/shared/src/roles.ts`
- Create: `packages/shared/src/downtime-types.ts`
- Create: `packages/shared/src/criticality.ts`
- Create: `packages/shared/src/index.ts`
- Modify: `packages/shared/package.json` (vitest)

**Interfaces:**
- Consumes: formulas from `gmao.md` § Module 4 and criticité thresholds § Module 2
- Produces:
  - `calculateMtbfHours({ operatingMinutes, failureCount }): number`
  - `calculateMttrMinutes({ repairMinutesTotal, failureCount }): number`
  - `calculateAvailability({ operatingMinutes, downtimeMinutes }): number`
  - `calculatePerformance({ quantityProduced, theoreticalCycleSec, operatingMinutes }): number`
  - `calculateQuality({ quantityGood, quantityProduced }): number`
  - `calculateTrs({ availability, performance, quality }): number`
  - `resolveCriticalityLevel(criticality: number): 'NEGLIGIBLE' | 'MEDIUM' | 'HIGH'`
  - `computeCriticality(severity, frequency, detection): number`

- [ ] **Step 1: Write failing tests**

```typescript
// packages/shared/src/kpi/formulas.test.ts
import { describe, expect, it } from "vitest";
import {
  calculateAvailability,
  calculateMtbfHours,
  calculateMttrMinutes,
  calculatePerformance,
  calculateQuality,
  calculateTrs,
} from "./formulas";
import { computeCriticality, resolveCriticalityLevel } from "../criticality";

describe("KPI formulas", () => {
  it("calculates MTBF in hours", () => {
    expect(calculateMtbfHours({ operatingMinutes: 840, failureCount: 1 })).toBe(14);
  });

  it("returns 0 MTBF when no failures and no operating time edge", () => {
    expect(calculateMtbfHours({ operatingMinutes: 0, failureCount: 0 })).toBe(0);
  });

  it("calculates MTTR in minutes", () => {
    expect(calculateMttrMinutes({ repairMinutesTotal: 45, failureCount: 1 })).toBe(45);
  });

  it("calculates availability", () => {
    const actual = calculateAvailability({ operatingMinutes: 737.8, downtimeMinutes: 262.2 });
    expect(actual).toBeCloseTo(0.7378, 3);
  });

  it("calculates TRS as product of factors", () => {
    const availability = 0.7378;
    const performance = 0.6;
    const quality = 0.9;
    expect(calculateTrs({ availability, performance, quality })).toBeCloseTo(0.3984, 3);
  });

  it("calculates performance and quality", () => {
    expect(
      calculatePerformance({
        quantityProduced: 4500,
        theoreticalCycleSec: 6,
        operatingMinutes: 480,
      })
    ).toBeCloseTo(0.9375, 3);
    expect(calculateQuality({ quantityGood: 4500, quantityProduced: 5000 })).toBe(0.9);
  });
});

describe("AMDEC criticality", () => {
  it("computes C = G×F×D and levels", () => {
    expect(computeCriticality(6, 3, 1)).toBe(18);
    expect(resolveCriticalityLevel(18)).toBe("HIGH");
    expect(resolveCriticalityLevel(12)).toBe("MEDIUM");
    expect(resolveCriticalityLevel(4)).toBe("NEGLIGIBLE");
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm --filter @gmao/shared test`
Expected: FAIL module not found / functions undefined

- [ ] **Step 3: Implement formulas**

```typescript
// packages/shared/src/kpi/formulas.ts
export function calculateMtbfHours(input: {
  readonly operatingMinutes: number;
  readonly failureCount: number;
}): number {
  if (input.failureCount <= 0) return input.operatingMinutes > 0 ? input.operatingMinutes / 60 : 0;
  return input.operatingMinutes / 60 / input.failureCount;
}

export function calculateMttrMinutes(input: {
  readonly repairMinutesTotal: number;
  readonly failureCount: number;
}): number {
  if (input.failureCount <= 0) return 0;
  return input.repairMinutesTotal / input.failureCount;
}

export function calculateAvailability(input: {
  readonly operatingMinutes: number;
  readonly downtimeMinutes: number;
}): number {
  const total = input.operatingMinutes + input.downtimeMinutes;
  if (total <= 0) return 0;
  return input.operatingMinutes / total;
}

export function calculatePerformance(input: {
  readonly quantityProduced: number;
  readonly theoreticalCycleSec: number;
  readonly operatingMinutes: number;
}): number {
  const operatingSec = input.operatingMinutes * 60;
  if (operatingSec <= 0) return 0;
  return (input.quantityProduced * input.theoreticalCycleSec) / operatingSec;
}

export function calculateQuality(input: {
  readonly quantityGood: number;
  readonly quantityProduced: number;
}): number {
  if (input.quantityProduced <= 0) return 0;
  return input.quantityGood / input.quantityProduced;
}

export function calculateTrs(input: {
  readonly availability: number;
  readonly performance: number;
  readonly quality: number;
}): number {
  return input.availability * input.performance * input.quality;
}
```

```typescript
// packages/shared/src/criticality.ts
export function computeCriticality(severity: number, frequency: number, detection: number): number {
  return severity * frequency * detection;
}

export function resolveCriticalityLevel(criticality: number): "NEGLIGIBLE" | "MEDIUM" | "HIGH" {
  if (criticality >= 14) return "HIGH";
  if (criticality >= 7) return "MEDIUM";
  return "NEGLIGIBLE";
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm --filter @gmao/shared test`
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add KPI and AMDEC criticality formulas with tests"
```

---

### Task 4: NestJS API bootstrap + health

**Files:**
- Create: Nest app under `apps/api` (`nest new` or manual)
- Create: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
- Create: `apps/api/src/health/health.controller.ts`
- Test: `apps/api/test/health.e2e-spec.ts`

**Interfaces:**
- Consumes: `@gmao/database`
- Produces: HTTP server on `PORT` (default `3000`), `GET /health` → `{ status: "ok" }`, global `ValidationPipe`, CORS for Vite origin

- [ ] **Step 1: Scaffold NestJS app with dependencies**

Run: add deps `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `class-validator`, `class-transformer`, `@gmao/database`, `@gmao/shared`

- [ ] **Step 2: Write failing e2e health test**

```typescript
it("GET /health returns ok", async () => {
  const res = await request(app.getHttpServer()).get("/health").expect(200);
  expect(res.body).toEqual({ status: "ok" });
});
```

- [ ] **Step 3: Run test — expect FAIL**

Run: `pnpm --filter @gmao/api test:e2e`
Expected: FAIL connection / 404

- [ ] **Step 4: Implement HealthController + bootstrap**

```typescript
@Controller("health")
export class HealthController {
  @Get()
  getHealth(): { status: "ok" } {
    return { status: "ok" };
  }
}
```

- [ ] **Step 5: Run test — expect PASS; Commit**

```bash
git commit -m "feat(api): bootstrap NestJS with health endpoint"
```

---

### Task 5: Auth module (JWT + RBAC)

**Files:**
- Create: `apps/api/src/auth/*` (module, service, controller, jwt strategy, guards)
- Create: `apps/api/src/users/*`
- Create: `apps/api/src/common/decorators/roles.decorator.ts`
- Create: `apps/api/src/common/guards/roles.guard.ts`
- Test: `apps/api/src/auth/auth.service.spec.ts`, `apps/api/test/auth.e2e-spec.ts`

**Interfaces:**
- Consumes: `User` model; roles from `@gmao/shared`
- Produces:
  - `POST /auth/login` `{ email, password }` → `{ accessToken, user }`
  - `GET /auth/me` (Bearer) → current user
  - `@Roles(...)` + `RolesGuard` + `JwtAuthGuard`

- [ ] **Step 1: Write AuthService unit tests (bcrypt hash verify + login failure)**

```typescript
it("rejects invalid password", async () => {
  await expect(
    service.login({ email: "op@gmao.local", password: "wrong" })
  ).rejects.toBeInstanceOf(UnauthorizedException);
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement UsersService + AuthService (bcrypt, @nestjs/jwt)**

```typescript
async login(input: { email: string; password: string }): Promise<{ accessToken: string; user: PublicUser }> {
  const user = await this.usersService.findByEmail(input.email);
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new UnauthorizedException("Invalid credentials");
  }
  const accessToken = await this.jwtService.signAsync({
    sub: user.id,
    role: user.role,
  });
  return { accessToken, user: toPublicUser(user) };
}
```

- [ ] **Step 4: E2E login + me; Commit**

```bash
git commit -m "feat(api): add JWT authentication and RBAC guards"
```

---

### Task 6: Machines + Components API

**Files:**
- Create: `apps/api/src/machines/machines.module.ts`
- Create: `apps/api/src/machines/machines.service.ts`
- Create: `apps/api/src/machines/machines.controller.ts`
- Create: `apps/api/src/machines/dto/*.ts`
- Test: `apps/api/src/machines/machines.service.spec.ts`

**Interfaces:**
- Consumes: Prisma `Machine`, `Component`; `computeCriticality` / `resolveCriticalityLevel`
- Produces:
  - `GET /machines`
  - `GET /machines/:code` (detail + components sorted by criticality desc)
  - `POST /machines` (ADMIN)
  - `POST /machines/:id/components` (ADMIN/MANAGER)

- [ ] **Step 1: Write service test — getByCode returns components with levels**

```typescript
it("returns MA03 with HIGH component first", async () => {
  const machine = await service.getByCode("MA03");
  expect(machine.components[0].level).toBe("HIGH");
});
```

- [ ] **Step 2: FAIL → implement service/controller → PASS**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(api): expose machines and AMDEC components endpoints"
```

---

### Task 7: Downtime declaration API (Module 3)

**Files:**
- Create: `apps/api/src/downtimes/*`
- Test: `apps/api/src/downtimes/downtimes.service.spec.ts`

**Interfaces:**
- Consumes: `Downtime` model; auth user as declarant
- Produces:
  - `POST /downtimes` start declaration `{ machineId, type, componentId?, cause?, startedAt? }`
  - `PATCH /downtimes/:id/end` `{ endedAt? }` → sets `durationMin`
  - `GET /downtimes?machineId=&from=&to=`
  - Side effect: write `AuditLog`; emit internal event `downtime.changed` for KPI recalculation

- [ ] **Step 1: Failing test — ending downtime computes duration**

```typescript
it("computes durationMin on end", async () => {
  const open = await service.start({ machineId, type: "MECHANICAL_FAILURE", declarantId, startedAt: new Date("2026-08-14T08:00:00Z") });
  const closed = await service.end(open.id, { endedAt: new Date("2026-08-14T08:45:00Z") });
  expect(closed.durationMin).toBe(45);
});
```

- [ ] **Step 2: Implement start/end with validation (cannot end twice; end ≥ start)**

- [ ] **Step 3: PASS + Commit**

```bash
git commit -m "feat(api): add downtime declaration start/end workflow"
```

---

### Task 8: Indicator engine API (Module 4)

**Files:**
- Create: `apps/api/src/indicators/indicators.module.ts`
- Create: `apps/api/src/indicators/indicators.service.ts`
- Create: `apps/api/src/indicators/indicators.controller.ts`
- Create: `apps/api/src/production/production.module.ts` (minimal create/list)
- Test: `apps/api/src/indicators/indicators.service.spec.ts`

**Interfaces:**
- Consumes: `@gmao/shared` formulas; downtimes + production entries
- Produces:
  - `POST /indicators/recalculate` `{ machineId, periodStart, periodEnd }`
  - `GET /indicators?machineId=&periodStart=&periodEnd=`
  - Persists `IndicatorSnapshot`
  - Failure definition for MTBF/MTTR: downtime types in `{ MECHANICAL_FAILURE, ELECTRICAL_FAILURE, VORSCHUB_ADJUSTMENT }` (document in service JSDoc)

- [ ] **Step 1: Failing test with known fixture (operating 840 min, 1 failure 45 min repair, production 4500/5000)**

```typescript
it("recalculates MA03 snapshot under 2s", async () => {
  const started = Date.now();
  const snap = await service.recalculate({ machineId, periodStart, periodEnd });
  expect(Date.now() - started).toBeLessThan(2000);
  expect(snap.mtbfHours).toBeCloseTo(14, 1);
  expect(snap.mttrMinutes).toBeCloseTo(45, 1);
});
```

- [ ] **Step 2: Implement aggregation + formula calls + snapshot upsert**

- [ ] **Step 3: Wire downtime.changed listener to recalculate current shift period**

- [ ] **Step 4: PASS + Commit**

```bash
git commit -m "feat(api): add KPI recalculation engine and snapshots"
```

---

### Task 9: Dashboard API (Module 8)

**Files:**
- Create: `apps/api/src/dashboard/dashboard.module.ts`
- Create: `apps/api/src/dashboard/dashboard.service.ts`
- Create: `apps/api/src/dashboard/dashboard.controller.ts`
- Test: `apps/api/src/dashboard/dashboard.service.spec.ts`

**Interfaces:**
- Consumes: latest `IndicatorSnapshot`, open downtimes, recent downtimes, `SystemSetting` targets
- Produces: `GET /dashboard/:machineCode`

```typescript
interface DashboardResponse {
  machine: { code: string; designation: string; line: string; status: "RUNNING" | "DOWN" };
  updatedAt: string;
  kpis: {
    trs: { value: number; target: number };
    availability: { value: number; target: number };
    mtbfHours: number;
    mttrMinutes: number;
  };
  production: {
    workOrderCode: string | null;
    quantityGood: number;
    quantityProduced: number;
  } | null;
  recentActivity: Array<{
    id: string;
    type: string;
    label: string;
    at: string;
  }>;
}
```

Default targets (seedable settings): `kpi.target.trs=0.60`, `kpi.target.availability=0.85`

- [ ] **Step 1: Failing test for RUNNING vs DOWN status based on open downtime**

- [ ] **Step 2: Implement → PASS → Commit**

```bash
git commit -m "feat(api): add machine dashboard aggregate endpoint"
```

---

### Task 10: Vite PWA scaffold + design tokens

**Files:**
- Create: Vite React TS app in `apps/web`
- Create: Tailwind + CSS variables mapped from `DESIGN.md`
- Create: `apps/web/vite.config.ts` with `vite-plugin-pwa`
- Create: `apps/web/src/shared/layout/app-shell.tsx` (header + bottom nav: Dashboard / Machines / Report / Tasks)
- Create: `apps/web/src/shared/api/http-client.ts`

**Interfaces:**
- Consumes: `DESIGN.md` tokens; Stitch nav IA
- Produces: PWA installable shell; env `VITE_API_URL`; routes placeholders

- [ ] **Step 1: Scaffold Vite React TS + Tailwind + React Router + TanStack Query**

- [ ] **Step 2: Map CSS variables**

```css
:root {
  --color-primary: #00236f;
  --color-primary-container: #1e3a8a;
  --color-secondary-container: #fd761a;
  --color-background: #f8f9ff;
  --color-on-surface: #0b1c30;
  --color-error: #ba1a1a;
  --radius-default: 0.25rem;
  font-family: Inter, system-ui, sans-serif;
}
```

- [ ] **Step 3: Add PWA manifest name `IndustriOS GMAO`, theme `#1e3a8a`**

- [ ] **Step 4: Visual smoke — `pnpm --filter @gmao/web dev` loads shell**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(web): scaffold Vite PWA with Industrial Precision tokens"
```

---

### Task 11: Web auth + route guards

**Files:**
- Create: `apps/web/src/features/auth/login-page.tsx`
- Create: `apps/web/src/features/auth/auth-store.ts` (or context)
- Create: `apps/web/src/shared/routing/protected-route.tsx`

**Interfaces:**
- Consumes: `POST /auth/login`, `GET /auth/me`
- Produces: token in `localStorage` key `gmao.accessToken`; redirect unauthenticated users to `/login`

- [ ] **Step 1: Vitest — ProtectedRoute redirects when token missing**

- [ ] **Step 2: Implement login form (email/password) → PASS → Commit**

```bash
git commit -m "feat(web): add login flow and protected routes"
```

---

### Task 12: Dashboard screen (Stitch: MA03 KPI Dashboard)

**Files:**
- Create: `apps/web/src/features/dashboard/dashboard-page.tsx`
- Create: `apps/web/src/features/dashboard/kpi-card.tsx`
- Create: `apps/web/src/features/dashboard/recent-activity-list.tsx`
- Test: `apps/web/src/features/dashboard/dashboard-page.test.tsx` (RTL)

**Interfaces:**
- Consumes: `GET /dashboard/MA03`
- Produces: UI matching Stitch — status badge, CTA `DÉCLARER UN ARRÊT`, KPI cards TRS/Disponibilité/MTBF/MTTR, production progress, recent activity, bottom nav Dashboard active

- [ ] **Step 1: Component test — renders TRS value from mock query**

- [ ] **Step 2: Implement page with TanStack Query polling every 15s**

- [ ] **Step 3: Wire CTA navigate to `/downtimes/new?machine=MA03`**

- [ ] **Step 4: PASS + Commit**

```bash
git commit -m "feat(web): implement MA03 KPI dashboard from Stitch prototype"
```

---

### Task 13: Declare Failure screen (Stitch)

**Files:**
- Create: `apps/web/src/features/downtimes/declare-downtime-page.tsx`
- Create: `apps/web/src/features/downtimes/declare-downtime-form.tsx`
- Test: form validation test (required type + component)

**Interfaces:**
- Consumes: `GET /machines/MA03`, `POST /downtimes`, `PATCH /downtimes/:id/end`
- Produces: French form — Type d'arrêt, Composant, Cause (5 Pourquoi), photo optional, chrono, buttons `VALIDER ET DÉMARRER LE CHRONO` / `ANNULER`

- [ ] **Step 1: Failing validation test**

- [ ] **Step 2: Implement form + mutation; on success go to dashboard**

- [ ] **Step 3: Photo = local file upload stub storing object URL / future upload URL field only in MVP (no object storage yet — accept empty `photoUrl`)**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(web): add downtime declaration form aligned with Stitch"
```

---

### Task 14: Machine Technical File screen (Stitch)

**Files:**
- Create: `apps/web/src/features/machines/machine-detail-page.tsx`
- Create: `apps/web/src/features/machines/components-table.tsx` (**TanStack Table**)
- Test: table renders criticality badges

**Interfaces:**
- Consumes: `GET /machines/MA03`
- Produces: Stitch layout — commissioning/workshop/line cards, next preventive placeholder text (`Phase 2`), AMDEC components table, documentation list placeholder (links disabled with “Phase 3”), bottom nav Machines active

- [ ] **Step 1: Failing test for criticality badge mapping HIGH→red**

- [ ] **Step 2: Implement with TanStack Table columns Component / Criticality / Status**

- [ ] **Step 3: Hide/disable Stop Machine destructive action behind `MANAGER`/`ADMIN` role; MVP shows button disabled with tooltip “Phase 2”**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(web): add machine technical file with AMDEC table"
```

---

### Task 15: Seed MA03 + demo users + smoke path

**Files:**
- Create: `packages/database/prisma/seed.ts`
- Create: `docs/gmao-mvp-resume.md`
- Modify: `README.md` run instructions

**Interfaces:**
- Consumes: schema + APIs
- Produces: deterministic seed — users per role, machine MA03, components (SPAN C=18, Vorschub C=12, Moteur CC C=4), sample production entry, one closed downtime

Seed passwords (dev only): `Password123!`
Emails: `operator@gmao.local`, `tech@gmao.local`, `manager@gmao.local`, `admin@gmao.local`

- [ ] **Step 1: Implement seed using bcrypt hash**

- [ ] **Step 2: Run `pnpm db:seed`**

- [ ] **Step 3: Manual smoke checklist**

1. Login as operator
2. Open dashboard MA03 — KPIs visible
3. Declare downtime → end it → KPIs refresh
4. Open machine file — components ordered by C

- [ ] **Step 4: Write `docs/gmao-mvp-resume.md` summarizing architecture + how to run**

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(db): seed MA03 demo data and document MVP runbook"
```

---

## Self-review

**1. Spec coverage (gmao.md Phase 1):**
| Module | Task(s) |
|---|---|
| 1 Auth & users | 5, 11, 15 |
| 2 Machine file | 6, 14, 15 |
| 3 Downtime declaration | 7, 13 |
| 4 KPI engine | 3, 8 |
| 8 Dashboard | 9, 12 |
| NFR multi-machine / &lt;2s KPI / JWT | 2, 8, 5 |
| Stitch screens MVP | 12, 13, 14 |
| DESIGN.md tokens | 10 |

**Deferred to later plans:** Modules 5–7, 9–12; Stitch Pareto screen; real photo storage; WebSocket; SSO; OPC-UA.

**2. Placeholder scan:** No TBD/TODO implementation steps; photo storage explicitly stubbed; preventive/docs explicitly Phase 2/3 placeholders in UI.

**3. Type consistency:** `DowntimeType`, `Role`, `CriticalityLevel` enums aligned Prisma ↔ shared ↔ API ↔ web labels (French mapping only in UI layer).

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-14-gmao-monorepo-mvp.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with checkpoints  

**Which approach?**

After MVP ships, create follow-up plans:
- `docs/superpowers/plans/YYYY-MM-DD-gmao-interventions-preventive.md` (Modules 5, 6, 11 + Tasks nav)
- `docs/superpowers/plans/YYYY-MM-DD-gmao-pareto-docs-admin.md` (Modules 7, 9, 10, 12 + Stitch Pareto screen)
