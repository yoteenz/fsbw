#!/usr/bin/env bash
# Commit + push to origin/master on master only.
#
#   ./scripts/agent-commit.sh --sync-only "message"   — push to GitHub; Vercel build skipped ([sync-only])
#   ./scripts/agent-commit.sh --deploy-now "message"  — push + allow Vercel production build
#
# Env: FSBW_SYNC_ONLY=1 or FSBW_DEPLOY_NOW=1 (same as flags).
set -euo pipefail

SYNC_ONLY=false
DEPLOY_NOW=false
MSG=""
for arg in "$@"; do
  case "$arg" in
    --sync-only) SYNC_ONLY=true ;;
    --deploy-now) DEPLOY_NOW=true ;;
    -h|--help)
      echo "Usage: ./scripts/agent-commit.sh --sync-only \"commit message\"" >&2
      echo "   or: ./scripts/agent-commit.sh --deploy-now \"commit message\"" >&2
      echo "" >&2
      echo "  --sync-only   Push to GitHub; Vercel skips build ([sync-only] tag)." >&2
      echo "  --deploy-now  Push + Vercel production build when account is active." >&2
      exit 0
      ;;
    *)
      if [[ -z "$MSG" ]]; then
        MSG="$arg"
      else
        MSG="$MSG $arg"
      fi
      ;;
  esac
done

if [[ "${FSBW_SYNC_ONLY:-}" == "1" ]]; then
  SYNC_ONLY=true
fi
if [[ "${FSBW_DEPLOY_NOW:-}" == "1" ]]; then
  DEPLOY_NOW=true
fi

if $SYNC_ONLY && $DEPLOY_NOW; then
  echo "ERROR: Use only one of --sync-only or --deploy-now." >&2
  exit 1
fi

if ! $DEPLOY_NOW && ! $SYNC_ONLY; then
  echo "ERROR: Pass --sync-only (GitHub only) or --deploy-now (Vercel deploy)." >&2
  echo "Usage: ./scripts/agent-commit.sh --sync-only \"commit message\"" >&2
  exit 1
fi

if [[ -z "$MSG" ]]; then
  echo "Usage: ./scripts/agent-commit.sh --sync-only|deploy-now \"commit message\"" >&2
  exit 1
fi

shopt -s nocasematch
if [[ "$MSG" =~ ^(test|wip|fix|tmp|asdf|xxx)$ ]] || [[ ${#MSG} -lt 12 ]]; then
  echo "ERROR: Use a real commit message (≥12 chars, not test/wip/fix)." >&2
  exit 1
fi
shopt -u nocasematch

if $SYNC_ONLY && [[ "$MSG" != *"[sync-only]"* ]]; then
  MSG="${MSG} [sync-only]"
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(git branch --show-current)" != "master" ]]; then
  echo "ERROR: Work on master only (see motherboard/CORE.md)." >&2
  exit 1
fi

if git rev-parse '@{u}' >/dev/null 2>&1; then
  ahead="$(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)"
  if [[ "${ahead}" != "0" ]]; then
    echo "ERROR: Local master is ${ahead} commit(s) ahead of origin but not pushed." >&2
    echo "Push once with --sync-only or --deploy-now — do not stack unpushed commits." >&2
    exit 1
  fi
fi

git add -A

if git diff --cached --quiet; then
  echo "Nothing staged to commit." >&2
  exit 1
fi

git commit -m "$MSG"
git push -u origin master

if $SYNC_ONLY; then
  echo "OK: synced to origin/master (Vercel build skipped via [sync-only])."
  echo "Say \"deploy now\" and use --deploy-now when ready for production."
else
  echo "OK: deployed commit pushed to origin/master (Vercel may build)."
  echo "Do not amend+force-push — fold fixes into the next commit."
fi
