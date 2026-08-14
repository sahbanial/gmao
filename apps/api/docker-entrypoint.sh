#!/bin/sh
set -eu

export PATH="/app/packages/database/node_modules/.bin:/app/node_modules/.bin:${PATH}"

cd /app/packages/database
prisma migrate deploy

exec node /app/apps/api/dist/main.js
