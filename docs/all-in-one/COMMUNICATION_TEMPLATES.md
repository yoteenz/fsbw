# Communication Templates (Sprint 16)

## Model

- `CommTemplate` — slug, name, category, pointer to current version
- `CommTemplateVersion` — `draft` | `published` | `retired`
- Channel bodies: `portalBody`, optional `emailBody`, `smsBody`

Published versions are immutable for historical messages.

## Variables

Safe substitution only: `{{first_name}}`, `{{business_name}}`, `{{service_name}}`, `{{document_name}}`, `{{appointment_date}}`, `{{staff_name}}`, `{{invoice_number}}`, `{{load_reference}}`

Implementation: `renderTemplate()` in `communicationActions.ts` — no code execution.

## Demo templates

Welcome, Documents Needed (seed in `communicationsSeed.ts`).

## Workflow usage

Automation should reference template slug + version id; workflow components must not hard-code customer copy.

## Preview

Settings UI lists templates; full email-client preview deferred until provider integration.
