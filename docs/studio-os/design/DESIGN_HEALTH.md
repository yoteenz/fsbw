# Design Health™

**Version:** 1.0.0  
**Role:** Design Validator for Studio OS  
**Equivalent:** Architecture Validator™ (architectural gate)  
**Parent:** [Studio Design Constitution™](./STUDIO_DESIGN_CONSTITUTION.md)

---

## Purpose

**Design Health™** measures visual compliance before UI ships. It is the design gate equivalent to Architecture Validator™ — eventually executable by AI and automation before approval.

---

## Gate Output

| Result | Meaning | Ship |
|--------|---------|------|
| **PASS** | All critical dimensions ≥ threshold | ✅ Allowed (channel permitting) |
| **WARNING** | Non-critical debt · experimental usage | ⚠ Preview/Beta only |
| **FAIL** | Critical violation | ❌ Blocked |

---

## Scoring Model

**Overall score:** 0–100 (weighted composite)

| Dimension | Weight | Critical? |
|-----------|--------|-----------|
| Consistency | 12% | Yes |
| Typography | 10% | Yes |
| Hierarchy | 12% | Yes |
| Spacing | 10% | Yes |
| White space | 8% | No |
| Accessibility | 15% | **Yes** |
| Navigation clarity | 8% | No |
| Component duplication | 10% | Yes |
| Design debt | 5% | No |
| Luxury score | 8% | No |
| Studio DNA compliance | 6% | Yes |
| Glass consistency | 3% | No |
| Motion consistency | 3% | No |
| Visual rhythm | 3% | No |

**PASS threshold:** ≥85 overall · no critical dimension <70  
**WARNING:** 70–84 overall · or any non-critical <60  
**FAIL:** <70 overall · or any critical <70 · or accessibility <80

---

## Dimension Rubrics

### Consistency

| Score | Criteria |
|-------|----------|
| 90+ | All UI uses catalog components · single registry version |
| 70–89 | ≤2 unregistered patterns · documented experimental |
| <70 | Product-local buttons/cards/panels · style fork |

### Typography

| Score | Criteria |
|-------|----------|
| 90+ | Role discipline · scale modular · metadata uppercase consistent |
| 70–89 | Minor scale drift · recoverable |
| <70 | Random font sizes · display overuse · illegible metadata |

### Hierarchy

| Score | Criteria |
|-------|----------|
| 90+ | Canvas/content dominates · chrome ≤15% viewport |
| 70–89 | Occasional competing focal points |
| <70 | Sidebar-heavy · dashboard clutter · lost primary action |

### Spacing

| Score | Criteria |
|-------|----------|
| 90+ | Token spacing scale · aligned grid |
| 70–89 | Minor inconsistent padding |
| <70 | Cramped forms · touching edges |

### White Space

| Score | Criteria |
|-------|----------|
| 90+ | Editorial breath · sections float |
| 70–89 | Acceptable density |
| <70 | SaaS cram · fear of emptiness |

### Accessibility

| Score | Criteria |
|-------|----------|
| 90+ | WCAG 2.2 AA · keyboard complete · focus visible |
| 70–89 | Minor contrast warnings |
| <70 | Color-only state · keyboard traps · missing labels |

**FAIL automatic if accessibility <80 on Stable channel.**

### Navigation Clarity

| Score | Criteria |
|-------|----------|
| 90+ | User always knows place · back path clear |
| 70–89 | Occasional disorientation |
| <70 | Flat route maze · hidden escape |

### Component Duplication

| Score | Criteria |
|-------|----------|
| 90+ | Zero duplicate implementations of catalog components |
| 70–89 | One-off shim with VDR filed |
| <70 | Parallel button system · forked modal |

### Design Debt

| Score | Criteria |
|-------|----------|
| 90+ | No TODO styles · no hardcoded hex outside tokens |
| 70–89 | Documented debt · VDR queued |
| <70 | Widespread inline styles · magic numbers |

### Luxury Score

| Score | Criteria |
|-------|----------|
| 90+ | Restraint · material quality · calm motion |
| 70–89 | Acceptable · not premium-damaging |
| <70 | Cheap gradients · bounce animations · clutter |

