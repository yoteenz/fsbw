# Ambient Storytelling™

**System:** Ambient Storytelling™  
**Status:** Canonical experience law  
**Scope:** Every department · Headquarters · The Archive™

---

## Purpose

Every room should **quietly communicate** what is happening — without requiring the founder to read text.

The headquarters itself **visually evolves** alongside the company.

Story is told by the **environment** — not status paragraphs.

---

## Storytelling Philosophy

| Ambient Storytelling Is | Ambient Storytelling Is Not |
|-------------------------|----------------------------|
| Objects appearing because work happened | Tooltips explaining state |
| Fuller shelves · fuller walls over time | Dashboard metrics |
| Environmental cause and effect | Notification feed |
| Show · don't tell | Read me first |

---

## Storytelling Channels

| Channel | How story is told |
|---------|-------------------|
| **Surfaces** | Mood Wall fullness · Story Table prototypes · reference shelf density |
| **Lighting** | Approval glow · generation active rim · Legacy desaturation |
| **Objects** | Packaging prototype appears because Packaging is working |
| **Motion** | Assistant carrying document · door opening to active department |
| **Audio** | Distant activity in Production · silence in Archive™ |
| **Placement** | Awards on wall after milestone · campaigns migrating to Archive™ |
| **Plaques** | Golden Build™ markers on completed projects |
| **Wear** | Lived-in creative space — not sterile template |

---

## Worked Examples

| Company state | Environmental story (no text required) |
|---------------|----------------------------------------|
| Packaging department active | Packaging prototype on Story Table · mockup box in soft light |
| Inspiration collecting | Mood Wall grows fuller · new references visible |
| Project approved | Timeline lock glow · warm exit portal |
| Milestone achieved | Award object appears on reference shelf |
| Campaign completed | Creative artifacts migrate toward Archive™ corridor |
| Department Certified™ | Subtle certification seal in environment materials |
| Golden Build achieved | Plaque · environmental quality tier visible |
| Legacy™ entry | Exhibit lighting in Archive™ wing · reflective Orb |

---

## Creative Direction Studio™ — Ambient Story Rules

| Signal | Environmental response |
|--------|------------------------|
| 0 inspirations | Mood Wall neutral · inviting empty pins |
| 3+ inspirations | Wall visually richer · crossfade idle active |
| Generation queued | Console rim pulse · hero wall awaiting |
| Generation complete | Environment preview slot illuminates |
| Founder pinned decision | Brief Wall pin glow persists |
| Project branch active | Sandbox zone lit · compare ready |
| No project bound | Brief invites first pin · Orb exploratory |

All without modal · without "You have 3 inspirations" text.

---

## Relationship to Production Lifecycle

| Lifecycle event | Ambient storytelling beat |
|-----------------|---------------------------|
| Golden Build™ | Plaque · hero object proof visible |
| Certified™ | Quality materials · seal in architecture |
| Live™ | Full environmental activity · staff visible |
| Evolution™ | Objects update · shelves refresh |
| Legacy™ | Migration toward Archive™ · exhibit prep |

---

## Relationship to Idle Life™

Idle Life™ **animates** ambient story:

- Mood Wall crossfade shows creative evolution
- Screen rotation shows project breadth
- Assistant movement shows org activity

Story is **static placement** + **idle motion** combined.

---

## Technical Contract

```json
{
  "ambientStorytelling": {
    "departmentId": "creative-direction",
    "signals": [
      {
        "id": "mood-wall-fullness",
        "source": "living-mood-wall.itemCount",
        "thresholds": [
          { "gte": 0, "lte": 2, "visual": "sparse-inviting" },
          { "gte": 3, "visual": "rich-editorial" }
        ]
      },
      {
        "id": "packaging-active",
        "source": "department.status.packaging",
        "visual": "story-table-prototype"
      },
      {
        "id": "golden-build-plaque",
        "source": "lifecycle.stage",
        "when": "golden-build",
        "visual": "plaque-hero-wall"
      }
    ]
  }
}
```

Compiled from Department Package · lifecycle metadata · org state.

---

## Anti-Patterns

| Anti-pattern | Correct approach |
|--------------|------------------|
| Banner: "Packaging is working on your box" | Prototype on table |
| Empty room until founder adds content | Lived-in default · genome seeds |
| Story only in notifications panel | Environment is the notification |
| Reset visual story on refresh | World Persistence™ restores |

---

## Golden Build™ Status

Alpha implements partial ambient storytelling:

- Mood wall item count affects content (not yet visual fullness tiers)
- Generation queue status in HUD pill
- Atmosphere from Room DNA™

Full ambient tiers: **post-arrival + post-idle** implementation.

---

## Cross-References

- [Environment storytelling alpha](../alpha/environment-storytelling.md)
- [Emotional Design Principle™](./emotional-design-principle.md)
- [World Persistence™](./world-persistence.md)
- [Archive System™](../production-lifecycle/archive-system.md)
