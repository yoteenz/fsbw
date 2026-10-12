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
