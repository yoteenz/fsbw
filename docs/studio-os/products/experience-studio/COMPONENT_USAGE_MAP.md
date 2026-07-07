# Component Usage Map — Experience Studio™

**Product ID:** `experience-studio`  
**Design Registry:** 1.0.0 · **Catalog Version:** 1.0.0  
**Status:** Specification · Pre-implementation  
**Date:** 2026-07-07

---

## Inheritance Declaration

```yaml
designCompliance:
  registryVersion: "1.0.0"
  catalogVersion: "1.0.0"
  inherits: docs/studio-os/design/
  localComponents: []  # VDR required for any new OS chrome
```

**Canonical catalog:** [Component Catalog™](../../design/COMPONENT_CATALOG.md)

---

## Required Components (All Phases)

| Screen / Zone | Component ID | Variant | Purpose |
|---------------|--------------|---------|---------|
| Global | `comp-studio-orb` | default | Intelligence presence · entry to Director |
| Global | `comp-command-dock` | experience-studio | Conversational commands |
| Global | `comp-command-palette` | default | Power-user navigation |
| Workspace | `comp-canvas` | experience-authoring | Primary creative surface |
| Workspace | `comp-workspace-panel` | creative-wing | Environment chrome |
| Director | `comp-ai-chat` | creative-director | AI Creative Director™ dialogue |
| Director | `comp-conversation-timeline` | session | Turn history · audit |
| Panels | `comp-floating-dock` | right-lower | Design DNA · Experience DNA · Remix |
| Panels | `comp-inspector-panel` | contextual | Properties · section detail |
| Panels | `comp-floating-panel` | sheet | Interview steps · confirmations |
| Entry | `comp-card` | experience-type | 13 experience type selectors |
| Actions | `comp-buttons` | primary/secondary/ghost | All actions |
| Status | `comp-status-indicator` | presence | Save · sync · AI thinking |
| Progress | `comp-progress-system` | interview · publish | Multi-step flows |
| Navigation | `comp-tabs` | project-switcher | Projects · assets · history |
| Search | `comp-search` | global | Projects · assets · templates |
| Editing | `comp-editor-inline` | canvas | Inline text · properties |
| Overlays | `comp-modal` | confirm · teach | Destructive · education |
| Overlays | `comp-drawer` | mobile-inspector | Tablet/mobile panels |
| Toolbars | `comp-toolbar` | canvas-minimal | ≤15% viewport chrome |
| Context | `comp-context-menu` | canvas | Right-click actions |
| Feedback | `comp-notifications` | async | Publish · collaboration · errors |
| Health | `comp-analytics-widget` | design-health | Design Health™ score panel |
| Tables | `comp-table` | version-history | Version list · audit |
| Forms | `comp-forms` | interview | Structured intake (minimal) |

---

## Optional Components

| Screen | Component ID | When used |
|--------|--------------|-----------|
| Dashboard | `comp-dashboard` | Project management overview |
| Analytics | `comp-analytics-widget` | Post-publish metrics |
| Academy link | `comp-card` | Template discovery |

---

## Proposed New Components (VDR Required Before Stable)

| Proposed ID | Purpose | VDR Series | Channel until ratified |
|-------------|---------|------------|------------------------|
| `comp-dna-blender` | Design DNA™ personality mixer UI | VDR-100 | Preview |
| `comp-remix-carousel` | Remix™ quick-transform chips | VDR-100 | Preview |
| `comp-experience-type-grid` | 13-type entry grid with hints | VDR-100 | Preview |
| `comp-publish-pipeline` | Preview → QA → publish flow | VDR-100 | Preview |
| `comp-version-timeline` | Visual version history | VDR-100 | Preview |

**Rule:** Until VDR ratification, implement as **composition** of existing `comp-card`, `comp-tabs`, `comp-progress-system` — not forks.

---

## Deprecated Components

| ID | Replacement | Notes |
|----|-------------|-------|
| *none* | — | Legacy Digital Architect tabbed UI deprecated in favor of Experience Studio shell |

---

## Component Relationships

```
comp-studio-orb
    └── opens → comp-command-dock
                    └── contains → comp-ai-chat
                                        └── history → comp-conversation-timeline

comp-canvas (authoring)
    ├── docks → comp-floating-dock
    │               ├── comp-inspector-panel (properties)
    │               ├── comp-dna-blender* (Design DNA™)
    │               └── comp-remix-carousel* (Remix™)
    ├── toolbar → comp-toolbar (minimal)
    └── inline → comp-editor-inline

comp-floating-panel
    └── interview flow → comp-forms + comp-progress-system

* Proposed — compose from catalog until VDR
```

---

## Screen × Component Matrix

| Screen ID | Orb | Canvas | AI Chat | Float Dock | Inspector | Cards | Modal |
|-----------|-----|--------|---------|------------|-----------|-------|-------|
| scr-es-001 Entry | ✓ | | | | | ✓ | |
| scr-es-002 Interview | ✓ | | ✓ | ✓ | | | ✓ |
| scr-es-003 Workspace | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ |
| scr-es-004 Projects | ✓ | | ✓ | | | ✓ | |
| scr-es-005 Assets | ✓ | | | ✓ | | ✓ | |
| scr-es-006 Templates | ✓ | | ✓ | ✓ | | ✓ | |
| scr-es-007 Publish | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ |
| scr-es-008 Versions | ✓ | | | | | | |
| scr-es-009 Settings | ✓ | | | ✓ | ✓ | | |

---

## Content Components (Separate Tier)

User-authored experience blocks — **not** OS chrome:

| Content Block | Experience Types | Registry |
|---------------|------------------|----------|
| `content-hero` | website, landing-page | product-content |
| `content-editorial` | website, academy | product-content |
| `content-commerce-grid` | store, marketplace | product-content |
| `content-booking-flow` | booking | product-content |
| `content-portal-gate` | client-portal | product-content |

Content blocks are registered per Experience Type — not `comp-*` catalog forks.

---

## Design Health Preview Targets

| Check | Target at prototype | Target at launch |
|-------|---------------------|------------------|
| Catalog compliance | 100% chrome | 100% chrome |
| Canvas-first density | chrome ≤15% | chrome ≤15% |
| Glass consistency | per Design Language | PASS |
| Experimental flagged | all proposed comps | VDR or composed |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Design Application | [EXPERIENCE_STUDIO_PRODUCT_SPEC.md](./EXPERIENCE_STUDIO_PRODUCT_SPEC.md) §6 |
| Screen Inventory | [EXPERIENCE_STUDIO_PRODUCT_SPEC.md](./EXPERIENCE_STUDIO_PRODUCT_SPEC.md) §5 |
| Design Revision Framework™ | `docs/studio-os/design/DESIGN_REVISION_FRAMEWORK.md` |

---

*Component Usage Map — compose the catalog · propose extensions via VDR.*
