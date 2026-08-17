# SITE 00 Bible — Foundation V1.1

**Canon rule:** Before implementing or redesigning any SITE 00 experience, read this Bible and the current approved references. Do not silently reinterpret established product behavior. If implementation conflicts with canon, **flag the conflict** — do not invent a new product decision.

## Product definition

**SITE 00** — WHERE DIGITAL PLACES BEGIN.

SITE 00 is simultaneously:

1. The public-facing studio/brand website
2. The entry point into SITE 00 services
3. A guided system that determines what a client actually needs
4. A future authenticated client environment
5. A production methodology from definition through launch
6. An architectural metaphor for navigating digital production

## Production lifecycle (interface)

```
ORIGIN → IDNTY → BLDR → BLUPRNT → BUILD → CTRL ROOM → LIVE → (EVOLVE)
```

## Methodology (underlying)

```
DISCOVER → CLASSIFY → DEFINE → PROPOSE → APPROVE → BUILD → REVIEW → LAUNCH → EVOLVE
```

**Critical principle:** Clients choose outcomes. SITE 00 determines implementation.

## Foundation V1.1 — implemented screens

| Reference | Route | Status |
|-----------|-------|--------|
| 01_ORIGIN_APPROVED | `/origin` (or `/` when `VITE_SITE00_ROOT=1`) | Implemented |
| 02_ORIGIN_IDNTY_EXPANDED | Homepage state `idnty-expanded` | Implemented |
| 03_ORIGIN_BLDR_EXPANDED | Homepage state `bldr-expanded` | Implemented |
| 04_IDNTY_BRAND_STATE | `/idnty/state` | Implemented |
| 05_BLDR_BUILD_STATE | `/bldr/state` | Implemented |
| 06_ENTER00_WAITING_ROOM | `/enter` | Implemented |

## Architecture separation

Production SITE 00 separates:

1. **ENVIRONMENT** — architectural background (locked per family)
2. **OBJECT** — reusable decorative/wireframe assets
3. **INTERFACE** — real HTML/CSS/React (editable text, pricing, navigation)

## Environment families

| ID | Used by |
|----|---------|
| `ORIGIN_ENVIRONMENT` | Homepage collapsed, IDNTY expanded, BLDR expanded |
| `WORKFLOW_ENVIRONMENT` | `/idnty/state`, `/bldr/state` |
| `ENTER_00_WAITING_ROOM` | `/enter` |

Environment must **not** reload when changing UI state within the same family.

## Key distinctions

- **SERVICES** = learn what SITE 00 does (catalog layer)
- **IDNTY / BLDR** = start doing it (action/onboarding)
- **Homepage status strip** = ORIGIN only — not on workflow pages
- **ENTER 00** = separate environment route, not a drawer overlay

## Creative Selection Protocol (architecture only)

Directions A / B / C + Option D (Hybridize / Recalibrate). No-Frankenstein rule by default.

## Module location

```
src/site00/
  config/     — routes, nav, directory, identity, builder, environments, assets
  state/      — Site00Context, typed domains
  components/ — shell, environment, panels, homepage, workflow, enter00, icons
  pages/      — Origin, Enter, Idnty, Bldr state pages
  styles/     — tokens.css, site00.css
```

Routes wired via `src/routes/Site00Routes.tsx`.

## Documentation index

- [ROUTES.md](./ROUTES.md)
- [ENVIRONMENTS.md](./ENVIRONMENTS.md)
- [COMPONENTS.md](./COMPONENTS.md)
- [STATES.md](./STATES.md)
- [ASSETS.md](./ASSETS.md) — includes Asset Gap Report
- [DECISIONS.md](./DECISIONS.md)

## Root route policy

By default `/` remains Frontal Slayer `HomeLandingRedirect`. SITE 00 Origin is at `/origin`.

Set `VITE_SITE00_ROOT=1` to mount Origin at `/` (for dedicated SITE 00 deployment).

## Reference mapping

See [ASSETS.md](./ASSETS.md) for production asset gaps and temporary implementations.
