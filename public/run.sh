#!/bin/sh
set -eu

HARNESS="${1:-codex}"
[ "$#" -eq 0 ] || shift
BASE_URL="${PROMPT_WRAPPED_ASSET_URL:-https://shiruba.software/prompt-wrapped}"
TASK_DIR="$(mktemp -d)"
COLLECTOR="$TASK_DIR/collector.py"

status() {
  printf '%s\n' "$1" >&2
}

cleanup() {
  rm -rf "$TASK_DIR"
}
trap cleanup EXIT INT TERM

status ""
status "Prompt Wrapped setup"
status "  Agent: $HARNESS"
status "  Access: read-only analysis"
status "  Collector: $BASE_URL/collector.py (temporary)"
status ""

status "[setup 1/3] Checking Python..."
if ! command -v python3 >/dev/null 2>&1 || ! python3 -c 'import sys; raise SystemExit(sys.version_info < (3, 9))'; then
  echo "Prompt Wrapped needs Python 3.9 or newer." >&2
  exit 1
fi
status "             Found $(python3 --version 2>&1)."

status "[setup 2/3] Downloading the collector to a temporary folder..."
curl -fsSL "$BASE_URL/collector.py" -o "$COLLECTOR"
status "[setup 3/3] Starting the local collector with $HARNESS..."
python3 "$COLLECTOR" --harness "$HARNESS" "$@"
