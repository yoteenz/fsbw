# All In One — Communications System (Sprint 16)

**Status:** Demo implementation under `/debug/all-in-one`  
**Store version:** 16  
**Module:** `src/all-in-one/communications/`

## Purpose

Single canonical conversation architecture connecting prospects, CRM, customers, service workflows, divisions, and notifications — without duplicating legacy `store.messages` long-term (legacy inbox preserved for regression).

## Core entities

| Entity | Role |
|--------|------|
| `CommConversation` | Thread context (subject, type, status, assignment, primary context) |
| `CommParticipant` | Customer, prospect, staff, team |
| `CommMessage` | Human/system communication with channel, direction, visibility |
| `CommDelivery` | Truthful delivery record (portal vs external vs demo) |
| `CommContextLink` | Links to service request, load, invoice, lead, etc. |
| `CommTemplate` + versions | Reusable copy with channel variants |
| `CommRoutingRule` | Type → team routing |
| `CommPreference` / `CommConsentRecord` / `CommSuppression` | Preferences and compliance |

## Conversation status

`open` · `waiting_on_staff` · `waiting_on_customer` · `waiting_external` · `resolved` · `closed` · `archived`

**Needs Reply** is derived from status / `responseResponsibility`, not unread alone.

## Message visibility (mandatory)

- `customer_visible` — portal/API customer endpoints only expose these
- `internal_only` — staff composer internal notes; never leaked to portal
- `restricted_internal` — future role-scoped staff notes

## Channels

`portal` (real in-app delivery) · `email` · `sms` · `phone_log` · `manual_external` · `system`

External channels without provider: **demo / manual / recorded_externally** — never fake `delivered`.

## Routes

| Audience | Path |
|----------|------|
| Customer | `/portal/messages`, `/portal/messages/:id` |
| Staff | `/office/communications`, `/office/communications/:id`, `/office/communications/outbox` |
| Settings | `/office/settings/communications` |

## Integrations

- **CRM:** Lead capture creates conversation; conversion relinks `organizationId` via `relinkConversationOnLeadConversion`
- **Client Command Center:** `buildCommunicationSummary` uses canonical conversations
- **Office Attention:** Needs-reply queue from `commConversations`
- **Client 360:** Recent conversations + needs-response counts
- **Notifications:** Portal message creates deduped notification (title only, not full body duplicate)

## Demo data

Conversations A–H (prospect authority, IRP docs, dispatch delay, factoring, shipper brokerage, insurance, appointment, resolved billing).

## Invariants

- Internal notes never become customer-visible
- `sent` ≠ `delivered` for external channels
- Conversation does not own service/workflow/billing/load state
- Lead conversion preserves history
