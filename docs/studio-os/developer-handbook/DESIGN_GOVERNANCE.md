# Design Governance — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)  
**Authority:** [Design Governance Package](../design/)

---

> **Products inherit design. They never own it.**

---

## Design Governance Package

| # | Document | Path | Role |
|---|----------|------|------|
| 1 | Studio Design Constitution™ | `design/STUDIO_DESIGN_CONSTITUTION.md` | Governing visual law |
| 2 | Design Language System™ | `design/DESIGN_LANGUAGE_SYSTEM.md` | Permanent feel principles |
| 3 | Component Catalog™ | `design/COMPONENT_CATALOG.md` | `comp-*` canonical library |
| 4 | Design Registry™ | `design/DESIGN_REGISTRY.md` | Version truth |
| 5 | Design Revision Framework™ | `design/DESIGN_REVISION_FRAMEWORK.md` | VDR-### system |
| 6 | Design Health™ | `design/DESIGN_HEALTH.md` | Visual validator |

**Index:** [design/README.md](../design/README.md)

---

## Studio Design Constitution™

### Immutable

- Inheritance model — products never own global design
- Governance location — `docs/studio-os/design/`
- VDR change mechanism
- Design Health gate (PASS · WARNING · FAIL)
- Accessibility floor
- Canonical component IDs
- No product override clause

### Evolvable (via VDR)

- Typography · color · motion tokens
- Component anatomy
- Spatial layout patterns
- Design Health rubric weights

---

## Design Language System™

Defines **how Studio OS should feel** — not how today's UI looks.

| Area | Principles |
|------|------------|
| Experience | Living headquarters · not dashboard |
| Emotion | Calm confidence · premium trust · creative possibility |
| Interaction | Conversation before configuration |
| Luxury | Restraint · not ornament |
| Simplicity | Progressive disclosure |
| AI | Intelligence as presence |
| Materials | Marble · glass · light |
| Accessibility | Inclusive by constitution |
| Platforms | Desktop · tablet · mobile · future XR |

**Products reference — never duplicate.**

---

## Component Catalog™

Every reusable UI element has a canonical ID: `comp-{name}`.

### Examples

| ID | Purpose |
|----|---------|
| `comp-studio-orb` | Intelligence presence |
| `comp-canvas` | Primary creative surface |
| `comp-ai-chat` | Creative Director dialogue |
| `comp-floating-dock` | Ephemeral glass panels |
| `comp-buttons` | All button variants |
| `comp-command-palette` | Power-user navigation |

**27 components** ratified in v1.0.0. Full list: [COMPONENT_CATALOG.md](../design/COMPONENT_CATALOG.md)

### Rules for Engineering

| Do | Don't |
|----|-------|
| Import catalog patterns | Create `{product}Button.tsx` |
| Map screens to `comp-*` | Fork modal/dock patterns |
| Propose new via VDR | Ship unregistered on Stable |
| Use composition tokens | Create global CSS variables |

---

## Design Registry™

Tracks approved visual artifact versions.

| Artifact | Current |
|----------|---------|
| Design Governance Package | 1.0.0 |
| Component Catalog | 1.0.0 |
| Token families | 1.0.0 (logical) |

Products declare compliance:

```yaml
designCompliance:
  registryVersion: "1.0.0"
  catalogVersion: "1.0.0"
  designHealthGate: pending | pass | warning | fail
  releaseChannel: preview | beta | stable
```

---

## Design Health™

Visual compliance validator — equivalent to Architecture Validator™ for design.

| Output | Meaning |
|--------|---------|
| **PASS** | ≥85 score · no critical <70 |
| **WARNING** | 70–84 · Preview/Beta only |
| **FAIL** | Blocked |

### Key Dimensions

Consistency · typography · hierarchy · spacing · accessibility · component duplication · luxury score · glass consistency · motion consistency

**Future:** `scripts/design-health-validator.mjs` (recommended)

---

## Design Revisions™ (VDR)

Visual changes route through VDR — never silent edits.

| Type | Semver | Example |
|------|--------|---------|
| Patch | 1.0.x | Opacity tweak |
| Minor | 1.x.0 | New component |
| Major | x.0.0 | Breaking component API |

**Registry:** `design/revisions/vdr-registry.yaml`  
**Baseline:** VDR-000 — Design Governance 1.0.0

---

## How Products Inherit Design

### Required

1. Read Studio Design Constitution™
2. Declare `designCompliance` in product README
3. Create COMPONENT_USAGE_MAP.md — map screens to `comp-*`
4. Pass Design Health™ at launch
5. Route visual changes via VDR

### Allowed (Product Scope)

| Allowed | Scope |
|---------|-------|
| Composition layout | How components arrange |
| Product atmosphere tokens | `--es-brand` style — not global canon |
| Canvas content blocks | User-generated — separate tier |
| Design DNA™ atmosphere | Org sliders within bounds |

### Prohibited

| Prohibited | Instead |
|------------|---------|
| Local design system | Reference Design Language |
| Custom button/modal | Use catalog |
| Product color philosophy | Use token-color + Design DNA™ |
| Product typography rules | Use typography roles |
| Override glass recipes | VDR proposal |

---

## Design Application Pattern

Product specs include **Design Application** — not Design Definition:

```markdown
## Design Application (Not Design Definition)

This product inherits Studio OS Design Governance v1.0.0.
See COMPONENT_USAGE_MAP.md for composition.
Do NOT redefine: typography · color · glass · motion.
```

**Example:** Experience Studio™ spec §7 · Website Builder spec §6

---

## Design DNA™ · Experience DNA™ · Workspace DNA™

| System | Milestone | Role |
|--------|-----------|------|
| **Design DNA™** | M84 | Brand personality blending (Luxury™ · Editorial™ · etc.) |
| **Experience DNA™** | M85, M141 | Motion · glass · density · storytelling sliders |
| **Workspace DNA™** | M76.5, M85 | Per-org experiential genome |

These adapt **atmosphere within constitutional bounds** — they do not override component anatomy or accessibility floor.

---

## Cross-References

| Document | Path |
|----------|------|
| Engineering Guidelines | [ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md) |
| Contributor Guide | [CONTRIBUTOR_GUIDE.md](./CONTRIBUTOR_GUIDE.md) |
| Experience Studio application | `products/experience-studio/EXPERIENCE_STUDIO_PRODUCT_SPEC.md` §7 |
| Product Reference Implementation | [PRODUCT_REFERENCE_IMPLEMENTATION.md](./PRODUCT_REFERENCE_IMPLEMENTATION.md) |

---

*Design Governance — one visual source of truth · inherited by every product.*
