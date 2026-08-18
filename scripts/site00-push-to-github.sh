#!/usr/bin/env bash
# Publish site00-standalone/ (in fsbw repo) to yoteenz/SITE00 on GitHub.
# Requires SITE00_GITHUB_TOKEN (fine-grained PAT: Contents read/write on SITE00).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$("${SCRIPT_DIR}/site00-resolve-root.sh")"
TOKEN="${SITE00_GITHUB_TOKEN:-${GITHUB_TOKEN:-}}"
REMOTE="${SITE00_GITHUB_REMOTE:-https://github.com/yoteenz/SITE00.git}"

if [[ -z "$TOKEN" ]]; then
  echo "[site00-push] ERROR: Set SITE00_GITHUB_TOKEN in Cursor cloud secrets." >&2
  echo "[site00-push] Fine-grained PAT: repo SITE00, Contents read+write." >&2
  exit 1
fi

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "[site00-push] Source: $ROOT"
echo "[site00-push] Staging publish tree…"

tar cf - -C "$ROOT" \
  --exclude=node_modules --exclude=dist --exclude=.git \
  . | tar xf - -C "$WORKDIR"

cd "$WORKDIR"
git init -b main >/dev/null
git add -A
git commit -m "Publish standalone SITE 00 from fsbw site00-standalone" >/dev/null

AUTH_REMOTE="https://x-access-token:${TOKEN}@github.com/yoteenz/SITE00.git"
git remote add origin "$AUTH_REMOTE"

if git ls-remote --heads origin main 2>/dev/null | grep -q main; then
  echo "[site00-push] Remote has main — merging unrelated histories if needed…"
  git pull origin main --allow-unrelated-histories --no-edit 2>/dev/null || true
fi

git push -u origin main
echo "[site00-push] Done → ${REMOTE}"
