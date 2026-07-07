# Design Revision Framework™

**Version:** 1.0.0  
**Prefix:** VDR (Visual Design Revision)  
**Parent:** [Studio Design Constitution™](./STUDIO_DESIGN_CONSTITUTION.md)

---

> The visual equivalent of architectural Design Revisions (DR-###).  
> **DR-###** = Master Specification architecture · **VDR-###** = Design Governance visual

---

## Purpose

Future visual changes become **Visual Design Revisions (VDR)** — never direct edits to product specs or ad-hoc CSS drift.

---

## VDR Numbering

| Series | Scope |
|--------|-------|
| **VDR-001 – VDR-099** | Foundation design governance |
| **VDR-100 – VDR-199** | Component Catalog changes |
| **VDR-200 – VDR-299** | Token / material changes |
| **VDR-300 – VDR-399** | Motion system changes |
| **VDR-400+** | Product-specific visual extensions (must still inherit base) |

**File:** `docs/studio-os/design/revisions/vdr-registry.yaml` (created on first VDR)

---

## Revision Types

| Type | Semver bump | Example |
|------|-------------|---------|
| **Patch** | 1.0.x | Opacity tweak · timing ±50ms |
| **Minor** | 1.x.0 | New component · new token |
| **Major** | x.0.0 | Breaking component API · hierarchy redesign |

---

## Approval Workflow

```
1. PROPOSE
   Author: design owner / product lead
   Artifact: VDR proposal (template below)
        ↓
2. IMPACT ANALYSIS
   Affected components · products · Design Health preview
        ↓
3. REVIEW
   Design Health rubric · accessibility · luxury score
        ↓
4. RATIFY
   Executive approval · registry version bump
        ↓
5. MIGRATE
   Deprecation mapping · compat shims · product notices
        ↓
6. VALIDATE
   Design Health PASS on affected products
        ↓
7. CLOSE
   VDR status: merged · registry frozen at new version
```

---

## Major Revisions

**Triggers:**
- Component anatomy change breaking props/behavior
- Typography role restructure
- Glass system overhaul
- Navigation paradigm shift
- Dark-mode-default proposal (would fail constitution — requires amendment)

**Requirements:**
- Migration guide per affected `comp-*`
- Minimum 30-day Preview channel soak
- Design Health re-certification all flagship products

---

## Minor Revisions

**Triggers:**
- New catalog component
- New motion token
- Additional radial menu slot
- New analytics widget variant

**Requirements:**
- Component Catalog update
- Design Registry version bump
- Design Health spot-check

---

## Patch Revisions

**Triggers:**
- Token value adjustment within philosophy
- Accessibility contrast fix
- Touch target size correction

**Requirements:**
- Design Registry patch note
- No product spec changes unless implementation bug

---

## Breaking Changes

| Definition | Handling |
|------------|----------|
| Component props removed | Major VDR · deprecation period |
| Canonical ID renamed | Replacement mapping required |
| Behavior change without opt-in | Major VDR · migration |
| Contrast ratio lowered | **Rejected** — violates constitution |

---

## Migration

Every major/minor VDR includes:

| Section | Content |
|---------|---------|
| **Affected IDs** | `comp-*` list |
| **Before / After** | Behavior or token diff |
| **Product impact** | Which products must update |
| **Shim duration** | Compat layer timeline |
| **Code search** | Grep patterns for drift detection |

---

## Rollback

| Condition | Action |
|-----------|--------|
| Design Health FAIL post-release | Revert registry to prior version |
| Accessibility regression | Immediate rollback · hotfix VDR patch |
| Executive veto | VDR status: `reverted` |

Rollback does not delete VDR history — marks `status: reverted` with reason.

---

## Compatibility

| Rule | Detail |
|------|--------|
| Products pin `designCompliance.registryVersion` | May lag by 1 minor |
| Patch versions auto-inherited | Unless breaking token |
| Experimental components | Not subject to compat guarantees |
| Stable channel | Only ratified catalog components |

---

## Deprecation Lifecycle

```
ratified → deprecated (VDR) → shim period → removed (major VDR)
```

| Stage | Duration | Design Health |
|-------|----------|---------------|
| deprecated | ≥2 release cycles | WARNING if used |
| shim | Per VDR | PASS with warning |
| removed | Permanent | FAIL if referenced |

---

## VDR Proposal Template

```yaml
id: VDR-###
title: ''
type: patch | minor | major
status: proposed | ratified | merged | reverted
proposedAt: ''
ratifiedAt: ''

summary: ''

scope:
  components: []
  tokens: []
  products: []

breaking: false
migration: ''

designHealthImpact:
  before: ''
  after: ''

approval:
  designOwner: ''
  executive: ''
```

---

## Relationship to Architectural DRs

| System | Prefix | Governs | Registry |
|--------|--------|---------|----------|
| Architectural DR | DR-### | Master Spec milestones | `design-revisions.yaml` |
| Visual VDR | VDR-### | Design Governance | `design/revisions/` |

They may reference each other but **never share IDs**.

**Example:** DR-001 merged Studio Orb architecture · future Orb *visual* resize = VDR-100+.

---

## Initial State

| VDR | Status |
|-----|--------|
| VDR-000 | Implicit baseline — Design Governance 1.0.0 ratified 2026-07-07 |

---

*Design Revision Framework™ — visual evolution with architectural discipline.*
