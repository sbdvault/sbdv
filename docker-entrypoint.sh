#!/bin/sh
set -e

mkdir -p /data/uploads

echo "Applying Prisma schema to $DATABASE_URL ..."
./node_modules/.bin/prisma db push --skip-generate --schema=./prisma/schema.prisma

echo "Starting Next.js on port ${PORT:-3000}..."
exec node server.js
