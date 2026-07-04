# THE STUDIO — Social Publishing Connectors

Official OAuth only. No passwords, browser automation, scraping, or unofficial posting.

## Setup

1. Run `supabase/migrations/20260704120000_studio_social_publishing.sql` in Supabase SQL Editor.
2. Set Vercel env vars (see `.env.example` — Social Publishing section).
3. Set `SITE_URL` to your production origin (OAuth redirect).
4. Set `SOCIAL_TOKEN_ENCRYPTION_SECRET` (16+ characters).

## Admin UI

- **Social Accounts:** `/admin/studio/social-accounts` — connect Meta (Instagram/Facebook), TikTok, Pinterest, X.
- **Distribution pack → SOCIAL tab:** channel preview, caption, hashtags, thumbnail, schedule, approve, publish.

## API (admin Bearer token)

| Route | Purpose |
|-------|---------|
| `GET /api/admin/social-accounts` | Connection status (no tokens) |
| `POST /api/admin/social-accounts` | `{ action: 'oauth_start', platform }` |
| `GET /api/admin/social-accounts-oauth-callback` | OAuth redirect handler |
| `DELETE /api/admin/social-accounts?platform=` | Disconnect |
| `PATCH /api/admin/social-accounts` | `{ platform, postingDisabled }` |
| `POST /api/admin/social-posts` | save_draft, submit_approval, approve, schedule, publish |
| `GET /api/admin/social-publish-log` | Audit log |

## Approval rules

- Content pack should be **approved** before schedule/publish.
- Each social post must be **admin-approved** (`approval_status=approved`) before publish or schedule.
- Unapproved AI-generated content is never auto-published.

## Audit

Every action is logged to `studio_social_publish_log` and `audit_log` (who, when, platform, caption, asset, result, errors).
