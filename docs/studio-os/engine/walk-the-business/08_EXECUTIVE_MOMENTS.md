# 08 — Executive Moments

**Engine Module:** `studio.walk-the-business.v1.executive-moments`  
**Status:** Organic surprise and celebration system  
**Philosophy:** Unexpected moments should feel organic — not scripted notification spam.

---

## Design Principle

> As the founder walks, **unexpected moments occur** — creative feedback requests, launch celebrations, marketplace recommendations, testimonials, trend discoveries, revenue milestones. Timed naturally · deferrable · memorable.

---

## Moment Types

| Type | Example |
|------|---------|
| **Creative request** | Creative Director wants feedback on overnight inspiration |
| **Launch celebration** | Marketing celebrates successful campaign launch |
| **Marketplace recommendation** | Marketplace Concierge: new Expansion fits Genome |
| **Testimonial** | Customer left memorable testimonial — gallery object appears |
| **Trend discovery** | Studio Intelligence surfaced relevant industry trend |
| **Revenue milestone** | Revenue threshold crossed — Observatory ceremony |
| **VIP arrival** | High-value client activity — Customer Experience |
| **Team win** | Production ahead of schedule — subtle celebration |
| **Learning insight** | Post-session learning validated a prior decision |

---

## Moment Schema

```yaml
ExecutiveMoment:
  momentId: string
  type: enum
  priority: enum                  # delight · important · critical

  departmentId: string
  anchorId: string | null
  triggerSource: enum             # intelligence · analytics · concierge · project · marketplace

  narrative: string               # natural setup
  concierge: AIRoleId | null
  ceremony: string | null

  deferrable: boolean
  expiresAt: ISO8601 | null
  experienced: boolean
```

---

## Timing Engine

```
Moments queued from overnight intelligence + real-time signals
    ↓
MomentScheduler assigns to walk stops (not all at arrival)
    ↓
Max 2 moments per walk (priority mode: 1)
    ↓
Never stack — spacing minimum 3 stops between moments
    ↓
Founder may defer: "Not now" → resurfaces at conclusion or tomorrow
```

**Organic** means: tied to spatial context · narrated by concierge · not modal popup.

---

## Canonical Moment Examples

### Creative Director Feedback Request

At Creative Direction stop — Creative Director at Mood Wall:

> "Overnight I explored a bolder editorial direction for Project 014. It won't take long — would you like a look?"

Founder: yes → brief preview · optional Walk the Room branch.

### Marketing Launch Celebration

Confetti particles (Genome-weighted restraint) · Marketing Concierge:

> "The Truth Tuesday campaign launched at 6 AM. Early engagement is 40% above forecast."

30-second ceremony. Deferrable.

### Marketplace Expansion

Marketplace wing glow · Concierge at new pedestal:

> "A Headquarters Expansion for Podcast Production matches your Genome. Worth a walk-through when you have time."

### Revenue Milestone

Analytics Observatory — light sculpture rises:

> "We crossed $100K monthly recurring. Orb has the full story when you're ready."

---

## Anti-Spam Rules

| Rule | Detail |
|------|--------|
| Max moments per walk | 2 full · 1 priority |
| No duplicate type same day | One revenue milestone · one launch |
| Defer respected | 24h minimum before resurface |
| Critical only interrupts | VIP · launch failure · approval deadline |
| Celebrations Genome-weighted | Law firm ≠ nightclub confetti |

---

## Moment → Action

Moments may trigger:
- Inline approval
- Walk the Room branch
- Critique Session schedule
- Marketplace preview
- Logged delight in Room Memory

---

_Next: [09 — Command Interface](./09_COMMAND_INTERFACE.md)_
