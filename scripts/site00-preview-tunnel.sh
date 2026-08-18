#!/usr/bin/env bash
# Standalone SITE 00 — Cloudflare tunnel for mobile preview (port 5174).
#
# Option A (default): Quick Tunnel — ephemeral https://*.trycloudflare.com per session.
# Option B (persistent): SITE00_CLOUDFLARE_TUNNEL_TOKEN + SITE00_CLOUDFLARE_TUNNEL_HOSTNAME
#
# Guide: docs/cloud-agent/site00-preview-tunnel.md
#
# Use a SEPARATE Cloudflare tunnel from Frontal Slayer (3001). Do not reuse CLOUDFLARE_TUNNEL_TOKEN
# unless Zero Trust routes that hostname to localhost:5174.
set -euo pipefail

CF="${SITE00_CLOUDFLARED_BIN:-/tmp/cloudflared-site00}"
URL_FILE="${SITE00_CLOUD_PREVIEW_URL_FILE:-/tmp/site00-cloud-preview-url.txt}"
VITE_PORT="${SITE00_VITE_PORT:-5174}"
VITE_URL="http://127.0.0.1:${VITE_PORT}"

TUNNEL_TOKEN="${SITE00_CLOUDFLARE_TUNNEL_TOKEN:-}"
TUNNEL_HOSTNAME="${SITE00_CLOUDFLARE_TUNNEL_HOSTNAME:-}"

if [[ ! -x "$CF" ]]; then
  echo "[site00-preview] Installing cloudflared..."
  curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CF"
  chmod +x "$CF"
fi

echo "[site00-preview] Waiting for SITE 00 Vite at ${VITE_URL} ..."
ready=false
for _ in $(seq 1 120); do
  if curl -sf "${VITE_URL}/" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
if ! $ready; then
  echo "[site00-preview] ERROR: Vite not ready after 120s." >&2
  echo "[site00-preview] Start the site00-vite terminal first." >&2
  exit 1
fi

rm -f "$URL_FILE"

print_urls() {
  local base="$1"
  echo ""
  echo "============================================================"
  echo " SITE 00 — MOBILE PREVIEW URL:"
  echo " ${base}"
  echo ""
  echo " Key routes:"
  echo "   Origin:     ${base}/"
  echo "   Locations:  ${base}/origin/locations"
  echo "   Services:   ${base}/services"
  echo "   CTRL Room:  ${base}/control"
  echo "   Asset Vault:${base}/assts"
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
    echo "[site00-preview] WARN: Set SITE00_CLOUDFLARE_TUNNEL_HOSTNAME (e.g. https://site00-preview.yourdomain.com)" >&2
  fi

  echo "[site00-preview] Starting Named Cloudflare Tunnel (persistent)..."
  echo "[site00-preview] Zero Trust must route this hostname → http://localhost:${VITE_PORT}"
  exec "$CF" tunnel run --token "${TUNNEL_TOKEN}"
fi

echo "[site00-preview] Starting Quick Tunnel (ephemeral URL)..."
echo "[site00-preview] For a stable URL, set SITE00_CLOUDFLARE_TUNNEL_TOKEN — see docs/cloud-agent/site00-preview-tunnel.md"

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
