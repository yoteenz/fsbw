# Communication Provider Architecture (Sprint 16)

## Interfaces

- `EmailProvider` — `isConfigured()`, `send()`
- `SmsProvider` — same
- Future: `CalendarProvider`

Location: `src/all-in-one/communications/communicationProviders.ts`

## Demo mode (current)

- `DemoEmailProvider` / `DemoSmsProvider` — always `manualRequired`, status `demo`
- Portal messages use internal delivery (`portalDeliveryResult`) — real in-app
- Staff UI: **Copy Email** / **Record as Sent Externally** — status `recorded_externally`

## Delivery records

`CommDelivery` tracks provider, status, timestamps — no fabricated provider IDs.

## Credentials

Must live in server environment only — never frontend, DB plaintext, or debug UI.

## Webhooks (foundation)

`webhookFoundation` stub: signature verification, idempotency hooks — no fake events in demo.

## Adding a provider later

1. Implement interface with real `isConfigured()` check
2. Set `commSettings.providerMode` to `provider`
3. Map webhook events to `CommDelivery` updates
4. Reuse preference/consent/suppression gates
