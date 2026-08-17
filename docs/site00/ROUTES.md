# SITE 00 Routes

## Implemented (Foundation V1.1)

| Path | Screen | Environment |
|------|--------|-------------|
| `/origin` | Origin / Homepage (mobile-first) | ORIGIN_ENVIRONMENT |
| `/origin/desktop` | Origin desktop artboard (1440px, scaled) | ORIGIN_ENVIRONMENT |
| `/enter` | ENTER 00 / Waiting Room | ENTER_00_WAITING_ROOM |
| `/idnty` | IDNTY entry (redirect) | — |
| `/idnty/state` | Brand State selection | WORKFLOW_ENVIRONMENT |
| `/bldr` | BLDR entry (redirect) | — |
| `/bldr/state` | Build State selection | WORKFLOW_ENVIRONMENT |

## ASSTS Asset Vault (admin-only)

| Path | Screen | Environment slot |
|------|--------|------------------|
| `/assts` | Library dashboard | `assts.library.environment.mobile` |
| `/assts/batches/:batchId` | Batch review grid | `assts.batch.environment.mobile` |
| `/assts/:assetId` | Asset inspection | `assts.inspection.environment.mobile` |

See `docs/site00/ASSTS.md`.

## Root behavior

| Condition | `/` behavior |
|-----------|--------------|
| Default | Frontal Slayer `HomeLandingRedirect` |
| `VITE_SITE00_ROOT=1` | SITE 00 Origin |

## Global navigation (top bar)

`SITES` · `SERVICES` · `SYSTEM` · `ABOUT` · `JOURNAL` + `ENTER 00` / `EXIT 00`

Disabled until screen inventory sprint (not falsely active on Origin).

## Reserved future namespaces

Not populated this sprint — reserved in `SITE00_FUTURE_ROUTES`:

```
/idnty/*       — assessments, creative directions, production
/bldr/*        — discovery questionnaire, scope
/bluprint/*    — three blueprint directions A/B/C
/build/*       — production environment
/control/*     — authenticated client CTRL ROOM
/live/*        — deployed digital place
/projects/*    — client projects
/account/*     — authentication
/support/*     — support
```

Placeholder redirects: `/bluprint/*`, `/build/*`, `/control/*`, `/live/*` → `/origin`

## ENTER / EXIT

- **ENTER 00** (`/enter`): full environment transition from Origin
- **EXIT 00**: returns to `/origin` — not a drawer, not compressed homepage behind

## Constants

Single source: `src/site00/config/routes.ts`
