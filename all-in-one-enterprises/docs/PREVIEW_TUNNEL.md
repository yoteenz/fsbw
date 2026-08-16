# All In One — Cloudflare preview tunnel (until production)

Use this to view **All In One Enterprises** on your phone or share a stable preview URL **before** production deploy.

Standalone app runs on **port 5173** (not Frontal Slayer port 3001).

---

## Quick start (Cloud Agent / local)

**Terminal 1 — dev server:**
```bash
cd all-in-one-enterprises
npm install
AIO_CLOUD_MOBILE_PREVIEW=1 npm run dev
```

**Terminal 2 — tunnel:**
```bash
./all-in-one-enterprises/scripts/aio-preview-tunnel.sh
```

The tunnel prints a URL and saves it to `/tmp/aio-cloud-preview-url.txt`.

### Key routes (no `/all-in-one` prefix)

| Area | Path |
|------|------|
| Home | `/` |
| Portal | `/portal` |
| Office | `/office` |
| Get Started | `/get-started` |
| Launch Control | `/office/management/launch` |

---

## Option A — Ephemeral Quick Tunnel (zero setup)

No Cloudflare account required. Each session gets a new URL:

`https://random-words.trycloudflare.com`

Run the tunnel script only (after Vite is up). Bookmark the printed URL for that session.

---

## Option B — Persistent hostname (recommended)

Same URL every session, e.g. `https://aio-preview.yourdomain.com`.

### 1. Cloudflare Zero Trust

1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Networks** → **Tunnels** → **Create tunnel**
2. Name: `aio-preview` (separate from Frontal Slayer `fsbw-cloud-preview` if you use both)
3. Copy the **tunnel token**

### 2. Public hostname

| Field | Value |
|-------|--------|
| Subdomain | `aio-preview` (or `aio`, `all-in-one`) |
| Domain | your Cloudflare domain |
| Type | HTTP |
| URL | `localhost:5173` |

**Important:** Frontal Slayer preview uses port **3001**. All In One uses **5173** — use a **different subdomain** or a **separate tunnel**.

### 3. Cursor Cloud Agent secrets

Add to your Cloud Agent environment:

```
AIO_CLOUDFLARE_TUNNEL_TOKEN=eyJ...full token...
AIO_CLOUDFLARE_TUNNEL_HOSTNAME=https://aio-preview.yourdomain.com
```

Optional — point legacy FS “moved” page button at this URL (Frontal Slayer Vercel env):

```
VITE_AIO_STANDALONE_URL=https://aio-preview.yourdomain.com
```

Restart the Cloud Agent after adding secrets.

### 4. Verify

1. **aio-vite** terminal: Vite on 5173
2. **aio-preview-tunnel** terminal: `Starting Named Cloudflare Tunnel`
3. Phone/browser: open `https://aio-preview.yourdomain.com/`

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `AIO_CLOUD_MOBILE_PREVIEW=1` | Disable HMR (stable mobile preview) |
| `AIO_CLOUDFLARE_TUNNEL_TOKEN` | Named tunnel token (AIO-specific) |
| `AIO_CLOUDFLARE_TUNNEL_HOSTNAME` | Public URL, e.g. `https://aio-preview.example.com` |
| `AIO_VITE_PORT` | Default `5173` |
| `VITE_AIO_STANDALONE_URL` | FS legacy moved-notice link target |

Shared fallbacks (if AIO_* unset): `CLOUDFLARE_TUNNEL_TOKEN`, `CLOUDFLARE_TUNNEL_HOSTNAME`.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Safari can't connect to **localhost** on phone | Use tunnel URL, not localhost |
| **Blocked request. Host not allowed** | Set `AIO_CLOUDFLARE_TUNNEL_HOSTNAME`; restart Vite |
| FS site shows “All In One has moved” | Expected on `/all-in-one` — use tunnel URL for standalone app |
| 502 from Cloudflare | Vite not running or wrong port in tunnel config (5173) |
| Still on trycloudflare.com | `AIO_CLOUDFLARE_TUNNEL_TOKEN` missing — add secret, restart agent |

---

## Security

- Preview/dev only — demo data, not production-hardened
- Use a dev subdomain (`aio-preview.`, not `www.`)
- Consider Cloudflare Access on the hostname before wider sharing

---

See also: `docs/cloud-agent/aio-persistent-preview-tunnel.md` (repo root)
