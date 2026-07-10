# Expert Capture — Save, Exit & Resume

Shared persistence infrastructure for all Studio Institute Expert Capture interviews.

## Production routes

| Interview | URL |
|-----------|-----|
| Generic MVP | https://fsbw.vercel.app/expert-capture |
| All In One Permitting | https://fsbw.vercel.app/expert-capture/all-in-one-permitting |
| Tax Preparation | https://fsbw.vercel.app/expert-capture/tax-preparation |
| Guest resume entry | https://fsbw.vercel.app/expert-capture/resume?token=… |

## Architecture

### Canonical session model

- **Client:** `ExpertCapturePersistedDocument` in `src/studio-os-core/expert-capture/persistence/types.ts`
- **Server:** `expert_capture_sessions.session_document` (JSONB) + indexed columns for list/recovery
- **Local cache:** profile-scoped `localStorage` session + IndexedDB media blobs

### Autosave

- `ExpertCaptureAutosaveManager` saves after every `persist()` call (debounced 400ms)
- Recording interval: every **12 seconds** while answering
- `pagehide` / `beforeunload` flush
- Status: Saving… / Saved / Save Failed / Offline — changes pending / Uploading answer…

### Media persistence

- Each answer = one media segment
- Upload via `POST /api/expert-capture/media` (direct ≤4MB or signed URL)
- Checksum SHA-256; partial recordings flagged `is_partial` — never training-eligible until approved
- Failed uploads stay in IndexedDB with **Upload Pending**

### Guest resume security

- Unguessable **resume token** (32-byte base64url); only **SHA-256 hash** stored server-side
- Token TTL: **90 days** (configurable)
- Resume link: `/expert-capture/resume?token=…` → redirects to profile route
- Guest sessions keyed by `guestSessionId` in localStorage
- Authenticated experts: sessions also linked to Supabase `expert_user_id` when signed in

### Cross-device resume

1. Open resume link or return to profile URL with saved session
2. `GET /api/expert-capture/session` loads canonical document from Supabase
3. Local cache reconciled to server version
4. Media references restored from `expert_capture_media`

### Conflict resolution

- Optimistic concurrency via `sessionVersion`
- **409** if server version > client expected version → expert chooses version (device conflict UI)
- Active device lock: 5-minute stale window; **Continue Here** calls `claimDevice`

### Recovery states

`draft` · `in_progress` · `paused` · `interrupted` · `awaiting_transcript` · `awaiting_review` · `awaiting_clarification` · `ready_to_resume` · `complete` · `exported` · `archived` · `deleted`

### API routes

- `GET/POST/DELETE /api/expert-capture/session`
- `POST /api/expert-capture/media`

### Migration

Run `supabase/migrations/20260710230000_expert_capture_sessions.sql` in Supabase SQL Editor.

Requires `SUPABASE_SERVICE_ROLE_KEY` on Vercel for server persistence and media storage bucket `expert-capture-media`.

## Test scenarios (manual)

1. Leave before first question → Welcome Back on return  
2. Save & Exit mid-interview → resume at same question  
3. Refresh during understanding review → review restored  
4. Close tab during recording → interrupted recovery screen  
5. Copy resume link → open on another browser  
6. Start Over → archive or delete  
7. Export partially completed draft from session dashboard  

Offline: local cache continues; server sync queues until online. UI shows **Offline — changes pending**; never shows **Saved** until server confirms (when online).
