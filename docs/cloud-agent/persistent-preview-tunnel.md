# Persistent mobile preview (Cloudflare Named Tunnel)

Use this when you want **the same preview URL every Cloud Agent session** (e.g. `https://preview.yourdomain.com`) instead of a new random `*.trycloudflare.com` link each time.

Chrome and Safari both work. The repo disables Vite HMR auto-reload on mobile preview (`FSBW_CLOUD_MOBILE_PREVIEW=1`).

## What you need

1. A **domain on Cloudflare** (connect one you already own, or buy one in the dashboard).
2. **Cloudflare Zero Trust** (free tier is enough for a dev tunnel).
3. Two **Cursor environment secrets** on your Cloud Agent environment:
   - `CLOUDFLARE_TUNNEL_TOKEN` — install token from the tunnel wizard
   - `CLOUDFLARE_TUNNEL_HOSTNAME` — your public URL, e.g. `https://preview.yourdomain.com`

When the token is set, `./scripts/cloud-preview-tunnel.sh` uses **Option B** (named tunnel). Without it, **Option A** (ephemeral Quick Tunnel) runs as today.

---

## Step-by-step (new Cloudflare account)

### 1. Add a domain

On the screen you see (**Add a site**):

- **Connect a domain** — if you already own one (e.g. `frontalslayer.com`). Point nameservers to Cloudflare when prompted.
- **Buy a domain** — if you need a cheap dev domain (e.g. `yourname.dev`).

You cannot get a custom `preview.yourdomain.com` hostname without a domain on this account.

Wait until the domain shows **Active** in Cloudflare.

### 2. Open Zero Trust

1. Go to [https://one.dash.cloudflare.com/](https://one.dash.cloudflare.com/)
2. Complete the Zero Trust onboarding (pick the **Free** plan).
3. Choose any team name (e.g. `frontal-slayer`).

### 3. Create a tunnel

1. **Networks** → **Connectors** → **Cloudflare Tunnels** (or **Tunnels** in older UI).
2. **Create a tunnel**.
3. Name: `fsbw-cloud-preview` (any name is fine).
4. Connector type: **Cloudflared**.
5. On the install step, copy the **token** (long `eyJ…` string).  
   You do **not** need to run the install command on your laptop — the Cloud Agent runs it.

### 4. Add a public hostname

Still in the tunnel setup (or **Edit tunnel** → **Public Hostname**):

| Field | Value |
|--------|--------|
| **Subdomain** | `preview` (or `dev`, `agent-preview`, etc.) |
| **Domain** | your domain from step 1 |
| **Path** | *(leave empty)* |
| **Type** | HTTP |
| **URL** | `localhost:3001` |

Save. Your stable URL will be:

`https://preview.yourdomain.com`

(Optional) Add **Additional settings** → disable TLS verify if you ever point at self-signed upstream — not needed for localhost.

### 5. Add secrets in Cursor

1. Cursor → **Cloud Agents** → your **Build-a-Wig** environment → **Secrets** (or Environment settings).
2. Add:

```
CLOUDFLARE_TUNNEL_TOKEN=eyJ...paste full token...
CLOUDFLARE_TUNNEL_HOSTNAME=https://preview.yourdomain.com
```

3. Save. **Start a new Cloud Agent** (or restart the environment) so secrets inject.

### 6. Verify

1. Open the agent’s **preview-tunnel** terminal.
2. You should see: `Starting Named Cloudflare Tunnel (Option B — token)...`
3. On your phone (Chrome is fine): open  
   `https://preview.yourdomain.com/lobby/lounge`

Bookmark that URL — it stays the same across agent sessions.

---

## How it works

- **Vite** runs on port `3001` inside the Cloud Agent VM.
- **cloudflared** connects outbound to Cloudflare using your token.
- Cloudflare routes `preview.yourdomain.com` → tunnel → `localhost:3001` on whichever agent is currently connected.
- Only **one** agent should run this tunnel at a time (last connected agent wins).

When an agent stops, the URL still resolves but shows a Cloudflare error until a new agent starts with the same token.

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Cloudflare **502 / tunnel error** | Agent not running or Vite down — check **vite** and **preview-tunnel** terminals |
| Vite **Blocked request. Host not allowed** | Set `CLOUDFLARE_TUNNEL_HOSTNAME` correctly; restart Vite after adding the secret |
| Still getting `trycloudflare.com` | Token secret missing or agent not restarted after adding secrets |
| Loading screen forever on mobile | First load is large (~2–3 MB JS); use Wi‑Fi, go directly to `/lobby/lounge` |
| Page reloads when switching tabs | Expected occasionally on mobile; HMR is already disabled for cloud preview |

---

## Security notes

- The tunnel exposes whatever the dev server serves — **not** production-hardened.
- Use a subdomain you’re OK treating as dev-only (`preview.`, not `www.`).
- Consider Cloudflare Access (Zero Trust) on that hostname later if you want email OTP before preview loads.
