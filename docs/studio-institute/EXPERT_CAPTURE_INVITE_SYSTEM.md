# Private Expert Invite System (Phase 1)

Lightweight invite-only knowledge acquisition under **Studio Institute** routes on the existing Vercel deployment. Isolated from Frontal Slayer public navigation; migration-ready for a future Studio OS domain.

## Routes

| Route | Purpose |
|-------|---------|
| `/studio-institute` | Redirects to Invite Manager |
| `/studio-institute/invite` | Owner dashboard (legacy — redirects to `/invites`) |
| `/studio-institute/invites` | Owner dashboard (Invite Manager) |
| `/studio-institute/invite/:token` | Invitee welcome / resume landing |
| `/studio-institute/interview` | Invite-gated interview (Expert Capture) |
| `/studio-institute/knowledge-vault` | Invite-gated Knowledge Vault |

Override base path with `VITE_STUDIO_INSTITUTE_BASE_PATH`. Override public origin for invite links with `VITE_PUBLIC_APP_ORIGIN`.

## Authentication (Phase 1)

- **Invitees:** invite link token = access (no accounts/passwords).
- **Owner dashboard:** `X-Studio-Institute-Owner-Key` header or admin email via Supabase auth.

Set **`STUDIO_INSTITUTE_OWNER_KEY`** in Vercel environment variables for owner API access.

Future auth (Studio Accounts, OAuth, magic links, 2FA) is scaffolded via `InviteAccessGrant` / `OwnerAccessGrant` types without rewriting the app.

## Invite Manager

Each invite stores:

- Unique ID and random 8-character token
- Invitee name, business, role, worker being created
- Profile / company linkage
- Status: `not_started` | `in_progress` | `completed` | `archived`
- Progress %, current question, time spent, last active
- Linked `sessionId` for server resume
- Optional expiration

Example invite link:

`https://fsbw.vercel.app/studio-institute/invite/3F92KJ8A`

## Resume & autosave

Reuses Expert Capture persistence:

- Continuous autosave (no Save button)
- Invite progress synced to `studio_institute_invites` via PATCH (token-based for invitees)
- Reopening the invite link restores question, transcript, AI state, drafts, and progress via local session + server `sessionId`

## Core modules

- `src/studio-os-core/expert-capture/invite-system/` — types, config, token generation, sync
- `api/studio-institute/invites.ts` — REST API
- `supabase/migrations/20260711000000_studio_institute_invites.sql` — Postgres table

## Owner dashboard actions

Create, copy link, archive, duplicate, delete. Progress and resume links visible per invite.

## Migration to Studio OS domain

Change only configuration:

1. `VITE_PUBLIC_APP_ORIGIN` → `https://studioos.com`
2. Optionally `VITE_STUDIO_INSTITUTE_BASE_PATH` if paths change
3. Deploy same codebase; no FSBW-specific branding in core architecture

## Tests

`src/studio-os-core/expert-capture/invite-system/invite-system.test.ts`
