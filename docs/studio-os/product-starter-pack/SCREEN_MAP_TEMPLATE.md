# Screen Map — {Product Name}

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Status:** Draft | Review | Approved  
**Owner:** {name}  
**Date:** {YYYY-MM-DD}

---

> Copy to `docs/studio-os/products/{product-id}/SCREEN_MAP.md`  
> One section per screen. Map every screen before prototype.

---

## Screen Index

| ID | Screen | Route | Maturity |
|----|--------|-------|----------|
| `scr-{id}-001` | | | P0 |
| `scr-{id}-002` | | | P1 |

---

## Screen Template (duplicate per screen)

### `scr-{id}-{nnn}` — {Screen Name}

| Field | Value |
|-------|-------|
| **Purpose** | {Why this screen exists} |
| **Route** | `/admin/studio/{product-id}/...` |
| **Entry** | {How users arrive} |
| **Exit** | {Where users go next} |
| **Dependencies** | {APIs · modules · other screens} |

#### Layout

| Zone | Component ID | Notes |
|------|--------------|-------|
| Canvas | `comp-canvas` | |
| Inspector | `comp-inspector-panel` | |
| Director | `comp-ai-chat` | |

#### Primary Actions

| Action | Trigger | Result |
|--------|---------|--------|
| | | |

#### Secondary Actions

| Action | Trigger | Result |
|--------|---------|--------|
| | | |

#### AI Capabilities

| Capability | Autonomous? | Approval |
|------------|-------------|----------|
| | yes/no | required/implicit |

#### Permissions

| Role | Access |
|------|--------|
| | |

#### Responsive Behavior

| Breakpoint | Layout change |
|------------|---------------|
| Desktop (≥1280px) | Full canvas · floating docks |
| Tablet (768–1279px) | Stacked panels · drawer inspector |
| Mobile (<768px) | Single column · bottom sheet |

#### States

| State | Visual | Component |
|-------|--------|-----------|
| Empty | | |
| Loading | `comp-progress-system` | |
| Error | | |
| Success | | |

#### Accessibility Notes

- Focus order:
- Landmarks:
- Live regions:

---

## Example: Workspace Screen

### `scr-wb-001` — Website Builder Workspace

| Field | Value |
|-------|-------|
| **Purpose** | Primary authoring environment for website pages |
| **Route** | `/admin/studio/website-builder` |
| **Entry** | HQ Creative Wing · Orb · deep link |
| **Exit** | Publish flow · return to HQ |
| **Dependencies** | Digital Architect™ · Conversation Engine™ |

#### Layout

| Zone | Component ID |
|------|--------------|
| Canvas | `comp-canvas` |
| Section library | `comp-floating-dock` |
| Director | `comp-ai-chat` |
| Inspector | `comp-inspector-panel` |

#### Primary Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Add section | Library click | Canvas insert |
| Edit inline | Canvas click | `comp-editor-inline` |
| Ask Director | Orb / dock | AI proposal |

#### Responsive Behavior

| Breakpoint | Change |
|------------|--------|
| Mobile | Library → bottom sheet · inspector → drawer |

---

## Screen Flow Diagram

```
[Entry] → scr-001 → scr-002 → [Exit]
              ↓
           scr-003 (modal)
```

---

## Component Summary

| Component ID | Screens used |
|--------------|--------------|
| `comp-canvas` | scr-001 |
| `comp-floating-dock` | scr-001 |

**Reference:** [COMPONENT_USAGE_TEMPLATE.md](./COMPONENT_USAGE_TEMPLATE.md)

---

## Approval

| Item | Status | Reviewer | Date |
|------|--------|----------|------|
| All P0 screens mapped | ☐ | | |
| Components assigned | ☐ | | |
| Responsive defined | ☐ | | |
| UX Review ready | ☐ | | |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Component Catalog™ | `docs/studio-os/design/COMPONENT_CATALOG.md` |
| UX Discovery | [UX_DISCOVERY_TEMPLATE.md](./UX_DISCOVERY_TEMPLATE.md) |
| Design Language System™ | `docs/studio-os/design/DESIGN_LANGUAGE_SYSTEM.md` |

---

*Screen Map — every screen accountable · every component cataloged.*
