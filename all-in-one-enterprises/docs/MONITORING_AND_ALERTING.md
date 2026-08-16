# MONITORING AND ALERTING — All In One

## Health endpoints

- Liveness/readiness: `buildHealthSnapshot()` in app; deploy `/api/health` and `/api/ready` with host
- Production Config Center shows dependency status

## Structured logging

`logStructured()` — timestamp, environment, correlation ID, event, severity. PII redacted.

## Error monitoring

Adapter architecture ready; provider (e.g. Sentry) **NOT_CONFIGURED** until account selected.

Do not send raw form payloads or secrets to monitoring.

## Alerts (when configured)

- Repeated auth failures
- Webhook signature failures
- Migration failures
- Backup failures
- Elevated error rate

## Ownership

Document alert destinations in ops runbook — do not hard-code personal contacts in source.

## Uptime

Prepare monitors for public site, API health, auth path, portal — no SLA claims.
