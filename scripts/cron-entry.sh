#!/bin/bash
# Cron entry point for network-sync-worker
# Called from crontab:
#   0 */6 * * * /path/to/scripts/cron-entry.sh papers
#   0 * * * * /path/to/scripts/cron-entry.sh feeds
#
# Or use scheduler.sh for continuous mode:
#   nohup ./scripts/scheduler.sh &

set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env ]; then set -a; source .env; set +a; fi
LOG_DIR="$HOME/.local/log/sync-worker"
mkdir -p "$LOG_DIR"
npx tsx src/index.ts "${1:-all}" >> "$LOG_DIR/cron.log" 2>&1
