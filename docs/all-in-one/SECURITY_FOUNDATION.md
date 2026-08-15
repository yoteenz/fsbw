# All In One — Security Foundation

**Sprint:** 04 — Production Data Foundation  
**Status:** Architecture defined; backend pending dedicated Supabase project credentials

---

## Auth provider

- **Supabase Auth** on a **dedicated All In One Supabase project**
- Isolated storage key: `aio-auth-token` (not Frontal Slayer `baw_sb_*`)
- No shared user records with Frontal Slayer

---

## Session model

- Supabase-managed JWT sessions with auto-refresh
- Persistent login via provider storage
- Logout clears AIO session only
- Frontend route guards supplement — **not** a substitute for RLS

---

## Organization isolation

```
User → Organization Membership → Organization data
```

- Customers access only organizations they belong to
- `aio_user_org_ids()` helper used in RLS policies
- Never trust client-supplied `organizationId` without membership check

---

## Internal / customer separation

| Layer | Customer | Internal staff |
|-------|----------|----------------|
| Auth | Supabase user | Supabase user + `aio_internal_staff` row |
| Office routes | Blocked (backend mode) | Allowed when internal role present |
| Internal notes table | No RLS read policy | Staff-only policies |
| Activity events | `visibility = customer` only | Full visibility |

---

## RLS strategy

All `aio_*` business tables have RLS enabled. Policies use:

- `auth.uid()` for current user
- `aio_is_internal_user()` for staff
- `aio_user_org_ids()` for tenant isolation

Migrations: `all-in-one/supabase/migrations/` — apply **only** to AIO project.

---

## Sensitive data policy

| Classification | Examples | Sprint 04 |
|----------------|----------|-----------|
| PUBLIC | Service catalog, marketing | Config/code |
| ACCOUNT | Name, email, business name | Profiles, orgs |
| BUSINESS CONFIDENTIAL | Requests, roadmap, messages | Encrypted at rest (Supabase default) |
| FINANCIAL SENSITIVE | Banking, funding | **Not collected** |
| FACTORING SENSITIVE | Freight invoice amounts, reported advances/reserves/fees | **Demo staff entry only** — see `FACTORING_SECURITY.md` |
| HIGHLY SENSITIVE | SSN, CDL images, bank creds | **Not collected** |

### Road Ready (Sprint 05)

| Data | Handling |
|------|----------|
| EIN / Tax ID | **Not stored** in Sprint 05 — yes/no/in-progress/not-sure only |
| VIN | Business-sensitive; masked in UI summaries; avoid logging full VIN |
| USDOT / MC numbers | Optional customer entry; **unverified** until staff confirmation |
| Road Ready % | **Server-calculated** — never trusted from client submission |
| Verification audit | Staff actions logged; internal notes not customer-visible |

### Factoring (Sprint 09)

| Data | Handling |
|------|----------|
| Bank account / routing | **Not stored** |
| Reported funding amounts | Staff-entered; org-scoped read for customer |
| Freight invoice amounts | Org-scoped; linked to load |
| Provider API credentials | **Not stored** — future server vault |
| `directFactoringEnabled` | **`false`** — no direct funding surface |

Full boundary spec: **`FACTORING_SECURITY.md`**.

### Brokerage (Sprint 10)

| Data | Handling |
|------|----------|
| Bank account / routing (carrier or shipper) | **Not stored** |
| Shipper freight charge / carrier pay | Role-filtered visibility — see `brokerageRules.ts` |
| Gross margin | Broker staff only |
| `brokerageCapability` | Staff-only write; default `demo` |
| Rate confirmation production PDF | Dev template only until activation |

Full boundary spec: **`BROKERAGE_SECURITY.md`**.

---

## Storage boundary

- Document **metadata** in Postgres
- File blobs: dedicated AIO storage bucket (future sprint)
- **Never** Frontal Slayer storage buckets

---

## Audit logging

`aio_activity_events` records:

- `event_type`, `actor_user_id`, `organization_id`
- `entity_type`, `entity_id`, `visibility`, `metadata`
- Server timestamps (`created_at`)

Do not store full sensitive payloads in metadata.

---

## Environment separation

| Variable | Purpose |
|----------|---------|
| `VITE_AIO_DATA_MODE` | `demo` or `backend` |
| `VITE_AIO_SUPABASE_URL` | AIO project URL only |
| `VITE_AIO_SUPABASE_ANON_KEY` | AIO anon key only |

**Never** reuse Frontal Slayer Supabase credentials.

---

## Secrets handling

- Anon key is public (client-side) — RLS must protect data
- Service role key: server-only, not in frontend (future API routes)
- Test account passwords: team secrets, not in repository

---

## Known limitations (Sprint 04)

1. Dedicated AIO Supabase project credentials not yet in environment — demo mode default
2. Document file uploads not implemented
3. Office UI still reads demo store in demo mode (by design)
4. Email verification flow depends on Supabase project settings
5. No SMS/email messaging integrations
6. No payment processing

---

## Future security work

- Server-side API layer for privileged operations
- MFA for internal staff
- Rate limiting on auth endpoints
- Field-level encryption for financial data
- SOC2-aligned audit export
- Penetration testing before production launch

---

## Frontal Slayer protection checklist

After each sprint verify:

- [ ] No changes to `supabase/migrations/` Frontal Slayer schema for AIO data
- [ ] No AIO data in FS admin tools
- [ ] No shared auth cookies/storage keys
- [ ] No AIO routes in FS customer navigation
- [ ] No CSS leakage between products
