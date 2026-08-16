# All In One — Audit System

**Sprint 19** · Distinct from operational activity log (`store.activity`).

---

## Security audit events

Model: `SecurityAuditEvent` in demo store `securityAuditEvents`.

Answers: **who**, **did what**, **to what**, **when**, **result**, **correlation ID**.

Event types include: login, logout, session revoked, permission changed, financial record changed, document downloaded, export created, integration credential changed, privacy request, demo reset blocked, incident action.

---

## Before / after

Sensitive mutations may store redacted `beforeSnapshot` / `afterSnapshot`. Secrets never stored in audit payloads.

---

## Immutability boundary

Ordinary users cannot edit audit rows in product UI. Append-only architecture planned for production Postgres; demo store is mutable on reset only.

---

## Retention

Configurable via `securitySettings.auditRetentionDays` (default 365). Legal retention **TBD**.

---

## Search UI

`/office/security/audit` — filter by event type, paginated (max 50 per view).

Permissions: `security.audit.read`.
