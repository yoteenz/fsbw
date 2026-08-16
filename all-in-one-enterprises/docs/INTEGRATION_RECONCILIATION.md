# Integration Reconciliation

## Issue types

- MISSING_EXTERNAL_RECORD / MISSING_INTERNAL_RECORD
- STATUS_MISMATCH / AMOUNT_MISMATCH / IDENTIFIER_MISMATCH
- DUPLICATE_EXTERNAL_RECORD / STALE_DATA

## Financial mismatches

**Never auto-resolved.** Demo seed includes payment amount mismatch ($1,250 provider vs $1,150 internal).

## Resolution

Authorized staff resolves via Reconciliation Center with audit note. `RECONCILIATION_RESOLVED` audit event recorded.

## Management

Critical open issues appear in Management Attention Engine.

## Route

`/office/integrations/reconciliation`
