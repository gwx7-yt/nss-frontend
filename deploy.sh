#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
DOCS_DIR="${2:-.}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to run this preview server." >&2
  exit 1
fi

if [ ! -d "$DOCS_DIR" ]; then
  echo "Directory '$DOCS_DIR' does not exist." >&2
  exit 1
fi

cd "$DOCS_DIR"

cat <<MSG
──────────────────────────────────────────────
Local preview running at http://localhost:${PORT}
Press Ctrl+C to stop.
MSG

exec python3 -m http.server "$PORT"
