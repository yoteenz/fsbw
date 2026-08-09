#!/usr/bin/env bash
# Exposes the Cloud Agent Vite dev server (port 3001) for mobile preview.
#
# Option A (default): Cloudflare Quick Tunnel — random *.trycloudflare.com URL per session.
# Option B (persistent): Named tunnel via CLOUDFLARE_TUNNEL_TOKEN — stable hostname you configure
#   in Cloudflare Zero Trust (e.g. https://preview.yourdomain.com).
#
# Setup guide: docs/cloud-agent/persistent-preview-tunnel.md
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

if [[ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]]; then
  hostname="${CLOUDFLARE_TUNNEL_HOSTNAME:-}"
  if [[ -z "$hostname" ]]; then
    echo "[cloud-preview] WARN: CLOUDFLARE_TUNNEL_HOSTNAME unset — set it to your public URL (e.g. https://preview.example.com)" >&2
  else
    # Normalize: allow host-only or full URL
    if [[ "$hostname" != http* ]]; then
      hostname="https://${hostname}"
    fi
    printf '%s\n' "$hostname" >"$URL_FILE"
    echo ""
    echo "============================================================"
    echo " MOBILE PREVIEW URL (persistent — bookmark this):"
    echo " ${hostname}"
    echo " Lounge TV: ${hostname%/}/lobby/lounge"
    echo " Saved to: ${URL_FILE}"
    echo "============================================================"
    echo ""
  fi

  echo "[cloud-preview] Starting Named Cloudflare Tunnel (Option B — token)..."
  echo "[cloud-preview] Routing is configured in Cloudflare Zero Trust → Networks → Tunnels."
  exec "$CF" tunnel run --token "${CLOUDFLARE_TUNNEL_TOKEN}"
fi

echo "[cloud-preview] Starting Cloudflare Quick Tunnel (Option A — ephemeral URL)..."
echo "[cloud-preview] Tip: for a stable URL, set CLOUDFLARE_TUNNEL_TOKEN — see docs/cloud-agent/persistent-preview-tunnel.md"

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
      echo " Lounge TV: ${url}/lobby/lounge"
      echo " Saved to: ${URL_FILE}"
      echo "============================================================"
      echo ""
    fi
  fi
done
