#!/usr/bin/env bash
# Record a gate status into .ci/aio-validation-results.json
set -euo pipefail

KEY="${1:?usage: aio-record-result.sh KEY STATUS [detail]}"
STATUS="${2:?usage: aio-record-result.sh KEY STATUS [detail]}"
DETAIL="${3:-}"

if [[ -z "${KEY// }" ]]; then
  echo "aio-record-result: missing result key" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS="${AIO_CI_RESULTS_PATH:-$ROOT/.ci/aio-validation-results.json}"
mkdir -p "$(dirname "$RESULTS")"

if [[ -n "$DETAIL" ]]; then
  node "$SCRIPT_DIR/aio-record-result.mjs" "$RESULTS" "$KEY" "$STATUS" "$DETAIL"
else
  node "$SCRIPT_DIR/aio-record-result.mjs" "$RESULTS" "$KEY" "$STATUS"
fi
