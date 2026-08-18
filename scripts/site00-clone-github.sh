#!/usr/bin/env bash
# Clone or update yoteenz/SITE00 for cloud-agent preview (public repo; PAT not required).
set -euo pipefail

CLONE_DIR="${SITE00_GITHUB_CLONE_DIR:-/home/ubuntu/SITE00}"
REPO="${SITE00_GITHUB_REPO:-https://github.com/yoteenz/SITE00.git}"
BRANCH="${SITE00_GITHUB_BRANCH:-main}"

if [[ -d "${CLONE_DIR}/.git" ]]; then
  echo "[site00-clone] Updating ${CLONE_DIR} (${BRANCH})…"
  git -C "${CLONE_DIR}" fetch origin "${BRANCH}" --depth 1 2>/dev/null || git -C "${CLONE_DIR}" fetch origin "${BRANCH}"
  git -C "${CLONE_DIR}" checkout "${BRANCH}"
  git -C "${CLONE_DIR}" pull --ff-only origin "${BRANCH}" 2>/dev/null || \
    git -C "${CLONE_DIR}" reset --hard "origin/${BRANCH}"
else
  echo "[site00-clone] Cloning ${REPO} → ${CLONE_DIR}"
  mkdir -p "$(dirname "${CLONE_DIR}")"
  git clone --branch "${BRANCH}" --depth 1 "${REPO}" "${CLONE_DIR}"
fi

if [[ ! -f "${CLONE_DIR}/package.json" ]]; then
  echo "[site00-clone] ERROR: ${CLONE_DIR}/package.json missing after clone." >&2
  exit 1
fi

name="$(node -p "require('${CLONE_DIR}/package.json').name" 2>/dev/null || true)"
if [[ "$name" != "site-00" ]]; then
  echo "[site00-clone] WARN: package name is '${name}', expected site-00." >&2
fi

if [[ -f "${CLONE_DIR}/package-lock.json" ]]; then
  echo "[site00-clone] npm ci in ${CLONE_DIR}…"
  (cd "${CLONE_DIR}" && npm ci)
fi

echo "[site00-clone] Ready: ${CLONE_DIR}"
