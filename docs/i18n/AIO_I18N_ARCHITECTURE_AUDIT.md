# AIO Multilingual / i18n Architecture Audit (Phase 0)

**Project:** All In One Enterprises Inc.  
**Date:** 2026-08-17  
**Scope:** `all-in-one-enterprises/`

---

## Executive summary

**No i18n system exists.** The application is English-only with hard-coded strings in components, config modules, and `index.html` (`lang="en"`). Locale usage is limited to `toLocaleDateString('en-US')` formatting — not translation.

This sprint introduces **react-i18next** with **en-US** and **es-US** as first-class locales.

---

## 1. Current string locations (high priority for migration)

| Domain | Primary files | String volume |
|--------|---------------|---------------|
| Public nav | `data/publicNavigation.ts`, `components/AIONav.tsx` | High |
| Homepage | `config/appConfig.ts`, `components/homepage/*`, `data/homepageMobileContent.ts` | High |
| Auth | `pages/auth/*`, `components/auth/*` | Medium |
| Portal nav | `layouts/AIOPortalLayout.tsx` | High |
| Road Ready | `road-ready/roadReadyConfig.ts`, `RoadReadyStatusBadge.tsx` | Very high |
| FleetCare | `fleetcare/fleetcareConfig.ts`, FleetCare pages | Medium |
| Vault | `vault/vaultConfig.ts`, `vaultTaxonomy.ts` | Medium |
| Validation | Scattered in form components | Medium |

---

## 2. Stack compatibility

- **React 19** + **Vite 5** — compatible with `react-i18next` + `i18next`
- No SSR — client-side locale switching only
- No duplicate routes per language in Phase 1

---

## 3. Recommended architecture

```
src/i18n/
  index.ts              — init, supported locales, fallback
  localeStorage.ts      — guest preference (localStorage)
  format.ts             — date/number/currency via Intl
src/locales/
  en/
    common.json
    nav.json
    auth.json
    homepage.json
    driverLink.json
    fleetCare.json
    portal.json
    validation.json
  es/
    (same structure)
src/components/i18n/
  LanguageSelector.tsx
  I18nProvider.tsx      — sync html lang + dir
```

**Library:** `i18next` + `react-i18next`

**Key convention:** Semantic keys — `driverLink.findWork`, `auth.login`, `nav.roadReady`

**Status codes:** Canonical in DB (`application_submitted`); translated in UI via `driverLink.status.*`

---

## 4. Locale preference strategy

| Context | Source |
|---------|--------|
| Guest | `localStorage` key `aio_preferred_locale` |
| Authenticated | Profile field `preferred_language` (future Supabase); demo: localStorage |
| Precedence | Session explicit selection > profile > stored guest > browser `navigator.language` > `en-US` |
| Fallback | `en-US` for missing keys; dev warns on missing keys |

**URL strategy:** No `/en/` `/es/` route duplication in this sprint — profile/state driven for app UI. Document SEO localized URLs as future option.

---

## 5. Language selector placement

- Public: `AIONav.tsx` (desktop + mobile drawer)
- Auth pages: login/signup header
- Portal: `AIOPortalLayout.tsx` header
- Driver portal: driver layout header

**Accessibility:** Button/menu semantics, `aria-label`, current language indication — **no flags-only UI**.

---

## 6. Date / number / currency

- Centralize in `src/i18n/format.ts` using `Intl.DateTimeFormat`, `Intl.NumberFormat`
- Currency stays **USD** — language ≠ currency
- Replace scattered `toLocaleString('en-US')` over time

---

## 7. Notifications & email

- Store `event_type` + payload — render localized at display time
- Email templates: prepare locale field on recipient preference (foundation only this sprint)

---

## 8. User-generated content

- Do **not** auto-translate UGC
- Job descriptions preserve original language
- Future: optional "Translate message" action

---

## 9. Official documents vs guidance

- Vault documents retain authoritative language metadata
- Translated UI labels for credential **types** — not machine-translated official forms

---

## 10. RTL readiness

- New i18n components use logical CSS where practical
- Full RTL conversion deferred; `dir` attribute set from locale config for future Arabic

---

## 11. Demo mode

- Locale switching works in demo
- Spanish-speaking driver scenario in DriverLink seed

---

## Implementation phases (this sprint)

1. Install + init i18next
2. Create en/es resource files for: common, nav, auth, homepage, driverLink, fleetCare, portal, validation
3. LanguageSelector + wire to public/auth/portal layouts
4. Migrate homepage hero, auth login, DriverLink pages, FleetCare key strings
5. Document coverage in `AIO_SPANISH_TRANSLATION_QA.md`
