#!/bin/sh
set -e

mkdir -p "${DATA_DIR:-/data}/uploads"

if [ -z "$AUTH_URL" ] && [ -n "$NEXT_PUBLIC_SITE_URL" ]; then
  export AUTH_URL="$NEXT_PUBLIC_SITE_URL"
fi
if [ -z "$NEXT_PUBLIC_SITE_URL" ] && [ -n "$AUTH_URL" ]; then
  export NEXT_PUBLIC_SITE_URL="$AUTH_URL"
fi

export AUTH_TRUST_HOST="${AUTH_TRUST_HOST:-true}"

if [ -n "$AUTH_URL" ]; then
  echo "Auth/site URL: $AUTH_URL"
else
  echo "WARN: AUTH_URL / NEXT_PUBLIC_SITE_URL not set — Auth.js will infer host from the request"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set (expected Supabase Postgres pooler URL)"
  exit 1
fi

echo "Applying Prisma schema ..."
if [ -x ./node_modules/.bin/prisma ]; then
  ./node_modules/.bin/prisma db push --skip-generate --schema=./prisma/schema.prisma
elif [ -f ./node_modules/prisma/build/index.js ]; then
  node ./node_modules/prisma/build/index.js db push --skip-generate --schema=./prisma/schema.prisma
else
  echo "WARN: prisma CLI not found — skipping db push"
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "RUN_SEED=true but seed binaries are not bundled in the slim image."
  echo "Seed from your laptop: DATABASE_URL=... DIRECT_URL=... npm run db:seed"
fi

PORT="${PORT:-10000}"
echo "Starting Next.js on 0.0.0.0:${PORT}..."
exec node server.js
