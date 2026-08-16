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
