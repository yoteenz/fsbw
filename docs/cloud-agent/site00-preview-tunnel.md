# SITE 00 — Cloudflare mobile preview tunnel

Standalone **SITE 00** dev preview on port **5174**, separate from Frontal Slayer (port **3001**).

**Source of truth for preview:** cloned **`https://github.com/yoteenz/SITE00`** at `/home/ubuntu/SITE00`.  
Frontal Slayer (`fsbw`) still embeds SITE 00 under `src/site00/` until Phase 23 — **do not use FS tunnel for product preview**.

| Terminal | App | Port |
|----------|-----|------|
| `site00-vite` | SITE00 repo (GitHub clone) | 5174 |
| `site00-preview-tunnel` | Cloudflare → SITE 00 | — |
| `vite` + `preview-tunnel` | Frontal Slayer (unchanged) | 3001 |

---

## Architecture (pre–Phase 23 detach)

```
yoteenz/SITE00 (GitHub)  ←── edit + publish target (GoDaddy prod later)
        ↑ clone on agent boot
/home/ubuntu/SITE00      ←── site00-vite serves this
        ↑ tunnel
Cloudflare hostname      ←── phone preview (site00-preview.* or trycloudflare)

yoteenz/fsbw             ←── FS + embedded src/site00/ (rollback until Phase 23)
site00-standalone/       ←── mirror in fsbw; publish script source if needed
```

| Environment | Code | URL |
|-------------|------|-----|
| **Dev preview** | **SITE00** clone + this tunnel | trycloudflare or `site00-preview.*` |
| **Production** | SITE00 `main` → **GoDaddy cPanel** (`dist/` static) | **https://site00.com** |
| **Frontal Slayer** | fsbw | FS tunnel / Vercel |

GoDaddy **cPanel** hosts static **`dist/`** only. Serverless **`api/`** routes need a separate Node host or Edge Functions before ASSTS/admin APIs work in production.

---

## Option A — Ephemeral URL (zero setup)

1. Start a Cloud Agent on **fsbw** (environment auto-runs `site00-clone-github.sh`).
2. Open **`site00-vite`** — Vite on 5174 from `/home/ubuntu/SITE00`.
3. Open **`site00-preview-tunnel`** — copy `https://….trycloudflare.com` (also `/tmp/site00-cloud-preview-url.txt`).
4. Open on your phone.

URL changes each new agent session.

---

## Option B — Persistent hostname (recommended)

Create a **second tunnel** in Cloudflare Zero Trust. **Do not** reuse the Frontal Slayer tunnel token unless you retarget that hostname to port **5174**.

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

Add **separate** secrets (same environment as `CLOUDFLARE_TUNNEL_*` for FS):

```
SITE00_CLOUDFLARE_TUNNEL_TOKEN=eyJ...full token...
SITE00_CLOUDFLARE_TUNNEL_HOSTNAME=https://site00-preview.yourdomain.com
```

Optional overrides:

```
SITE00_GITHUB_CLONE_DIR=/home/ubuntu/SITE00
SITE00_PROJECT_ROOT=/custom/path
```

Restart the Cloud Agent after adding secrets.

### 4. Verify

1. **`site00-vite`** — log shows `Starting SITE 00 at /home/ubuntu/SITE00`
2. **`site00-preview-tunnel`** — `Starting Named Cloudflare Tunnel`
3. Phone → `https://site00-preview.yourdomain.com/` (ORIGIN at `/`)

---

## Editing workflow

1. **Product changes** → commit to **`yoteenz/SITE00`** (or edit in agent on clone, push to SITE00).
2. **Preview** → restart **`site00-vite`** (pulls latest `main`) or new agent session.
3. **FS-only work** → stay in fsbw; avoid duplicating SITE 00 features in both repos.
4. **Phase 23** (later) → remove `src/site00/` from fsbw after prod validation.

---

## Scripts

| Script | Purpose |
|--------|---------|
| `site00-clone-github.sh` | Clone/update SITE00 to `/home/ubuntu/SITE00` |
| `site00-resolve-root.sh` | Resolve preview root (GitHub clone → `site00-standalone/` fallback) |
| `site00-cloud-vite-dev.sh` | Vite dev on 5174 |
| `site00-preview-tunnel.sh` | Cloudflare tunnel |
| `site00-push-to-github.sh` | Publish `site00-standalone/` → SITE00 (needs `SITE00_GITHUB_TOKEN`) |

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Tunnel can't connect | Start **`site00-vite`** first |
| FS routes on SITE 00 URL | Wrong tunnel — you hit port 3001; use SITE 00 tunnel |
| Host not allowed | Set `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`; restart **site00-vite** |
| Still on trycloudflare | `SITE00_CLOUDFLARE_TUNNEL_TOKEN` missing; restart agent after secrets |
| Serves old code | `git pull` in `/home/ubuntu/SITE00` or restart agent (auto-clone) |
| Clone fails | SITE00 is public; check network. Fallback: `site00-standalone/` in fsbw |
