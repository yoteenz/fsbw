# Studio Institute — Invite Sharing & Copy Link

Extends the Private Expert Invite System with owner-friendly copy, share, and ready-to-send messaging.

## Routes

| Route | Purpose |
|-------|---------|
| `/studio-institute` | Owner dashboard entry (redirects to invites) |
| `/studio-institute/invites` | Invite management (create, copy, share) |
| `/studio-institute/invite/:token` | Expert invite landing |
| `/studio-institute/invite/:token?preview=owner` | Owner preview (Continue disabled) |

Legacy `/studio-institute/invite` redirects to `/studio-institute/invites`.

## Centralized URL configuration

Absolute invite links use `getPublicAppOrigin()`:

- `VITE_PUBLIC_APP_BASE_URL` (preferred)
- `VITE_PUBLIC_APP_ORIGIN`
- `window.location.origin` at runtime

Never hardcode deployment hosts in core modules.

## Owner workflow

1. Create invite (name, business, role, interview type, worker, optional welcome note, expiration, PIN)
2. Success screen with secure link + editable invitation message
3. Copy link · Copy message · Share (Web Share API) · Open preview
4. Dashboard row actions: pause/resume, regenerate link, archive, delete

## Invitation messages

- Default template in `invite-messages.ts`
- Tax Preparation variant references workflow, document review, QC, communication, judgment
- All In One Permitting variant references municipalities, documents, inspections, coordination
- Owner can edit before copy; Reset restores default

## Regenerate link

- Old token added to `revokedTokens`; old URL returns unavailable
- `sessionId` and progress preserved on the same invite record

## Access status

`active` · `paused` · `expired` · `completed` · `archived` · `revoked` · `deleted`

Paused/revoked invites show a calm unavailable message on the landing page.

## Audit events (non-sensitive)

Local + optional server: invite_created, link_copied, message_copied, share_initiated, invite_previewed, link_regenerated, access_paused, access_resumed, invite_revoked

## Environment

- **Owner password** — set once at `/studio-institute/invites` (no Vercel env required). Optional legacy `STUDIO_INSTITUTE_OWNER_KEY` env var still works.
- Run migration `20260711010000_studio_institute_invites_sharing.sql`

## Tests

`invite-system.test.ts` — tokens, URLs, messages, regenerate, access
