#!/bin/bash
# Cron entry point for network-sync-worker
# Usage: ./scripts/cron-entry.sh papers
# Called from crontab:
#   0 6 * * * /path/to/network-sync-worker/scripts/cron-entry.sh all

set -e
cd "$(dirname "$0")/.."
export $(grep -v '^#' .env | xargs) 2>/dev/null || true

TASK="${1:-all}"
npx tsx src/index.ts "$TASK" >> /var/log/sync-worker.log 2>&1
