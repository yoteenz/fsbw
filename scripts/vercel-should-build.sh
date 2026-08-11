#!/usr/bin/env bash
# Vercel ignoreCommand helper (see vercel.json).
# Exit 0 = skip build (only docs / motherboard memory changed).
# Exit 1 = proceed with build (code, API, assets, deps, or Vercel config touched).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Paths that never require a production build when they are the *only* changes.
is_doc_or_memory_skip_path() {
  local f="$1"
  case "$f" in
    docs/*|\
    brand-bible/*|\
    repo-audit/*|\
    STUDIO_OS_BIBLE/*|\
    collaboration-intelligence/*|\
    founder-intelligence/*|\
    StudioOS_ContextCapsule_v0.1/*|\
    StudioOS_StudioDNACapsule_v1.0/*|\
    releases/downloads/README.md|\
    releases/downloads/manifest.json|\
    motherboard/MEMORY.md|\
    motherboard/README.md|\
    motherboard/ADDING.md|\
    motherboard/CORE.md|\
    motherboard/CODEBASE.md|\
    AGENTS.md|\
    README.md|\
    .cursor/rules/*)
      return 0
      ;;
    *.md)
      # Root-level markdown only (e.g. AGENTS-adjacent docs at repo root).
      if [[ "$f" != */* ]]; then
        return 0
      fi
      return 1
      ;;
    *)
      return 1
      ;;
  esac
}

if [[ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" && -n "${VERCEL_GIT_COMMIT_SHA:-}" ]]; then
  DIFF_RANGE="${VERCEL_GIT_PREVIOUS_SHA}..${VERCEL_GIT_COMMIT_SHA}"
elif git rev-parse HEAD^ >/dev/null 2>&1; then
  DIFF_RANGE="HEAD^..HEAD"
else
  echo "Build required: no previous SHA (first commit or shallow clone)"
  exit 1
fi

mapfile -t CHANGED < <(git diff --name-only "$DIFF_RANGE" 2>/dev/null || true)

COMMIT_MSG="$(git log -1 --pretty=%B "${VERCEL_GIT_COMMIT_SHA:-HEAD}" 2>/dev/null || git log -1 --pretty=%B 2>/dev/null || true)"
if [[ "$COMMIT_MSG" == *"[sync-only]"* ]]; then
  echo "Skip build: commit marked [sync-only] (GitHub sync without Vercel deploy)"
  exit 0
fi

if [[ ${#CHANGED[@]} -eq 0 ]]; then
  echo "Build required: empty diff in range ${DIFF_RANGE}"
  exit 1
fi

for path in "${CHANGED[@]}"; do
  [[ -z "$path" ]] && continue
  if ! is_doc_or_memory_skip_path "$path"; then
    echo "Build required: ${path}"
    exit 1
  fi
done

echo "Skip build: only documentation and/or motherboard memory paths changed (${#CHANGED[@]} file(s))"
exit 0
