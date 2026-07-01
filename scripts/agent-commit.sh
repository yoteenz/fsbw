#!/usr/bin/env bash
# One Vercel deploy per agent task: stage code + motherboard/MEMORY.md, single commit, single push.
# Usage: ./scripts/agent-commit.sh "commit message"
#
# Do NOT run twice for the same task. Do NOT amend + force-push after this script succeeds.
set -euo pipefail

MSG="${1:-}"
if [[ -z "$MSG" ]]; then
  echo "Usage: ./scripts/agent-commit.sh \"commit message\"" >&2
  exit 1
fi

# Block placeholder / debug messages that lead to amend+force-push (second deploy).
shopt -s nocasematch
if [[ "$MSG" =~ ^(test|wip|fix|tmp|asdf|xxx)$ ]] || [[ ${#MSG} -lt 12 ]]; then
  echo "ERROR: Use a real commit message (≥12 chars, not test/wip/fix)." >&2
  echo "Append motherboard/MEMORY.md first, then run once with the final message." >&2
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
    echo "Push those once, or reset — do not stack a second agent-commit for the same task." >&2
    exit 1
  fi
fi

mapfile -t changed < <( { git diff --name-only; git diff --cached --name-only; } | sort -u )

code_changed=false
memory_touched=false
for f in "${changed[@]}"; do
  [[ -z "$f" ]] && continue
  if [[ "$f" == motherboard/MEMORY.md ]]; then
    memory_touched=true
  elif [[ "$f" != motherboard/* ]]; then
    code_changed=true
  fi
done

if $code_changed && ! $memory_touched; then
  echo "ERROR: Non-motherboard files changed but motherboard/MEMORY.md was not updated." >&2
  echo "Append a MEMORY entry (motherboard/ADDING.md), then re-run this script once." >&2
  exit 1
fi

git add -A

if $code_changed; then
  if ! git diff --cached --name-only | grep -qx 'motherboard/MEMORY.md'; then
    echo "ERROR: motherboard/MEMORY.md must be staged with code changes (one deploy)." >&2
    exit 1
  fi
fi

if git diff --cached --quiet; then
  echo "Nothing staged to commit." >&2
  exit 1
fi

git commit -m "$MSG"
git push -u origin master

echo "OK: one commit pushed to origin/master."
echo "Do not amend+force-push this commit — that triggers a second Vercel deploy."
