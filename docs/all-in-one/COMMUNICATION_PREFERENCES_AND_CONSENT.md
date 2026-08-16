# Communication Preferences & Consent (Sprint 16)

## Preferences (`CommPreference`)

Per organization, contact, or lead:

- `preferredChannel` — `portal` | `email` | `sms` | `phone_log` | …
- `emailAllowed`, `smsAllowed`, `portalAllowed`, `phoneAllowed`
- `marketingEmailAllowed`, `marketingSmsAllowed` (separate from transactional)
- `timezone`

**Default:** Unknown preference does **not** grant email/SMS; portal may still be used for in-app service messages.

## Categories

`transactional` · `service` · `sales` · `marketing` · `emergency_operational`

Marketing must not use transactional consent.

## Consent records (`CommConsentRecord`)

Append-only history: `unknown` | `granted` | `declined` | `revoked` | `not_required_by_policy`

## Suppression (`CommSuppression`)

Reasons include `do_not_contact`, `sms_opt_out`, `customer_request`, etc.  
Suppression blocks sends; does not delete contact.

## Policy evaluation

`canSendChannel(pref, channel, category)` in `communicationEngine.ts` — used before external send attempts.

## Future provider requirements

When live email/SMS is added: STOP/UNSUBSCRIBE webhooks, bounce handling, and audit must consume the same preference/consent/suppression tables.
