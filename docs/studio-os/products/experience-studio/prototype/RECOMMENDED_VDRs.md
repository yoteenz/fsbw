# Recommended Design Revisions — Experience Studio™ Prototype

**Version:** 1.0.0  
**Parent:** [Prototype Package](./README.md)  
**Framework:** [Design Revision Framework™](../../../design/DESIGN_REVISION_FRAMEWORK.md)

---

> Prototype exercise surfaced components best ratified via **VDR-100+** before Stable. Until ratified, **compose from existing catalog**.

---

## Summary

| VDR | Component / Scope | Priority | Prototype impact |
|-----|-------------------|----------|------------------|
| VDR-101 | `comp-dna-blender` | P1 | Design DNA™ panel |
| VDR-102 | `comp-remix-carousel` | P1 | Remix™ workflow |
| VDR-103 | `comp-experience-type-grid` | P2 | Type entry screen |
| VDR-104 | `comp-publish-pipeline` | P1 | Publish screen |
| VDR-105 | `comp-version-timeline` | P2 | Version history |
| VDR-106 | `comp-director-proposal-card` | P1 | AI collaboration |
| VDR-301 | Experience Studio motion tokens | P2 | Motion spec |

---

## VDR-101 — `comp-dna-blender`

| Field | Value |
|-------|-------|
| **Series** | VDR-100 (Component Catalog) |
| **Type** | Minor |
| **Status** | Proposed · Preview channel |
| **Purpose** | Design DNA™ personality percentage mixer |

### Prototype Need

Blend 1–4 personalities · sum 100 · live preview · pin personality.

### Interim Composition

`comp-forms` sliders + `comp-card` personality chips + `comp-status-indicator` sum badge.

### Ratification Criteria

- Used in Golden Product Reference Implementation
- Design Health™ PASS on panel
- Accessibility: slider keyboard + labels

---

## VDR-102 — `comp-remix-carousel`

| Field | Value |
|-------|-------|
| **Series** | VDR-100 |
| **Type** | Minor |
| **Status** | Proposed |
| **Purpose** | Horizontal Remix™ chip carousel with preview state |

### Interim Composition

`comp-buttons` ghost chips in scroll container + `comp-floating-panel` preview overlay.

---

## VDR-103 — `comp-experience-type-grid`

| Field | Value |
|-------|-------|
| **Series** | VDR-100 |
| **Type** | Minor |
| **Status** | Proposed |
| **Purpose** | 13-type entry grid with hints · selection state |

### Interim Composition

`comp-card` grid + responsive CSS grid · no new anatomy.

---

## VDR-104 — `comp-publish-pipeline`

| Field | Value |
|-------|-------|
| **Series** | VDR-100 |
| **Type** | Minor |
| **Status** | Proposed · **P1 before publish feature** |
| **Purpose** | Preview + checklist + step progress + success state |

### Anatomy

- Split preview/checklist
- `comp-progress-system` 3-step
- Design Health™ widget integration
- Success bloom state

### Interim Composition

`comp-canvas` preview + `comp-analytics-widget` health + `comp-progress-system` + `comp-buttons` publish.

---

## VDR-105 — `comp-version-timeline`

| Field | Value |
|-------|-------|
| **Series** | VDR-100 |
| **Type** | Minor |
| **Status** | Proposed |
| **Purpose** | Version list + compare slider |

### Interim Composition

`comp-table` + side-by-side `comp-canvas` + `comp-modal` restore confirm.

---

## VDR-106 — `comp-director-proposal-card`

| Field | Value |
|-------|-------|
| **Series** | VDR-100 |
| **Type** | Minor |
| **Status** | Proposed · **P1 for AI UX** |
| **Purpose** | Standardized AI proposal with confidence · Preview · Alternative · Why? |

### Anatomy

| Element | Detail |
|---------|--------|
| Confidence badge | High / Medium / Low |
| Lenses used | Art Director · UX · A11y icons |
| Actions | Accept · Preview · Alternative · Why? |
| State | pending · accepted · rejected |

### Interim Composition

Extend `comp-ai-chat` message variant with action row `comp-buttons`.

**Recommendation:** Ratify VDR-106 early — sets Golden Product AI pattern for all OS products.

---

## VDR-301 — Experience Studio Motion Token Extension

| Field | Value |
|-------|-------|
| **Series** | VDR-300 (Motion) |
| **Type** | Patch |
| **Status** | Proposed |
| **Purpose** | Add prototype motion tokens to `token-motion` family |

### Tokens Proposed

| Token | Value |
|-------|-------|
| `motion-ceremonial` | 480–600ms |
| `motion-orb-breathe` | 2400ms loop |
| `motion-remix-morph` | 400ms |

**Reference:** [MOTION_SPECIFICATION.md](./MOTION_SPECIFICATION.md)

---

## Non-VDR Prototype Notes

| Item | Action |
|------|--------|
| Glass contrast | Platform `ACCESSIBILITY_STANDARD.md` — not VDR |
| Product atmosphere tokens `--es-*` | Within bounds — no VDR |
| Content blocks `content-*` | Separate tier — future CONTENT_BLOCK_REGISTRY |

---

## Filing Plan

| Order | VDR | When |
|-------|-----|------|
| 1 | VDR-106 | Before engineering Phase 2 (AI) |
| 2 | VDR-101 + VDR-102 | Before engineering Phase 2 (DNA/Remix) |
| 3 | VDR-104 | Before engineering Phase 3 (publish) |
| 4 | VDR-103 + VDR-105 | During Phase 2 if composed adequately |
| 5 | VDR-301 | With motion implementation |

---

## Cross-References

| Document | Path |
|----------|------|
| VDR Registry | `design/revisions/vdr-registry.yaml` |
| Component Usage Map | `../COMPONENT_USAGE_MAP.md` |
| Review Findings | [PROTOTYPE_REVIEW_FINDINGS.md](./PROTOTYPE_REVIEW_FINDINGS.md) |

---

*Recommended VDRs — prototype proves need · governance ratifies canon.*
