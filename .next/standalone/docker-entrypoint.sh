#!/bin/sh
set -e

if [ "$1" = "web" ]; then
  exec node server.js
elif [ "$1" = "worker" ]; then
  exec npx tsx scripts/worker.ts
elif [ "$1" = "setup" ]; then
  exec npx tsx scripts/setup.ts
else
  exec "$@"
fi
