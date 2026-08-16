#!/usr/bin/env bash
# All In One Enterprises — Cloudflare tunnel for standalone preview (port 5173).
#
# Option A (default): Quick Tunnel — ephemeral https://*.trycloudflare.com per session.
# Option B (persistent): Named tunnel via AIO_CLOUDFLARE_TUNNEL_TOKEN + AIO_CLOUDFLARE_TUNNEL_HOSTNAME
#
# Guide: all-in-one-enterprises/docs/PREVIEW_TUNNEL.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AIO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

CF="${CLOUDFLARED_BIN:-/tmp/cloudflared-aio}"
URL_FILE="${AIO_CLOUD_PREVIEW_URL_FILE:-/tmp/aio-cloud-preview-url.txt}"
VITE_PORT="${AIO_VITE_PORT:-5173}"
VITE_URL="http://127.0.0.1:${VITE_PORT}"

# Named tunnel: prefer AIO-specific secrets; fall back to shared CLOUDFLARE_* if set
TUNNEL_TOKEN="${AIO_CLOUDFLARE_TUNNEL_TOKEN:-${CLOUDFLARE_TUNNEL_TOKEN:-}}"
TUNNEL_HOSTNAME="${AIO_CLOUDFLARE_TUNNEL_HOSTNAME:-${CLOUDFLARE_TUNNEL_HOSTNAME:-}}"

if [[ ! -x "$CF" ]]; then
  echo "[aio-preview] Installing cloudflared..."
  curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CF"
  chmod +x "$CF"
fi

echo "[aio-preview] Waiting for All In One Vite at ${VITE_URL} ..."
ready=false
for _ in $(seq 1 120); do
  if curl -sf "${VITE_URL}/" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
if ! $ready; then
  echo "[aio-preview] ERROR: Vite not ready after 120s." >&2
  echo "[aio-preview] Start: cd all-in-one-enterprises && AIO_CLOUD_MOBILE_PREVIEW=1 npm run dev" >&2
  exit 1
fi

rm -f "$URL_FILE"

print_urls() {
  local base="$1"
  echo ""
  echo "============================================================"
  echo " ALL IN ONE — MOBILE PREVIEW URL:"
  echo " ${base}"
  echo ""
  echo " Key routes:"
  echo "   Home:    ${base}/"
  echo "   Portal:  ${base}/portal"
  echo "   Office:  ${base}/office"
  echo "   Launch:  ${base}/office/management/launch"
  echo ""
  echo " Saved to: ${URL_FILE}"
  echo "============================================================"
  echo ""
}

if [[ -n "$TUNNEL_TOKEN" ]]; then
  if [[ -n "$TUNNEL_HOSTNAME" ]]; then
    hostname="$TUNNEL_HOSTNAME"
    if [[ "$hostname" != http* ]]; then
      hostname="https://${hostname}"
    fi
    printf '%s\n' "$hostname" >"$URL_FILE"
    print_urls "$hostname"
  else
    echo "[aio-preview] WARN: Set AIO_CLOUDFLARE_TUNNEL_HOSTNAME (e.g. https://aio-preview.yourdomain.com)" >&2
  fi

  echo "[aio-preview] Starting Named Cloudflare Tunnel (persistent)..."
  echo "[aio-preview] Configure public hostname → http://localhost:${VITE_PORT} in Zero Trust."
  exec "$CF" tunnel run --token "${TUNNEL_TOKEN}"
fi

echo "[aio-preview] Starting Quick Tunnel (ephemeral URL)..."
echo "[aio-preview] For a stable URL, set AIO_CLOUDFLARE_TUNNEL_TOKEN — see docs/PREVIEW_TUNNEL.md"

"$CF" tunnel --url "${VITE_URL}" 2>&1 | while IFS= read -r line; do
  echo "$line"
  if [[ "$line" =~ https://[a-z0-9-]+\.trycloudflare\.com ]]; then
    url="$(echo "$line" | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | head -1)"
    if [[ -n "$url" && ! -f "$URL_FILE" ]]; then
      printf '%s\n' "$url" >"$URL_FILE"
      print_urls "$url"
    fi
  fi
done
