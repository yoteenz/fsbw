# Founder Experience — Lifecycle Communication

**Version:** 1.0.0  
**Status:** Canonical UX language for lifecycle stages

---

## Purpose

Every experience inside Studio OS must **communicate its lifecycle stage**.

Founders should always know:

1. **Where something is today** — current stage
2. **Where it lives historically** — Archive™ when applicable

---

## Dual Awareness Principle

```
┌─────────────────────────────────────────────────────────┐
│  TODAY                         HISTORY                  │
│  ─────                         ───────                  │
│  Stage badge: Live™            Archive™ link (if Legacy)│
│  Status in room header         Chronicle entry          │
│  Orb mentions current stage    "First version in Archive"│
└─────────────────────────────────────────────────────────┘
```

---

## Stage Communication Matrix

| Stage | Badge | Room signal | Orb register | Primary founder question answered |
|-------|-------|-------------|--------------|-----------------------------------|
| **Blueprint™** | Blueprint | Planning surfaces · no live gen | Exploratory | "What are we building?" |
| **Golden Build™** | Golden Build | Immersive shell · core interactions | Guiding · instructional | "Can I feel the vision?" |
| **Certified™** | Certified + certs | Full experience · validation done | Confident · ceremonial | "Is this ready?" |
| **Live™** | Live | Default HQ experience | Operational | "How do I work here?" |
| **Evolution™** | Evolution | Changelog-aware · improving | Advisory | "What's getting better?" |
| **Legacy™** | Legacy | Archive™ access only | Reflective | "What did we build?" |

---

## Lifecycle Badge System

Every lifecycle-bearing surface displays:

```
┌──────────────────────┐
│ CREATIVE DIRECTION   │
│ STUDIO™              │
│ ● Golden Build™      │  ← stage badge
│ Studio Certified™    │  ← optional certification badges
└──────────────────────┘
```

| Badge color language (conceptual) | Stage |
|-----------------------------------|-------|
| Sketch · blueprint tone | Blueprint™ |
| Gold · proof tone | Golden Build™ |
| Seal · certification tone | Certified™ |
| Active · operational tone | Live™ |
| Pulse · growth tone | Evolution™ |
| Archive · memory tone | Legacy™ |

---

## Room Header — "The Room Should Answer"

Every immersive room header communicates:

| Question | Source |
|----------|--------|
| Where am I? | Department · zone |
| What project is loaded? | Project Genome™ |
| What lifecycle stage? | Stage badge |
| What can I do? | Zone teaching · interaction affordances |
| What is generating? | Generation Queue status |
| What should I do next? | Orb guidance |

**Golden Build example (implemented):**

```
WHERE · Mood Wall Zone
PROJECT · Project 001
GENERATING · Complete
STAGE · Golden Build™
```

---

## Orb Lifecycle Modulation

| Stage | Orb personality |
|-------|-----------------|
| Blueprint™ | "What direction are we setting?" |
| Golden Build™ | "Welcome — let me show you what we've proven." |
| Certified™ | "We've earned certification. Ready when you are." |
| Live™ | "Here's your status. What shall we work on?" |
| Evolution™ | "We've refined the mood wall since your last visit." |
| Legacy™ (Archive™) | "Do you remember when this was our first room?" |

---

## Founder Language Examples

Studio OS succeeds when founders naturally say:

| Statement | Stage |
|-----------|-------|
| "This department is still in Blueprint™." | Blueprint™ |
| "Our Creative Direction Studio reached Golden Build™." | Golden Build™ |
| "This Marketplace Pack is Certified™." | Certified™ |
| "Our Marketing Department is Live™." | Live™ |
| "Our Concierge AI is currently in Evolution™." | Evolution™ |
| "Our original Headquarters has entered Legacy™." | Legacy™ |
| "Let's visit The Archive™ and revisit our first Golden Build™." | Archive™ |

---

## Transition Ceremonies (Founder-Facing)

| Transition | Ceremony weight |
|------------|-----------------|
| Blueprint → Golden Build | Medium — "The vision is now walkable" |
| Golden Build → Certified | Heavy — validation celebration |
| Certified → Live | Heavy — launch · Headquarters arrival |
| Live → Evolution | Light — continuous · changelog |
| Evolution → Legacy | Ceremonial — preservation · Archive™ opening |

Ceremony weight scales with [Founder Journey™](../alpha/founder-journey.md) stage.

---

## Mission Control Integration

Headquarters Mission Control displays lifecycle at a glance:

```
DEPARTMENTS
├── Creative Direction Studio™    Golden Build™
├── Marketing                     Blueprint™
├── Discovery                     Live™ · Evolution™
└── Original CDS (Archive™)       Legacy™

PACKS
├── Luxury Retail Template        Certified™
└── Editorial Mood Kit            Evolution™
```

Click any row → stage detail · gate status · Archive™ link

---

## Anti-SaaS Law

Lifecycle must never feel like:

| SaaS pattern | Studio OS replacement |
|--------------|----------------------|
| "Draft" / "Published" | Blueprint™ / Live™ |
| "Beta" badge | Golden Build™ |
| "Archived" folder | Legacy™ + Archive™ wing |
| Version number only | Stage + Chronicle narrative |

---

## Accessibility

Stage badges and Chronicle links must be:

- Screen-reader announced
- Not color-only
- Available in non-immersive admin fallback (future)

---

## Cross-References

- [production-lifecycle.md](./production-lifecycle.md) — master spec
- [quality-gates.md](./quality-gates.md) — transition requirements
- [archive-system.md](./archive-system.md) — historical access
- [founder-chronicle.md](./founder-chronicle.md) — narrative layer