### Studio DNA Compliance

| Score | Criteria |
|-------|----------|
| 90+ | Organization atmosphere within constitutional bounds |
| 70–89 | Minor genome stretch · documented |
| <70 | Brand overrides break glass/hierarchy rules |

### Glass Consistency

| Score | Criteria |
|-------|----------|
| 90+ | Glass recipes from token-glass · ≤3 layers |
| 70–89 | Minor opacity drift |
| <70 | Illegible stacks · dark glass default |

### Motion Consistency

| Score | Criteria |
|-------|----------|
| 90+ | Token durations · reduced motion respected |
| 70–89 | Minor ad-hoc transitions |
| <70 | Gratuitous animation · blocking motion |

### Visual Rhythm

| Score | Criteria |
|-------|----------|
| 90+ | Consistent vertical rhythm · aligned baselines |
| 70–89 | Minor misalignment |
| <70 | Chaotic section pacing |

---

## Validation Checklist (Manual / AI)

```
□ designCompliance.registryVersion declared
□ All components map to comp-* catalog IDs
□ No local design language section overrides governance
□ Typography uses role system
□ Primary content ≥70% viewport (builder/canvas products)
□ Accessibility spot-check: contrast · focus · labels
□ Experimental components flagged · Preview channel only
□ Motion uses token-motion or documented exception
□ Glass uses token-glass recipes
□ Organization Design DNA within bounds
□ VDR filed for any intentional deviation
```

---

## Report Format

```markdown
# Design Health™ Report

Product: {product-id}
Registry: {version}
Date: {iso}

## Summary
| Gate | Score |
|------|-------|
| **PASS / WARNING / FAIL** | **{score}/100** |

## Dimensions
| Dimension | Score | Notes |
|-----------|-------|-------|

## Issues
| Severity | Code | Message |

## Recommendations
```

---

## Issue Codes

| Code | Severity | Meaning |
|------|----------|---------|
| `DH_UNREGISTERED_COMPONENT` | error | UI not in catalog |
| `DH_REGISTRY_VERSION_MISSING` | error | No compliance declaration |
| `DH_ACCESSIBILITY_CONTRAST` | error | Contrast below floor |
| `DH_HIERARCHY_CHROME` | error | Chrome dominates viewport |
| `DH_DUPLICATE_COMPONENT` | error | Forked catalog component |
| `DH_TYPOGRAPHY_DRIFT` | warning | Scale outside roles |
| `DH_SPACING_MAGIC` | warning | Hardcoded spacing |
| `DH_EXPERIMENTAL_STABLE` | error | Experimental on Stable channel |
| `DH_GLASS_STACK` | warning | >3 glass layers |
| `DH_MOTION_GRATUITOUS` | warning | Decorative animation |
| `DH_LUXURY_LOW` | warning | Luxury score <60 |

---

## Channel Integration

| Release Channel | Design Health requirement |
|-----------------|---------------------------|
| **Stable** | PASS required · no experimental |
| **Preview** | PASS or WARNING · experimental allowed |
| **Beta** | PASS or WARNING |
| **Experimental** | WARNING allowed · FAIL blocks only accessibility |

Aligns with Release Channel System™ (CA-001).

---

## Future Automation

Design Health™ is designed for:

1. **AI pre-review** — scan product specs for governance compliance
2. **Static analysis** — grep unregistered class patterns · magic hex
3. **Visual regression** — golden screenshots vs glass/token rules
4. **CI gate** — block merge on FAIL (post-implementation phase)
5. **Executive Trust Dashboard** — design dimension alongside QA

**Status:** Rubric ratified · automation implementation deferred to post-prototype.

---

## Relationship to Experience Studio Design Health™

Experience Studio's **Design Health™** scoring (M131 concept) is a **product feature** that measures user-authored sites.

This document governs **Studio OS chrome compliance** — distinct scopes:

| Scope | Validator |
|-------|-----------|
| OS product UI | Design Health™ (this document) |
| User-generated sites in builder | Builder Design Health feature |

Builder feature must itself pass OS Design Health™.

---

*Design Health™ — PASS · WARNING · FAIL — ship with intention.*
