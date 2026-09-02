#!/bin/sh
set -e

mkdir -p /data/uploads

# Canonical public host (hyphen). Wrong AUTH_URL (e.g. sbdv.sbdvault…) breaks login cookies.
PUBLIC_URL="${PUBLIC_SITE_URL:-https://sbdv-sbdvault.amvera.io}"
export AUTH_URL="$PUBLIC_URL"
export AUTH_TRUST_HOST=true
export NEXT_PUBLIC_SITE_URL="$PUBLIC_URL"
echo "Auth/site URL: $AUTH_URL"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set (expected Supabase Postgres pooler URL)"
  exit 1
fi

echo "Applying Prisma schema (Supabase Postgres) ..."
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

echo "Starting Next.js on 0.0.0.0:${PORT:-80}..."
exec node server.js
