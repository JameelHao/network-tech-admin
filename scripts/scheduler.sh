#!/bin/bash
# network-sync-worker scheduler
# Runs sync tasks on a loop with configurable intervals.
# Usage:
#   ./scripts/scheduler.sh              # run all tasks on schedule
#   ./scripts/scheduler.sh once          # run all tasks once, exit
#   ./scripts/scheduler.sh papers        # run papers sync only, on schedule
#
# Schedule (seconds):
#   papers:   21600 (6h)  — arXiv/S2 papers
#   feeds:    3600  (1h)  — RSS news feeds
#   github:   86400 (24h) — GitHub repos
#   rfcs:     43200 (12h) — RFC updates
#   classify: 7200  (2h)  — AI classify + summary
#   vendor:   86400 (24h) — vendor intelligence
#   conf:     86400 (24h) — conference AI summaries

set -euo pipefail
cd "$(dirname "$0")/.."
LOG_DIR="${SYNC_LOG_DIR:-/var/log/sync-worker}"
mkdir -p "$LOG_DIR"

# Load .env
if [ -f .env ]; then
  set -a; source .env; set +a
fi

TSX="${TSX:-npx tsx}"
SCHEDULE="${SYNC_SCHEDULE:-normal}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_DIR/scheduler.log"
  echo "$*"
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
  local task=$1
  local interval=$2
  while true; do
    run_task "$task"
    log "Sleep ${interval}s until next $task..."
    sleep "$interval"
  done
}

# ── Schedule definitions ──
declare -A INTERVALS
INTERVALS[papers]=21600
INTERVALS[feeds]=3600
INTERVALS[github]=86400
INTERVALS[rfcs]=43200
INTERVALS[classify]=7200
INTERVALS[vendor-intel]=86400
INTERVALS[conf-summaries]=86400

# ── "once" mode — run all once ──
if [ "${1:-}" = "once" ]; then
  log "=== RUN ALL ONCE ==="
  run_task papers
  run_task feeds
  run_task github
  run_task rfcs
  run_task classify
  run_task vendor-intel
  run_task conf-summaries
  log "=== ALL DONE ==="
  exit 0
fi

# ── Single task mode ──
if [ -n "${1:-}" ]; then
  if [ "${1:-}" = "classify" ]; then
    # classify runs papers + news both
    run_loop "classify" "${INTERVALS[classify]}"
  elif [ -n "${INTERVALS[${1}]:-}" ]; then
    run_loop "$1" "${INTERVALS[$1]}"
  else
    echo "Unknown task: $1"
    echo "Available: once, papers, feeds, github, rfcs, classify, vendor-intel, conf-summaries"
    exit 1
  fi
  exit 0
fi

# ── All tasks in background (default) ──
log "=== SCHEDULER START ==="

# Run once at startup
run_task papers
run_task feeds
run_task classify

# Launch background loops
run_loop papers "${INTERVALS[papers]}" &
run_loop feeds "${INTERVALS[feeds]}" &
run_loop github "${INTERVALS[github]}" &
run_loop rfcs "${INTERVALS[rfcs]}" &
run_loop classify "${INTERVALS[classify]}" &
run_loop vendor-intel "${INTERVALS[vendor-intel]}" &
run_loop conf-summaries "${INTERVALS[conf-summaries]}" &

log "All workers launched. Waiting..."
wait
