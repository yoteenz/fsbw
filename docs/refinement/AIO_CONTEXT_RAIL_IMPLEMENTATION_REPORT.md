# AIO Context Rail — Implementation Report

**Date:** 2026-08-17  
**Sprint:** Desktop information-architecture + responsive layout enhancement

## Summary

Implemented a reusable **desktop-only context rail system** (`acr-*`) so major AIO workflows use a two-column composition on large screens: contextual left rail + capped main workspace. Mobile/tablet layouts are unchanged.

## Components created

- `src/components/context-rail/` — `AioContextRail`, `AioDesktopContextShell`, scroll spy hook, types
- `src/context-rail/configs.tsx` — page-family rail builders
- `src/context-rail/StartBusinessStepShell.tsx` — SYB milestone wrapper + `PortalModuleContextRail`
- `src/styles/aio-context-rail.css` — tokens, breakpoints, portal nested rail
- `src/locales/en|es/contextRail.json` — i18n

## Pages / templates migrated

| Surface | Change |
|---------|--------|
| `ServiceHubTemplate` | Optional `contextRail` prop |
| `ServiceDetailTemplate` | Context rail + section IDs for scroll spy |
| `ServiceCatalogDetailPage` | Hub + detail rails |
| `StartYourBusinessPage` | Journey rail with live progress |
| `start-business/*` (4 pages) | `StartBusinessStepShell` |
| `RoadReadyPublicPage` | Assessment journey rail |
| `BookkeepingPage` | Section navigation rail |
| `ContactPage` | Intent topic rail |
| `AIOPortalLayout` | Module context rail (FleetCare, DriverLink, Vault, Dispatch) |

## Not migrated (intentional)

- **Homepage** — remains cinematic full-width
- **Auth pages** — existing focused auth shell
- **Smart Intake** — keeps dedicated `si-*` reference implementation (visual parity with `acr-*`)
- **Office** — global staff nav sufficient for sprint 1; module rails deferred
- **Factoring / FleetCare public / DriverLink public** — follow same template pattern; can adopt `contextRail` prop next pass

## Mobile regression

- Rail hidden `<1024px`; compact drawer at 1024–1279 only when shell present
- No changes to mobile-only components (`.aio-mobile-only` paths preserved)
- Portal module rail hidden below 1280px; `:not(:has(.acr-portal-module))` keeps single-column when no module rail

## Desktop / ultrawide QA

- Build: `npm run build` PASS
- Shell max-width + workspace cap verified via CSS tokens
- Manual QA recommended at 1280, 1920, 3440 for Start Your Business, service detail, bookkeeping

## Known exceptions

- Portal overview rail omitted to avoid duplicating global portal sidebar
- Scroll spy on long pages is lightweight IntersectionObserver; disable with `scrollSpy={false}` on shell
- `buildPortalOverviewRail` retained in configs for future command-center use

## Docs

- `docs/design/AIO_DESKTOP_CONTEXT_RAIL_SYSTEM.md`
