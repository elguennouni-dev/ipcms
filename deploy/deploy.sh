#!/usr/bin/env bash
# Run on the VPS from the project folder:  bash deploy/deploy.sh
# Pulls the latest code, installs, syncs the DB schema, rebuilds and reloads the app.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only origin main

echo "==> Installing dependencies"
npm ci

echo "==> Syncing database schema (non-destructive)"
npx prisma db push --skip-generate

echo "==> Building"
npm run build

echo "==> Reloading app"
if pm2 describe ipcms >/dev/null 2>&1; then
  pm2 reload ipcms --update-env
else
  pm2 start ecosystem.config.cjs
  pm2 save
fi
echo "==> Done"
