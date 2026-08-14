# Task 4 — NestJS API bootstrap and health

## Summary

The `@gmao/api` workspace now contains a NestJS application with:

- an HTTP server using `PORT` or port `3000` by default;
- a `GET /health` endpoint returning `{ "status": "ok" }`;
- a global `ValidationPipe` with transformation and whitelisting;
- CORS configured for `http://localhost:5173`;
- a Jest e2e health test.

## Verification

- Red: the health e2e test returned `404 Not Found` before the controller was registered.
- Green: `pnpm --filter @gmao/api test:e2e` passed with one test.
