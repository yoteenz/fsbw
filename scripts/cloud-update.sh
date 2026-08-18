#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

# Root workspace uses npm + package-lock.json for deterministic installs.
npm ci

# All In One standalone app (Cloud Agent aio-vite + aio-preview-tunnel).
if [[ -f "${REPO_ROOT}/all-in-one-enterprises/package-lock.json" ]]; then
  (cd "${REPO_ROOT}/all-in-one-enterprises" && npm ci)
fi

# SITE 00 product repo (preview tunnel serves github.com/yoteenz/SITE00).
if [[ -x "${REPO_ROOT}/scripts/site00-clone-github.sh" ]]; then
  "${REPO_ROOT}/scripts/site00-clone-github.sh" || echo "[cloud-update] WARN: SITE00 clone skipped (will retry in site00-vite)." >&2
fi
