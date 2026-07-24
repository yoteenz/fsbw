#!/usr/bin/env bash
# Deploy ONLY when founder explicitly authorizes (see --deploy-now below).
# Usage: ./scripts/agent-commit.sh --deploy-now "commit message"
#    or: FSBW_DEPLOY_NOW=1 ./scripts/agent-commit.sh "commit message"
#
# This script must NOT be invoked automatically at end of agent tasks.
# Do NOT run twice for the same deploy. Do NOT amend + force-push after success.
set -euo pipefail

DEPLOY_NOW=false
MSG=""
for arg in "$@"; do
  case "$arg" in
    --deploy-now) DEPLOY_NOW=true ;;
    -h|--help)
      echo "Usage: ./scripts/agent-commit.sh --deploy-now \"commit message\"" >&2
      echo "   or: FSBW_DEPLOY_NOW=1 ./scripts/agent-commit.sh \"commit message\"" >&2
      echo "" >&2
      echo "Refuses to run without explicit deploy authorization." >&2
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

if [[ "${FSBW_DEPLOY_NOW:-}" == "1" ]]; then
  DEPLOY_NOW=true
fi

if ! $DEPLOY_NOW; then
  echo "ERROR: Refusing to run without explicit deploy authorization." >&2
  echo "Founder must say \"deploy now\" before agents commit/push." >&2
  echo "Usage: ./scripts/agent-commit.sh --deploy-now \"commit message\"" >&2
  echo "   or: FSBW_DEPLOY_NOW=1 ./scripts/agent-commit.sh \"commit message\"" >&2
  exit 1
fi

if [[ -z "$MSG" ]]; then
  echo "Usage: ./scripts/agent-commit.sh --deploy-now \"commit message\"" >&2
  exit 1
fi

# Block placeholder / debug messages that lead to amend+force-push (second deploy).
shopt -s nocasematch
if [[ "$MSG" =~ ^(test|wip|fix|tmp|asdf|xxx)$ ]] || [[ ${#MSG} -lt 12 ]]; then
  echo "ERROR: Use a real commit message (≥12 chars, not test/wip/fix)." >&2
  exit 1
fi
shopt -u nocasematch

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
    echo "Push those once with --deploy-now, or reset — do not stack a second deploy." >&2
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

echo "OK: one commit pushed to origin/master."
echo "Do not amend+force-push this commit — that triggers a second Vercel deploy."
echo "Docs/MEMORY-only commits may skip the build via scripts/vercel-should-build.sh."
