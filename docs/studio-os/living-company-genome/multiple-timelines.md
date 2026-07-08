# Multiple Timelines™ — Visual Company History

**Module:** `studio.living-company-genome.v1.timelines`  
**Status:** Entire headquarters as visual timeline

---

## Principle

> Founders compare eras. Entire headquarters become visual timelines.

---

## Canonical Timeline Views

| View | Source |
|------|--------|
| **Company Today™** | Current genome + world state |
| **Company Year One™** | Founding capsule · inauguration |
| **Company Before Rebrand™** | Pre-brand-refresh capsule |
| **Company After Expansion™** | Post-expansion capsule |
| **Company Future Vision™** | Expedition preview · simulation (labeled) |
| **Custom Chapter™** | Any sealed Time Capsule™ |

---

## Timeline Schema

```yaml
CompanyTimeline:
  orgId: string
  entries:
    - timelineId: string
      label: string
      capsuleId: string
      eventIds: string[]
      dateRange: { start, end }
      thumbnailRef: string
  activeView: timelineId | today
  compareMode:
    left: timelineId
    right: timelineId | today
```

---

## Comparison Experience

```
Founder selects: Before Rebrand™ vs Company Today™
         ↓
Split or sequential walk through HQ
         ↓
Legacy Layer™ highlights deltas:
  - Logo chapter
  - Material tier
  - New Launch Gallery wing
  - Landmark growth
         ↓
Optional: accept evolution that bridges gap
```

**Future Vision™** always labeled simulation — never presented as history.

---

## Timeline Entry Sources

| Source | Auto-timeline |
|--------|---------------|
| Time Capsule™ seal | Yes |
| Genome Event™ significant | Yes |
| Expedition milestone | Yes |
| Manual founder chapter | Yes · named |

---

## Department-Scoped Timelines

Departments maintain **local eras** within org timeline:

```
CDS Timeline:
  - V1 Launch Era
  - Award Season Refinement
  - Today
```

Walk department in historical era without switching entire HQ (configurable).

---

## Integration with Living Museum™

Evolution Timeline™ wing displays **interactive** timeline — capsules as portals.

---

## Export & Succession

- Timeline export for board · family · documentary
- Succession onboarding: new leader tours Year One → Today

---

## Forbidden

| Action | Why |
|--------|-----|
| Rewrite timeline history | Capsules immutable |
| Future Vision as fact | Honesty |
| Compare without capsule backing | Unverifiable |

---

_Multiple Timelines™ — see how far you've come._
