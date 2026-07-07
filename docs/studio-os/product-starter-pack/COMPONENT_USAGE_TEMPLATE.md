# Component Usage Map — {Product Name}

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Design Registry:** 1.0.0  
**Catalog Version:** 1.0.0  
**Owner:** {name}  
**Date:** {YYYY-MM-DD}

---

> Copy to `docs/studio-os/products/{product-id}/COMPONENT_USAGE_MAP.md`  
> **Products inherit components. They do NOT invent them.**

**Canonical catalog:** [Component Catalog™](../design/COMPONENT_CATALOG.md)  
**Registry:** [Design Registry™](../design/DESIGN_REGISTRY.md)

---

## Inheritance Declaration

```yaml
designCompliance:
  registryVersion: "1.0.0"
  catalogVersion: "1.0.0"
  inherits: docs/studio-os/design/
  localComponents: []  # Must be empty unless VDR approved
```

---

## Required Components

Components this product **must** use — no substitutes:

| Screen | Component ID | Variant | Purpose |
|--------|--------------|---------|---------|
| All | `comp-studio-orb` | default | Intelligence presence |
| Workspace | `comp-canvas` | default | Primary surface |
| | `comp-ai-chat` | director | Creative Director |
| | | | |

---

## Optional Components

Components used when context warrants:

| Screen | Component ID | When used |
|--------|--------------|-----------|
| | `comp-command-palette` | Power user navigation |
| | `comp-notifications` | Async job completion |
| | | |

---

## Deprecated Components

| Component ID | Replacement | Migration | VDR |
|--------------|-------------|-----------|-----|
| *none* | — | — | — |

If using deprecated component: document migration timeline and channel restriction.

---

## Exceptions

| Exception | Justification | VDR | Channel | Expiry |
|-----------|---------------|-----|---------|--------|
| *none* | | | | |

**Rule:** Exceptions require VDR approval and Preview/Beta channel only until ratified.

---

## Component Relationships

```
comp-studio-orb
    └── opens → comp-command-dock
                    └── contains → comp-ai-chat
                                        └── history → comp-conversation-timeline

comp-canvas
    └── docks → comp-floating-dock
                    └── contains → comp-inspector-panel
```

---

## Screen × Component Matrix

| Screen ID | comp-canvas | comp-orb | comp-ai-chat | comp-floating-dock | comp-inspector |
|-----------|-------------|----------|--------------|-------------------|----------------|
| scr-001 | ✓ | ✓ | ✓ | ✓ | ✓ |
| scr-002 | | ✓ | | | |

---

## Experimental Components

| Component ID | Channel | Flagged in | Promotion VDR |
|--------------|---------|------------|---------------|
| | preview | | |

---

## Domain-Specific Components (User-Generated)

Products may define **content components** (e.g., website sections) separate from OS chrome:

| Content Component | Registry tier | Not a catalog fork |
|-------------------|---------------|-------------------|
| `{content-block}` | product-content | ✓ |

**Rule:** Content components are user-facing artifacts — not OS UI chrome. Do not confuse with `comp-*` catalog.

---

## New Component Proposals

If product requires a **new reusable** OS component:

| Proposed ID | Purpose | VDR status |
|-------------|---------|------------|
| `comp-{name}` | | pending |

Route through [Design Revision Framework™](../design/DESIGN_REVISION_FRAMEWORK.md) — never ship unregistered on Stable.

---

## Design Health Preview

| Check | Status |
|-------|--------|
| All chrome from catalog | ☐ |
| No local button/modal forks | ☐ |
| Experimental flagged | ☐ |
| Registry version declared | ☐ |

---

## Approval

| Item | Status | Reviewer | Date |
|------|--------|----------|------|
| Required components mapped | ☐ | | |
| No unapproved exceptions | ☐ | | |
| Design Review ready | ☐ | | |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Component Catalog™ | `docs/studio-os/design/COMPONENT_CATALOG.md` |
| Design Health™ | `docs/studio-os/design/DESIGN_HEALTH.md` |
| Screen Map | [SCREEN_MAP_TEMPLATE.md](./SCREEN_MAP_TEMPLATE.md) |

---

*Component Usage Map — compose the catalog · never fork the canon.*
