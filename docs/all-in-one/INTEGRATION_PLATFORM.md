# All In One — Integration Platform

**Sprint:** 18 · **Status:** Complete (debug phase)

## Purpose

The Integration Platform is the single boundary through which All In One connects to external systems. Feature modules must not embed provider logic directly.

## Core domain

| Concept | Role |
|---------|------|
| **IntegrationProvider** | Catalog entry for an external service (capabilities, category, requirement state) |
| **IntegrationConnection** | All In One's configured relationship (environment, status, health, enabled capabilities) |
| **IntegrationCredentialReference** | Safe metadata pointer — never stores secrets in client-readable records |
| **IntegrationOperation** | Every external call (idempotency key, status, correlation ID) |
| **IntegrationWebhookEvent** | Inbound provider events (dedupe, verification, async processing) |
| **IntegrationSyncJob / Cursor** | Bounded sync with explicit direction and ownership |
| **IntegrationReconciliationIssue** | Mismatches requiring human review |
| **IntegrationConsent** | Customer-authorized connections |
| **CarrierExternalVerification** | Regulatory lookup results with provenance |

## Environments

Connections are **DEMO**, **SANDBOX**, or **PRODUCTION**. Sandbox and production must never be ambiguous in UI or configuration.

## Adapter architecture

Base contract (`IntegrationAdapter`):

- `verifyConnection()` — connection is CONNECTED only after verification succeeds
- `getCapabilities()` — explicit capability list
- `execute()` — typed operations with idempotency
- `sync()` — optional bounded sync
- `disconnect()` — safe teardown

Feature-specific adapters extend the base: regulatory, payment, email, SMS, maps, load board, factoring, insurance, accounting, calendar, telematics, e-signature, verification.

## Anti-corruption layer

Provider enums and schemas are translated at the adapter boundary. Unknown provider values map to `UNKNOWN_EXTERNAL_STATUS` — never silently coerced.

## Demo adapters (Sprint 18)

All demo adapters perform **no external network calls**:

- Demo Regulatory (USDOT 1234567)
- Demo Payment (webhooks, idempotency)
- Demo Email / SMS
- Demo Maps (Atlanta → Dallas, labeled DEMO)
- Demo Load Board (import only)
- Demo Factoring / Insurance / Accounting

## Code locations

- `src/all-in-one/integrations/` — types, engine, registry, adapters, seed
- `src/all-in-one/demo/integrationActions.ts` — demo store actions
- Office UI — `/office/integrations`, `/office/settings/integrations`
- Portal — `/portal/settings/connections`

## Management integration

Integration health and reconciliation feed the Sprint 17 Management Attention Engine deterministically.

## Extraction

All integration code lives under `src/all-in-one/` and is independently extractable from Frontal Slayer.
