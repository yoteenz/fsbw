# UX Discovery — {Product Name}

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Status:** Draft | Review | Approved  
**Owner:** {name}  
**Date:** {YYYY-MM-DD}

---

> Copy to `docs/studio-os/products/{product-id}/UX_DISCOVERY.md`  
> Complete before Product Specification. Never skip Discovery.

---

## Research Summary

| Source | Finding |
|--------|---------|
| User interviews | |
| Analytics | |
| Competitive scan | |
| Internal module reuse | |

---

## Personas

### Primary: {Persona Name}

| Attribute | Detail |
|-----------|--------|
| Role | |
| Goals | |
| Frustrations | |
| Studio OS context | |
| Technical comfort | |

### Secondary: {Persona Name}

{Repeat structure}

---

## User Journeys

### Journey 1: {Name} — Happy Path

```
Entry → {step} → {step} → {step} → Success
```

| Step | User thought | System response | Emotion |
|------|--------------|-----------------|---------|
| 1 | | | |
| 2 | | | |

### Journey 2: {Name} — Recovery Path

{Document error recovery}

---

## Entry Points

| Entry | Source | First screen | Context carried |
|-------|--------|--------------|-----------------|
| HQ wing | | | |
| Orb command | | | |
| Deep link | | | |
| Notification | | | |

---

## Exit Points

| Exit | Destination | State preserved |
|------|-------------|-----------------|
| Save & return to HQ | | |
| Publish complete | | |
| Abandon draft | | |

---

## Core Workflows

| # | Workflow | Frequency | Priority |
|---|----------|-----------|----------|
| 1 | | Daily | P0 |
| 2 | | Weekly | P1 |
| 3 | | Occasional | P2 |

### Workflow Detail: {Name}

**Trigger:**  
**Steps:**  
**Outcome:**  
**AI involvement:**  

---

## Edge Cases

| Case | Trigger | Expected behavior |
|------|---------|-------------------|
| Empty state | First visit | |
| Concurrent edit | | |
| Offline | | |
| Permission denied | | |
| AI unavailable | | |

---

## Failure States

| Failure | User message | Recovery action |
|---------|--------------|-----------------|
| Save failed | | Retry · local draft |
| Validation error | | Inline fix |
| Auth expired | | Re-auth · preserve state |
| AI timeout | | Graceful degrade |

---

## Success States

| Success | Celebration | Next action |
|---------|-------------|-------------|
| First create | Subtle · not gamified | |
| Publish | | |
| Milestone | | |

---

## Emotional Journey

| Phase | Target emotion | Design expression |
|-------|----------------|-------------------|
| Arrival | Wonder · calm | |
| Creation | Flow · confidence | |
| Collaboration | Trust · warmth | |
| Completion | Satisfaction · pride | |

**Anti-patterns:** Anxiety · clutter · dead ends · guilt prompts

---

## Accessibility

| Requirement | Approach |
|-------------|----------|
| Keyboard | Full workflow without mouse |
| Screen reader | Landmark regions · live regions for AI |
| Color | Not sole indicator |
| Motion | `prefers-reduced-motion` |
| Touch | 44px targets mobile |
| Cognitive | One primary action per view |

---

## AI Interactions

| Moment | AI role | Human role | Approval |
|--------|---------|------------|----------|
| Suggest layout | Propose | Accept/reject | Required |
| Auto-save | Execute | — | Implicit |
| Publish | Prepare | Confirm | Required |

**Reference:** [AI_COLLABORATION_TEMPLATE.md](./AI_COLLABORATION_TEMPLATE.md)

---

## Discovery Approval

| Item | Status | Reviewer | Date |
|------|--------|----------|------|
| Personas validated | ☐ | | |
| Journeys complete | ☐ | | |
| Edge cases documented | ☐ | | |
| Accessibility considered | ☐ | | |
| UX Review ready | ☐ | | |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Product Vision | [PRODUCT_VISION_TEMPLATE.md](./PRODUCT_VISION_TEMPLATE.md) |
| Information Architecture | [INFORMATION_ARCHITECTURE_TEMPLATE.md](./INFORMATION_ARCHITECTURE_TEMPLATE.md) |
| Design Language System™ | `docs/studio-os/design/DESIGN_LANGUAGE_SYSTEM.md` |

---

*UX Discovery — understand before you specify.*
