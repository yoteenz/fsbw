# DOMAIN AND DNS — All In One

## Status

**NOT_SELECTED** — owner must confirm/purchase domain.

## Canonical URL

Use `VITE_AIO_APP_URL` — no hard-coded hosts in business-critical links.

## DNS plan (when domain selected)

- A/AAAA or CNAME per host provider
- Domain verification records
- Email: SPF, DKIM, DMARC (values from email provider — do not fabricate)
- TLS via host/edge

## WWW policy

Choose apex or www after domain exists; redirect alternate consistently.

## Search indexing

- Staging: `noindex`
- Production marketing: Sprint 24 launch gate
- Portal/Office: never indexed

## Robots

Environment-aware; exclude portal/staff routes.
