# AIO Desktop Context Rail System

**Scope:** Desktop / large desktop / ultrawide only (≥1280px persistent rail). Mobile and tablet unchanged.

## Purpose

Large AIO pages must not stretch content edge-to-edge on ultrawide monitors. The context rail answers:

- Where am I?
- What is this page for?
- What are the major sections / steps?
- What matters next?

Global header navigation answers *where can I go*. The context rail answers *where am I in this experience*. The workspace is where work happens.

## Architecture

```
viewport (full-bleed background)
└── acr-shell__frame (max ~2200–2400px centered)
    ├── AioContextRail (sticky, ~280–380px)
    └── acr-workspace (max ~72–88rem readable width)
```

### Components

| Component | Path |
|-----------|------|
| `AioContextRail` | `src/components/context-rail/AioContextRail.tsx` |
| `AioDesktopContextShell` | `src/components/context-rail/AioDesktopContextShell.tsx` |
| `useContextRailScrollSpy` | `src/components/context-rail/useContextRailScrollSpy.ts` |
| Config builders | `src/context-rail/configs.tsx` |

### CSS tokens (`aio-context-rail.css`)

| Token | Role |
|-------|------|
| `--acr-rail-width` | `clamp(280px, 22vw, 380px)` |
| `--acr-workspace-max` | Main content cap |
| `--acr-shell-max` | Overall shell cap |
| `--acr-page-gutter` | Horizontal padding |

## Breakpoint behavior

| Tier | Width | Behavior |
|------|-------|----------|
| Mobile | <1024px | No persistent rail |
| Compact desktop | 1024–1279px | Collapsible drawer via menu bar |
| Standard+ | ≥1280px | Full sticky context rail |

## Rail variants

- `journey` — numbered steps with complete/current/future (Start Your Business, Smart Intake)
- `navigation` — section links (service hubs, contact intents)
- `service` — scroll-spy sections + CTA footer (service detail, bookkeeping)
- `dashboard` / `document` / `marketplace` — portal module orientation

## Page-family mappings

| Family | Rail source |
|--------|-------------|
| Smart Intake | Existing `SmartIntakeJourneyRail` (reference; shares visual language) |
| Start Your Business | `buildStartBusinessRail()` |
| SYB sub-pages | `StartBusinessStepShell` |
| Road Ready public | `buildRoadReadyRail()` |
| Service hub (division) | `buildServiceHubRail()` |
| Service detail | `buildServiceDetailRail()` + scroll spy |
| Bookkeeping | `buildBookkeepingRail()` |
| Contact | `buildContactRail()` |
| Portal modules | `resolvePortalModuleRail()` — FleetCare, DriverLink, Vault, Dispatch only |

**Excluded by design:** Homepage, auth pages, mobile layouts.

## i18n

Namespace: `contextRail` — `locales/en|es/contextRail.json`

## Accessibility

- Rail uses `<aside>` + `<nav>` where appropriate
- `aria-current="step"` for journey current step
- Keyboard-focusable links and scroll-target buttons
- Active state uses border + typography, not color alone

## Ultrawide rules

At 2560px+, rail width stays ~300–380px; workspace caps via `--acr-workspace-max`; outer viewport absorbs negative space. No infinite form stretch.

## Smart Intake relationship

Smart Intake retains its dedicated shell (`SmartIntakeLayout`) and `si-*` classes as the approved reference. Public pages use shared `acr-*` system with the same visual language (dark rail, gold accents, sticky journey steps).
