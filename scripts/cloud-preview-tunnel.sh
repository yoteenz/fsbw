#!/usr/bin/env bash
# Exposes the Cloud Agent Vite dev server (port 3001) via a Cloudflare Quick Tunnel.
# Prints a public HTTPS URL for mobile preview — no Vercel deploy required.
set -euo pipefail

CF="${CLOUDFLARED_BIN:-/tmp/cloudflared}"
URL_FILE="/tmp/cloud-preview-url.txt"
VITE_URL="http://127.0.0.1:3001"

if [[ ! -x "$CF" ]]; then
  echo "[cloud-preview] Installing cloudflared..."
  curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CF"
  chmod +x "$CF"
fi

echo "[cloud-preview] Waiting for Vite at ${VITE_URL} ..."
ready=false
for _ in $(seq 1 120); do
  if curl -sf "${VITE_URL}/" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
if ! $ready; then
  echo "[cloud-preview] ERROR: Vite not ready after 120s. Check the vite terminal." >&2
  exit 1
fi

rm -f "$URL_FILE"
echo "[cloud-preview] Starting Cloudflare Quick Tunnel (Option A — ephemeral URL)..."

"$CF" tunnel --url "${VITE_URL}" 2>&1 | while IFS= read -r line; do
  echo "$line"
  if [[ "$line" =~ https://[a-z0-9-]+\.trycloudflare\.com ]]; then
    url="$(echo "$line" | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | head -1)"
    if [[ -n "$url" && ! -f "$URL_FILE" ]]; then
      printf '%s\n' "$url" >"$URL_FILE"
      echo ""
      echo "============================================================"
      echo " MOBILE PREVIEW URL (open on your phone):"
      echo " ${url}"
      echo " Saved to: ${URL_FILE}"
      echo "============================================================"
      echo ""
    fi
  fi
done
