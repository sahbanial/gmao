# Task 5 — Auth module (JWT + RBAC)

## Summary

The NestJS API authenticates active users with email and password, verifies bcrypt hashes, issues one-hour JWT access tokens, and resolves the current user from every bearer token.

## Endpoints

- `POST /auth/login` accepts `{ "email": string, "password": string }` and returns `{ "accessToken": string, "user": PublicUser }`.
- `GET /auth/me` requires `Authorization: Bearer <token>` and returns the current active user.
- Authentication responses never expose `passwordHash`, activity flags, or audit timestamps.

## Authorization

- `JwtAuthGuard` validates bearer tokens through Passport.
- `@Roles(...roles)` attaches role requirements using the shared `Role` type.
- `RolesGuard` authorizes against the role loaded from the database, not the role claim alone.
- Protected role endpoints should use `@UseGuards(JwtAuthGuard, RolesGuard)` together with `@Roles(...)`.

## Configuration

Set `JWT_SECRET` to a long random value. `.env.example` contains a placeholder only; the local `.env` remains ignored by Git.

## Tests

```bash
pnpm --filter @gmao/api test -- --runInBand
DATABASE_URL="<test-postgres-url>" JWT_SECRET="<test-secret>" pnpm --filter @gmao/api test:e2e --runInBand
pnpm --filter @gmao/api lint
pnpm --filter @gmao/api build
```

The unit suite covers successful login, invalid passwords, inactive users, and role authorization. The e2e suite covers login, current-user resolution, invalid credentials, and missing bearer tokens.
