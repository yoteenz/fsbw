# AIO design authority — mobile preview tunnel URLs

When **AIO Vite** runs on port **3001** with the named Cloudflare tunnel hostname (see `AGENTS.md`), these paths are bookmarkable on a phone — same pattern as the public mobile site.

Replace `{PREVIEW_HOST}` with your tunnel hostname (for example the value of `CLOUDFLARE_TUNNEL_HOSTNAME` / `AIO_CLOUDFLARE_TUNNEL_HOSTNAME` in Cursor secrets). Do not commit hostnames in the repo.

| Package | Live page (show someone) | Founder review chrome |
|--------|---------------------------|------------------------|
| **Public website** (mobile) | `/design-authority/aio-public/preview/site.html` | `/design-authority/aio-public/preview/local.html` |
| **Office workspaces** (Fleet · Books · Compliance · Client 360) | `/design-authority/aio-office/workspaces/preview/site.html` | `/design-authority/aio-office/workspaces/preview/local.html` |
| **Unified internal office** (HOME · WORK · REPORTS · MORE) | `/design-authority/aio-office/office/preview/site.html` | `/design-authority/aio-office/office/preview/local.html` |

Example: `https://{PREVIEW_HOST}/design-authority/aio-office/workspaces/preview/site.html`

## Rebuild committed previews

From `all-in-one-enterprises/`:

```bash
node scripts/build-design-previews.mjs
```

Or individually:

```bash
node design-authority/aio-public/build.mjs design-authority/aio-public/preview
node design-authority/aio-office/workspaces/build.mjs design-authority/aio-office/workspaces/preview
node design-authority/aio-office/office/build.mjs design-authority/aio-office/office/preview
```

Requires **Python 3** with **Pillow** available to `python3` (Cloud Agent: `pip3 install --break-system-packages Pillow`).

Claude artifacts remain the canonical external review links in founder docs; these tunnel URLs are for **live, interactive** demos on the phone.

## Troubleshooting “not loading”

| Symptom | Cause | Fix |
|--------|--------|-----|
| **Cloudflare 530 / 502 / tunnel error** | No Cloud Agent is connected, or **Vite on port 3001 is down** | Start or wake a Cloud Agent; check **vite** + **preview-tunnel** terminals. The hostname stays up but the origin is only live while an agent runs the tunnel. |
| **Blank page / “Blocked request”** | Vite rejected the tunnel host | Set **`CLOUDFLARE_TUNNEL_HOSTNAME`** (and for AIO-only dev, **`AIO_CLOUDFLARE_TUNNEL_HOSTNAME`**) to your public URL; restart Vite with **`FSBW_CLOUD_MOBILE_PREVIEW=1`** or **`AIO_CLOUD_MOBILE_PREVIEW=1`**. |
| **404 on `/design-authority/…`** | Frontal Slayer Vite on **3001** (default) — files live under `all-in-one-enterprises/` | Use the **long path**: `/all-in-one-enterprises/design-authority/…/preview/site.html` — or pull latest repo (short paths **redirect** to long paths on FS Vite). |
| **Very slow first paint (office previews)** | `site.html` is a large self-contained bundle (~0.5–1 MB HTML) | Use Wi‑Fi; wait for full download; prefer **TABLET/DESKTOP** on a laptop for office reviews. |

**Recommended for AIO design URLs on `preview.fsbw-dev.com`:** run **All In One Vite on port 3001** with tunnel hostname env (same as public mobile sprint):

```bash
cd all-in-one-enterprises
export CLOUDFLARE_TUNNEL_HOSTNAME="https://YOUR-TUNNEL-HOST"
export AIO_CLOUDFLARE_TUNNEL_HOSTNAME="$CLOUDFLARE_TUNNEL_HOSTNAME"
export AIO_CLOUD_MOBILE_PREVIEW=1
npx vite --port 3001 --host 0.0.0.0
```

Then restart **`./scripts/cloud-preview-tunnel.sh`** in the **preview-tunnel** terminal.
