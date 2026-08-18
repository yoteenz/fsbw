#!/usr/bin/env bash
# Resolve standalone SITE 00 project root for cloud agent scripts.
# Prefers cloned yoteenz/SITE00; falls back to fsbw site00-standalone/ until Phase 23.
set -euo pipefail

if [[ -n "${SITE00_PROJECT_ROOT:-}" && -f "${SITE00_PROJECT_ROOT}/package.json" ]]; then
  printf '%s\n' "$(cd "${SITE00_PROJECT_ROOT}" && pwd)"
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FSBW_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
GITHUB_CLONE="${SITE00_GITHUB_CLONE_DIR:-/home/ubuntu/SITE00}"

for candidate in \
  "${GITHUB_CLONE}" \
  "${FSBW_ROOT}/site00-standalone" \
  "/home/ubuntu/site-00" \
  "${FSBW_ROOT}/site-00"; do
  if [[ -f "${candidate}/package.json" ]]; then
    name="$(node -p "require('${candidate}/package.json').name" 2>/dev/null || true)"
    if [[ "$name" == "site-00" ]]; then
      printf '%s\n' "$candidate"
      exit 0
    fi
  fi
done

echo "[site00] ERROR: Standalone SITE 00 project not found." >&2
echo "[site00] Run ./scripts/site00-clone-github.sh or set SITE00_PROJECT_ROOT." >&2
exit 1
