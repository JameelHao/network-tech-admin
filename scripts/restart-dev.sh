#!/usr/bin/env sh

set -eu

PORT="${PORT:-3000}"

echo "Stopping dev server on port ${PORT}..."
PIDS="$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)"

if [ -n "${PIDS}" ]; then
  echo "${PIDS}" | xargs kill
  sleep 1
else
  echo "No process is listening on port ${PORT}."
fi

echo "Removing Next.js cache..."
rm -rf .next

echo "Starting dev server..."
npm run dev
