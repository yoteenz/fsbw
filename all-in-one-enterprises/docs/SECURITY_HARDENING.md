# All In One — Security Hardening (Sprint 19)

**Status:** Debug architecture implemented · Production enforcement completes in Sprint 20+  
**Scope:** Platform-wide security, privacy, audit, and resilience controls — not decorative UI.

---

## Principle

Security is enforced at **identity, session, authorization, data, API, storage, integrations, audit, and operations** — not via frontend route guards alone.

All In One does **not** claim SOC 2, PCI, HIPAA, GDPR, or other formal certification. Controls are **security-readiness** and **compliance-supporting** only.

---

## Module map

| Area | Location |
|------|----------|
| Types & models | `src/all-in-one/security/securityTypes.ts` |
| Control registry | `src/all-in-one/security/securityControlRegistry.ts` |
| Data classification | `src/all-in-one/security/dataClassification.ts` |
| Object authorization | `src/all-in-one/security/authorizationGuard.ts` |
| Audit | `src/all-in-one/security/securityAudit.ts` |
| Production gate | `src/all-in-one/security/productionGate.ts` |
| File/upload security | `src/all-in-one/security/fileSecurity.ts` |
| Rate limits | `src/all-in-one/security/rateLimitPolicy.ts` |
| Redaction / CSV safety | `src/all-in-one/security/securityRedaction.ts` |
| FS isolation checks | `src/all-in-one/security/fsIsolation.ts` |
| Demo actions | `src/all-in-one/demo/securityActions.ts` |
| Demo seed v18 | `src/all-in-one/security/securitySeed.ts` |

---

## Identity & session

- **Auth:** Dedicated AIO Supabase project (planned Sprint 20); isolated `aio-auth-token` storage key.
- **Passwords:** Never stored in application code or demo store; provider hashing only.
- **MFA:** Policy architecture (`OPTIONAL` → `REQUIRED_FOR_ALL_STAFF`) in `securitySettings.mfaPolicy`.
- **Sessions:** `securitySessions` model; revoke with audit; idle/absolute policy in settings.
- **Account enumeration:** Uniform password-reset messaging via `safePasswordResetResponse()`.

---

## Authorization

- **Default deny** — `authorizationGuard.canAccessResource()` validates principal + scope per resource type.
- **Customer isolation** — Organization ID must match for invoices, documents, requests, conversations, appointments, loads.
- **Staff permissions** — Role bundles in `officeContext.ts`; revocations via `staffPermissionOverrides`.
- **Financial export** — Requires `reports.export` or `billing.manage`; audited bulk export via `attemptBulkExport()`.

---

## Documents & files

- Upload validation: size, MIME allowlist, extension blocklist, magic-byte check, quarantine status.
- Signed download grants: short-lived tokens in `signedDownloadGrants` (demo).
- Malware scanning: lifecycle states defined; **no scanner connected in debug**.

---

## Integrations (Sprint 18 + 19 review)

- Secrets server-only; credential references in client.
- Webhook signature validation in demo payment adapter.
- See `INTEGRATION_SECURITY.md`.

---

## Browser & API

- CSV formula injection neutralized in `managementExport.ts`.
- PII redaction helpers for logs.
- Rate limit policy registry (in-memory demo counters).
- Pagination max 100; JSON body size documented.

---

## Debug vs production

- `securitySettings.environmentLabel`: `DEBUG` | `DEMO` | `PRODUCTION`
- `canLaunchProduction()` returns `BLOCKED` with explicit reasons in debug.
- Demo reset refused when simulating production (`resetDemoStore()`).

---

## Frontal Slayer isolation

Temporary co-hosting in Frontal Slayer repo **must not** create shared auth, database, storage, or payment boundaries. See `fsIsolation.ts` and `DEBUG_ARCHITECTURE.md`.

---

## UI routes (debug base `/all-in-one`)

| Route | Purpose |
|-------|---------|
| `/office/security` | Security Center |
| `/office/security/audit` | Audit search |
| `/office/security/incidents` | Incident center |
| `/office/security/production-readiness` | Launch checklist |
| `/office/privacy` | Privacy center |
| `/office/settings/security` | Security settings |
| `/portal/settings/security` | Customer sessions |
| `/portal/settings/privacy` | Customer privacy |

---

## Tests

`src/all-in-one/security/security.test.ts` — IDOR, staff permissions, CSV injection, upload validation, production gate, rate limits, FS isolation (16 tests).
