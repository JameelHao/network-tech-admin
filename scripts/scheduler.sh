#!/bin/bash
# network-sync-worker scheduler
# Runs sync tasks on a loop with configurable intervals.
# AI classify runs automatically after papers/feeds sync.
#
# Usage:
#   ./scripts/scheduler.sh              # run all tasks on schedule
#   ./scripts/scheduler.sh once          # run all tasks once, exit
#   ./scripts/scheduler.sh papers        # run papers sync + AI classify, on schedule
#
# Schedule:
#   feeds:   3600s (1h)
#   papers:  21600s (6h)
#   rfcs:    43200s (12h)
#   github:  86400s (24h)
#   vendor:  86400s (24h)
#   conf:    86400s (24h)

set -euo pipefail
cd "$(dirname "$0")/.."
LOG_DIR="${SYNC_LOG_DIR:-$HOME/.local/log/sync-worker}"
mkdir -p "$LOG_DIR"

if [ -f .env ]; then set -a; source .env; set +a; fi

TSX="${TSX:-npx tsx}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_DIR/scheduler.log"
}

run_task() {
  local task=$1
  local logfile="$LOG_DIR/${task}.log"
  log "START: $task"
  if $TSX src/index.ts "$task" >> "$logfile" 2>&1; then
    log "OK: $task"
  else
    log "FAIL: $task (exit $?)"
  fi
}

run_loop() {
  local task=$1 interval=$2
  while true; do
    run_task "$task"
    log "Sleep ${interval}s until next $task..."
    sleep "$interval"
  done
}

declare -A INTERVALS
INTERVALS[papers]=21600
INTERVALS[feeds]=3600
INTERVALS[github]=86400
INTERVALS[rfcs]=43200
INTERVALS[vendor-intel]=86400
INTERVALS[conf-summaries]=86400

# 'once' mode
if [ "${1:-}" = "once" ]; then
  log "=== RUN ALL ONCE ==="
  run_task papers
  run_task feeds
  run_task github
  run_task rfcs
  run_task vendor-intel
  run_task conf-summaries
  log "=== ALL DONE ==="
  exit 0
fi

# Single task mode
if [ -n "${1:-}" ]; then
  if [ -n "${INTERVALS[${1}]:-}" ]; then
    run_loop "$1" "${INTERVALS[$1]}"
  else
    echo "Unknown task: $1"
    echo "Available: once, papers, feeds, github, rfcs, vendor-intel, conf-summaries"
    exit 1
  fi
  exit 0
fi

# Default: all tasks in background
log "=== SCHEDULER START ==="
run_task papers
run_task feeds

run_loop papers "${INTERVALS[papers]}" &
run_loop feeds "${INTERVALS[feeds]}" &
run_loop github "${INTERVALS[github]}" &
run_loop rfcs "${INTERVALS[rfcs]}" &
run_loop vendor-intel "${INTERVALS[vendor-intel]}" &
run_loop conf-summaries "${INTERVALS[conf-summaries]}" &

log "All workers launched. Waiting..."
wait
