# Founder Experience™

**Module:** `studio.creative-budgets.v1.founder-experience`  
**Status:** Creative capacity UX contract (spec only)

---

## Experience Goal

Founder feels like a **Creative Director** managing a monthly production allocation at a world-class studio:

- Knows creative capacity remaining
- Sees reuse savings compound
- Understands pending vs spent
- Never thinks about API calls

---

## Budget Visibility Placement

| Moment | Budget appears |
|--------|----------------|
| Mission Control load | Full Creative Budget™ card |
| Before Production Estimate™ | Compact available pill |
| After estimate approval | Pending increment confirmation |
| During production | Pending holds · no surprise spend |
| On production complete | Spent + savings update |
| Month boundary | Period summary |

---

## Approval Flow (With Budget)

```
Founder requests production
         ↓
Production Estimate™ calculated
         ↓
Creative Budget™ pill: "$180.14 available"
         ↓
Founder reviews estimate + Orb WHY
         ↓
If available ≥ cost → Approve Production™
If available < cost → Orb suggests Revise Scope™
         ↓
On Approve:
  estimatedPendingUsd += cost
  Orb: "Reserved $2.48 for Story Table™"
         ↓
Generation Manager™ executes
         ↓
On complete:
  spent += cost · pending -= cost
  savings += estimate.savings
  Orb celebrates reuse win
```

---

## Capacity Gate UX

| Scenario | UX |
|----------|-----|
| Sufficient capacity | Silent approve path |
| Tight capacity | Amber pill · Orb reuse suggestion |
| Depleted | Soft gate · Revise Scope™ emphasized |
| Pending heavy | Show in-flight total prominently |

Hard gate only when `available = 0` and no platform override.

---

## Efficiency Celebration

When Efficiency Score™ crosses bands:

| Event | UX |
|-------|-----|
| First 90%+ month | Subtle Headquarters atmosphere acknowledgment (future) |
| Savings milestone ($100+) | Orb headline celebration |
| Blueprint reuse streak | Consistency callout |

Never gamification badges that feel like SaaS — studio dignity.

---

## Progress Display (During Month)

| Show | Hide |
|------|------|
| Spent · Pending · Available | Provider spend |
| Efficiency Score™ trend | Token burn rate |
| Assets · Blueprints reused | Model routing |
| Productions completed count | API endpoint activity |

---

## Mobile-First

- Budget card single column
- Currency grid thumb-scannable
- Efficiency Score™ hero metric
- Orb coaching below fold

---

## Relationship to Production Estimates™

| Layer | Role |
|-------|------|
| **Production Estimate™** | Per-job scope + cost |
| **Creative Budget™** | Monthly envelope |

Estimate approval **always** updates budget pending — unified informed consent.

---

## Relationship to Founder Control™

Founder may:

| Action | Budget effect |
|--------|---------------|
| Force more reuse in estimate | Lower pending reservation |
| Approve higher-scope estimate | Higher pending |
| Cancel pending production | Release reservation |
| Revise estimate | Old reservation closed · new reserved |

---

_Founder Experience™ — creative capacity with studio dignity._
