# Integration Security

## Credentials

- Secrets never in frontend, localStorage, git, debug JSON, logs, or error messages
- `IntegrationCredentialReference` stores `referenceKey`, `maskedHint`, expiry metadata only
- Future: platform vault / dedicated secret manager via `AIO_SECRET_PROVIDER`

## OAuth foundation

States: STARTED → REDIRECTED → CALLBACK_RECEIVED → CONNECTED | FAILED | EXPIRED

- Cryptographically secure state, short TTL, one-time use, PKCE where supported
- Token exchange server-side only — refresh tokens never in browser

## Webhooks

- Signature verification where provider supports
- Timestamp validation and replay protection
- Payload size limits
- Deduplication by `externalEventId`
- Acknowledge quickly; process asynchronously

## Redaction

Central utility: `integrationRedaction.ts` — Authorization headers, API keys, tokens, PAN patterns

## Permissions

See `integrationPermissions.ts` — mapped to Office roles in `officeContext.ts`

## Customer authorization

`IntegrationConsent` records purpose, scope, grant/revoke — distinct from generic Terms acceptance

## Environment separation

`isSandboxIsolationOk()` prevents sandbox connections from reaching production configuration

## Audit

`IntegrationAuditEvent` — connection, credential, authorization, sync, webhook, reconciliation actions (safe detail only)
