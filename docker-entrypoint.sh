#!/bin/sh
set -e

mkdir -p /data/uploads

echo "Applying Prisma schema to ${DATABASE_URL} ..."
if [ -x ./node_modules/.bin/prisma ]; then
  ./node_modules/.bin/prisma db push --skip-generate --schema=./prisma/schema.prisma
elif [ -f ./node_modules/prisma/build/index.js ]; then
  node ./node_modules/prisma/build/index.js db push --skip-generate --schema=./prisma/schema.prisma
else
  echo "WARN: prisma CLI not found — skipping db push"
fi

echo "Starting Next.js on 0.0.0.0:${PORT:-3000}..."
exec node server.js
