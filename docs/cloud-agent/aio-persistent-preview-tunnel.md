# All In One — persistent Cloudflare preview tunnel

Canonical detail: **`all-in-one-enterprises/docs/PREVIEW_TUNNEL.md`**

Quick reference for founders:

## Separate from Frontal Slayer preview

| App | Dev port | Suggested subdomain | Script |
|-----|----------|---------------------|--------|
| Frontal Slayer | 3001 | `preview.` | `scripts/cloud-preview-tunnel.sh` |
| **All In One** | **5173** | **`aio-preview.`** | `all-in-one-enterprises/scripts/aio-preview-tunnel.sh` |

## Cursor secrets (All In One)

```
AIO_CLOUDFLARE_TUNNEL_TOKEN=<tunnel install token>
AIO_CLOUDFLARE_TUNNEL_HOSTNAME=https://aio-preview.yourdomain.com
```

Cloud Agent terminals **aio-vite** + **aio-preview-tunnel** start automatically from `.cursor/environment.json`.

## Legacy FS moved page

Set on Frontal Slayer deployment (optional):

```
VITE_AIO_STANDALONE_URL=https://aio-preview.yourdomain.com
```

Then `https://ew.fsbw-dev.com/all-in-one` → **Open standalone app** works on mobile.
