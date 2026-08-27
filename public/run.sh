#!/bin/sh
set -eu

HARNESS="${1:-codex}"
[ "$#" -eq 0 ] || shift
BASE_URL="${PROMPT_WRAPPED_ASSET_URL:-https://shirubasoft.github.io/prompt-wrapped}"
TASK_DIR="$(mktemp -d)"
COLLECTOR="$TASK_DIR/collector.py"

cleanup() {
  rm -rf "$TASK_DIR"
}
trap cleanup EXIT INT TERM

if ! command -v python3 >/dev/null 2>&1; then
  echo "Prompt Wrapped needs Python 3.9 or newer." >&2
  exit 1
fi

curl -fsSL "$BASE_URL/collector.py" -o "$COLLECTOR"
python3 "$COLLECTOR" --harness "$HARNESS" "$@"
