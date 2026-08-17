# AIO Multilingual Architecture

**Locales:** `en-US` (default), `es-US`  
**Library:** i18next + react-i18next  
**Init:** `src/i18n/index.ts` via `main.tsx`

## Resource structure
```
src/locales/{en,es}/
  common.json, nav.json, auth.json, homepage.json
  driverLink.json, fleetCare.json, portal.json, validation.json
```

## Preference
- Guest: `localStorage` key `aio_preferred_locale`
- Authenticated: `preferred_language` on profile (migration column)
- Fallback: English for missing keys (dev warns)

## Selector
`LanguageSelector` on public nav, portal sidebar. Accessible select — no flags-only.

## Formatting
`src/i18n/format.ts` — Intl date/number/currency. Currency stays USD.

## Notifications / email
Store event type + payload; localize at render. Email locale foundation prepared.

## UGC & jobs
Original job description language preserved (`content_language`). No auto-translation of UGC.

## RTL
Logical CSS in new components; full RTL deferred.

## Future locales
Add JSON folder + register in `i18n/index.ts` — no component redesign required.
