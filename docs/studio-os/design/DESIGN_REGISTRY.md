# Design Registry™

**Version:** 1.0.0  
**Status:** Current  
**Role:** Visual source of truth for Studio OS  
**Parent:** [Studio Design Constitution™](./STUDIO_DESIGN_CONSTITUTION.md)

---

## Purpose

The **Design Registry™** tracks every approved visual artifact version. Products declare which registry version they comply with — they never embed version numbers in local style guides.

When design evolves, update the registry once. Products inherit through compliance declaration.

---

## Current Approved Versions

| Artifact | Current version | Status | Path |
|----------|-----------------|--------|------|
| **Studio Design Constitution** | 1.0.0 | frozen | `STUDIO_DESIGN_CONSTITUTION.md` |
| **Design Language System** | 1.0.0 | frozen | `DESIGN_LANGUAGE_SYSTEM.md` |
| **Component Catalog** | 1.0.0 | current | `COMPONENT_CATALOG.md` |
| **Design Revision Framework** | 1.0.0 | current | `DESIGN_REVISION_FRAMEWORK.md` |
| **Design Health Rubric** | 1.0.0 | current | `DESIGN_HEALTH.md` |
| **Design Governance Package** | 1.0.0 | current | `docs/studio-os/design/` |

### Token Families (Logical — implementation in Design Token Engine™)

| Token family | Registry ID | Version | Notes |
|--------------|---------------|---------|-------|
| Typography roles | `token-typography` | 1.0.0 | Roles persist · faces evolvable |
| Color philosophy | `token-color` | 1.0.0 | Light-dominant canon |
| Glass materials | `token-glass` | 1.0.0 | Blur · opacity · edge |
| Motion tokens | `token-motion` | 1.0.0 | Duration · easing |
| Spacing scale | `token-space` | 1.0.0 | Breath-first rhythm |
| Elevation | `token-elevation` | 1.0.0 | Soft shadow only |

---

## Component Registry Snapshot

| Canonical ID | Catalog version | Implementation ref | Status |
|--------------|-----------------|-------------------|--------|
| `comp-studio-orb` | 1.1.0 | `studio-orb/` | ratified |
| `comp-command-dock` | 2.0.0 | `command-dock/` | ratified |
| `comp-canvas` | 1.0.0 | product-specific shell | ratified |
| `comp-floating-dock` | 1.0.0 | pattern | ratified |
| `comp-inspector-panel` | 1.0.0 | pattern | ratified |
| `comp-command-palette` | 1.0.0 | planned | ratified |
| `comp-notifications` | 1.0.0 | — | experimental |

Full catalog: [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)

---

## Experimental Components

| ID | Channel | Expires | Promotion path |
|----|---------|---------|----------------|
| `comp-notifications` | Preview | VDR or 90 days | Ratify → catalog 1.1.0 |

Experimental components:
- May ship only on **Preview** or **Beta** Release Channels
- Must be flagged in product Component Usage Map
- Auto-review at Design Health gate

---

## Deprecated Components

| ID | Deprecated | Replacement | Removal target |
|----|------------|-------------|----------------|
| *none* | — | — | — |

### Deprecation Rules

1. **Announce** in VDR with migration guide
2. **Map** replacement in this table
3. **Support** deprecated ID for ≥2 product release cycles
4. **Remove** only after Design Health shows zero usage

---

## Version History

| Date | Package version | Change | VDR |
|------|-----------------|--------|-----|
| 2026-07-07 | 1.0.0 | Initial Design Governance package ratified | VDR-000 |

---

## Breaking Changes Log

| Version | Breaking change | Affected products | Migration |
|---------|-----------------|-------------------|-----------|
| *none yet* | — | — | — |

**Breaking change definition:** Requires product code or spec update to maintain Design Health PASS.

---

## Replacement Mapping

When components rename or merge:

```
deprecated_id → replacement_id (compat shim duration)
```

| From | To | Shim |
|------|-----|------|
| — | — | — |

---

## Compatibility Matrix

| Product | Design Registry | Component Catalog | Design Health | Channel |
|---------|-----------------|-------------------|---------------|---------|
| Studio Orb / P1 | 1.0.0 | 1.0.0 | PASS | Preview |
| Website Builder (spec) | 1.0.0 | 1.0.0 | pending | Preview |
| Experience Studio | 1.0.0 | 1.0.0 | WARNING | Preview |
| Campaign Engine | — | — | — | queued |

Products declare compliance in **Product Starter Pack** governance section.

---

## Relationships

```
Design Registry
    ├── Component Catalog (what)
    ├── Design Language System (why)
    ├── Design Token Engine™ (implementation)
    ├── Component Registry™ M127 (platform objects)
    └── System Registry™ (discovery)
```

**Distinction:**
- **Design Registry** — visual canon versions
- **Component Registry™ (M127)** — runtime platform object directory
- Design Catalog IDs map to implementation modules in System Registry

---

## Registry Operations

| Operation | Authority | Recorded |
|-----------|-----------|----------|
| New component | VDR minor+ | Catalog + this registry |
| Token bump | VDR patch/minor | Token family version |
| Deprecation | VDR major | Deprecation table |
| Experimental promote | VDR minor | Experimental → ratified |
| Constitutional change | VDR + Design Constitution amendment | Version history |

---

## Product Compliance Declaration (Template)

```yaml
designCompliance:
  registryVersion: '1.0.0'
  catalogVersion: '1.0.0'
  languageSystemVersion: '1.0.0'
  componentsUsed:
    - comp-studio-orb
    - comp-canvas
  experimental: []
  designHealthGate: pending
```

---

*Design Registry™ — one version truth · inherited everywhere.*
