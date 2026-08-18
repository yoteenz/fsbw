# SITE 00 — Cloudflare mobile preview tunnel

Standalone **SITE 00** dev preview on port **5174**, separate from Frontal Slayer (port **3001**).

| Terminal | App | Port |
|----------|-----|------|
| `site00-vite` | SITE 00 standalone | 5174 |
| `site00-preview-tunnel` | Cloudflare → SITE 00 | — |
| `vite` + `preview-tunnel` | Frontal Slayer (unchanged) | 3001 |

Edit code in **`SITE00` repo** (`/home/ubuntu/site-00` on cloud agents, or your local clone). The tunnel serves that workspace — not `fsbw`.

---

## Option A — Ephemeral URL (zero setup)

1. Start a Cloud Agent (or restart environment).
2. Open **`site00-vite`** terminal — wait for Vite on 5174.
3. Open **`site00-preview-tunnel`** — copy the `https://….trycloudflare.com` URL (also in `/tmp/site00-cloud-preview-url.txt`).
4. Open on your phone.

URL changes each new agent session.

---

## Option B — Persistent hostname (recommended)

Create a **second tunnel** in Cloudflare Zero Trust. Do **not** reuse the Frontal Slayer tunnel token unless you reconfigure that hostname to port **5174** (you would lose FS preview on the same hostname).

### 1. Create tunnel

1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Networks** → **Tunnels** → **Create**
2. Name: `site00-cloud-preview`
3. Copy the **token** (`eyJ…`)

### 2. Public hostname

| Field | Value |
|--------|--------|
| Subdomain | `site00-preview` (or `s00`, etc.) |
| Domain | your domain on Cloudflare |
| Type | HTTP |
| URL | **`localhost:5174`** |

Example: `https://site00-preview.yourdomain.com`

### 3. Cursor Cloud Agent secrets

Add **separate** secrets (do not overwrite Frontal Slayer's unless intentional):

```
SITE00_CLOUDFLARE_TUNNEL_TOKEN=eyJ...full token...
SITE00_CLOUDFLARE_TUNNEL_HOSTNAME=https://site00-preview.yourdomain.com
```

Optional — if SITE 00 lives elsewhere on disk:

```
SITE00_PROJECT_ROOT=/path/to/site-00
```

### 4. Verify

1. **`site00-vite`** — Vite running on 5174
2. **`site00-preview-tunnel`** — `Starting Named Cloudflare Tunnel`
3. Phone → `https://site00-preview.yourdomain.com/` (ORIGIN)

---

## Production vs preview

| Environment | Source | URL |
|-------------|--------|-----|
| **Dev preview** | SITE00 repo + this tunnel | trycloudflare or `site00-preview.*` |
| **Production** | SITE00 `main` → GoDaddy build | **https://site00.com** |

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Tunnel can't connect | Start **`site00-vite`** first |
| FS routes on SITE 00 URL | Wrong tunnel — you hit port 3001; use SITE 00 tunnel |
| Host not allowed | Set `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`; restart **site00-vite** |
| Still on trycloudflare | `SITE00_CLOUDFLARE_TUNNEL_TOKEN` missing; restart agent after adding secrets |
