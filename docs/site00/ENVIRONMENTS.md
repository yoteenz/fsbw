# SITE 00 Environments

Registry: `src/site00/config/environments.ts`  
Component: `src/site00/components/environment/EnvironmentShell.tsx`

## Environment families

### ORIGIN_ENVIRONMENT

**Locked reference:** 01_ORIGIN_APPROVED

**Routes:** `/`, `/origin` (homepage all modes)

**States sharing this environment:**
- `homeMode: origin` — collapsed IDNTY/BLDR cards
- `homeMode: idnty-expanded`
- `homeMode: bldr-expanded`

**Rule:** Changing homepage expansion state must NOT alter architecture, lighting, camera, or crop.

### WORKFLOW_ENVIRONMENT

**Locked references:** 04_IDNTY_BRAND_STATE, 05_BLDR_BUILD_STATE

**Routes:** `/idnty/state`, `/bldr/state`

**Rule:** Shared geometry — only panel content differs between IDNTY and BLDR workflow pages.

**Exclusion:** No homepage bottom status strip on workflow pages.

### ENTER_00_WAITING_ROOM

**Locked reference:** 06_ENTER00_WAITING_ROOM_APPROVED (sole ENTER 00 authority)

**Routes:** `/enter`

**Locked elements:** bright white lighting, lobby atmosphere, camera framing, furniture placement zones, marble floor, chrome, glowing 00 signage, panel placement region.

**Editable:** directory panel content (data-driven via `config/directory.ts`)

## Configuration model

```typescript
environmentId
asset              // production URL when available
desktopPosition
mobilePosition
desktopScale
mobileScale
overlay
lightingClass
fallbackClass      // CSS temporary until production asset
routes
```

## Temporary implementation

Production environment images are **not yet available**. CSS fallback classes provide structural placeholders:

- `site00-env-fallback--origin`
- `site00-env-fallback--workflow`
- `site00-env-fallback--enter`

When production assets arrive, set `asset` in registry — `EnvironmentShell` will use `background-image` without restructuring pages.

## Responsive

Focal point and scale differ for mobile via config. Dedicated mobile compositions **not approved** — structural fallbacks only. Flag for future mobile design sprint.
