# All In One — Security Test Matrix

**Sprint 19** · **Sprint 21 re-run:** PASS — `security.test.ts` (16) + `integrations.test.ts` (25) + `qa/crossDomain.test.ts`  
Integration security: `src/all-in-one/integrations/integrations.test.ts` (25 tests)

**Live Supabase RLS:** REQUIRES_PRODUCTION_ENVIRONMENT (see QA-002)

---

## Authorization matrix (sample)

| Resource | Customer A | Customer B | Dispatcher | Finance | Owner |
|----------|------------|------------|------------|---------|-------|
| Own invoice | ✓ | ✗ | N/A | ✓ (staff) | ✓ |
| Other invoice | ✗ | ✓ | N/A | ✓ (staff) | ✓ |
| Financial export | ✗ | ✗ | ✗ | ✓ | ✓ |
| Integration secrets | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## IDOR tests

Replace invoice, document, organization IDs in customer context — must deny without leak.

---

## Injection / XSS / CSV

- CSV formula prefixes neutralized  
- XSS: no `dangerouslySetInnerHTML` in AIO module; payloads stored as text  
- Upload: blocked extensions + MIME/signature mismatch  

---

## Session tests

Revoke session; permission override removes export mid-session.

---

## FS isolation

`fsIsolation.ts` + documented boundary — AIO must not consume FS auth keys for decisions.

---

## Manual QA journeys

See Sprint 19 spec QA Journeys 1–24 (customer isolation, staff permissions, document download, webhook attack, production gate, demo reset, mobile security).
