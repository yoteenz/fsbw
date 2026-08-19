#!/usr/bin/env bash
# Hard guard: AIO project only — reject Frontal Slayer before any Supabase mutation.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

stage="${1:-pre-mutation}"
secret_ref="${SUPABASE_PROJECT_ID:-}"

echo "=== AIO project guard ($stage) ==="

if [[ -z "$secret_ref" ]]; then
  echo "FAIL: SUPABASE_PROJECT_ID secret is empty"
  exit 1
fi

if [[ "$secret_ref" == "$FS_FORBIDDEN_PROJECT_REF" ]]; then
  echo "FAIL: SUPABASE_PROJECT_ID matches forbidden Frontal Slayer project ($FS_FORBIDDEN_PROJECT_REF)"
  exit 1
fi

if [[ "$secret_ref" != "$AIO_CANONICAL_PROJECT_REF" ]]; then
  echo "FAIL: SUPABASE_PROJECT_ID must be exactly $AIO_CANONICAL_PROJECT_REF (got: ${#secret_ref} char ref)"
  exit 1
fi

if [[ -n "${AIO_SUPABASE_URL:-}" && "$AIO_SUPABASE_URL" == *"$FS_FORBIDDEN_PROJECT_REF"* ]]; then
  echo "FAIL: AIO_SUPABASE_URL references forbidden Frontal Slayer project"
  exit 1
fi

if [[ -f supabase/.temp/project-ref ]]; then
  linked_ref="$(tr -d '[:space:]' < supabase/.temp/project-ref)"
  if [[ "$linked_ref" == "$FS_FORBIDDEN_PROJECT_REF" ]]; then
    echo "FAIL: linked Supabase project is Frontal Slayer ($FS_FORBIDDEN_PROJECT_REF)"
    exit 1
  fi
  if [[ "$linked_ref" != "$AIO_CANONICAL_PROJECT_REF" ]]; then
    echo "FAIL: linked Supabase project ref mismatch (expected $AIO_CANONICAL_PROJECT_REF)"
    exit 1
  fi
  echo "Linked project ref: $linked_ref (OK)"
fi

if rg -l "$FS_FORBIDDEN_PROJECT_REF" supabase/migrations/ >/dev/null 2>&1; then
  echo "WARN: forbidden FS ref string found in migration filenames/content scan — manual review advised"
fi

echo "AIO project guard: PASS ($stage)"
