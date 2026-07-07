# Project Lifecycle Experience — Part 5

**Version:** 2.0.0  
**Parent:** [EXPERIENCE_STUDIO_2.0_SPEC.md](./EXPERIENCE_STUDIO_2.0_SPEC.md) §6  
**Inherits:** System Registry `es-project` · Master Content Pipeline™ · v1.0 Project List (scr-es-004)

---

## Design Intent

A Project™ is a **production** — with acts, departments, memory, and outputs. Not a folder.

---

## Project Object — Experience Model

```
Project™ {number}
│
├── 🎬 IDENTITY
│   ├── Name · type · status language
│   └── Campus map presence (dot · wing light)
│
├── 📅 TIMELINE (horizontal acts)
│   ├── Discover → Develop → Produce → Review → Publish → Learn
│   └── Version milestones overlaid
│
├── 🎨 CREATIVE DIRECTION
│   ├── Brief · mood boards · branches
│   └── Founder Notes (pinned)
│
├── 🏭 DEPARTMENT PROGRESS
│   ├── Current department · concierge
│   ├── Exit criteria checklist
│   └── Blockers (warm tone)
│
├── 📦 OUTPUTS
│   ├── Experiences · assets · published URLs
│   └── Master Content Asset (living object)
│
├── 📊 ANALYTICS (post-live)
│   └── Intelligence Department feed
│
└── 🧠 AI MEMORY
    ├── Accepted/rejected proposals
    ├── DNA preferences
    └── Director lessons
```

---

## Project Dashboard Layout

**Not a table.** Production control room.

```
┌────────────────────────────────────────────────────────────────┐
│  PROJECT 014 — SALON LUMIÈRE WEBSITE              DH: 84  ⌘K   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   HERO — large preview · status · NEXT ACTION button           │
│                                                                │
│   TIMELINE — horizontal act bar · current department glow      │
│                                                                │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│   │ Creative    │ │ Production  │ │ Publishing  │  department │
│   │ Direction ✓ │ │ Stage ●     │ │ Preview ○   │  cards      │
│   └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                │
│   FOUNDER NOTES — pinned · editable                            │
│   OUTPUTS RAIL — artifacts · thumbnails                        │
│                                                                │
│                    [ Studio Orb ]                              │
└────────────────────────────────────────────────────────────────┘
```

---

## Status Language

| System state | Founder sees | Color |
|--------------|--------------|-------|
| `conceived` | In creative direction | Muted |
| `in_development` | In Development Department | Accent |
| `in_production` | On the Production Stage | Active glow |
| `in_review` | In the Review Theater | Amber |
| `approved` | Cleared for publish | Success |
| `live` | Live · performing | Success + pulse |
| `learning` | Gathering intelligence | Calm |
| `archived` | In Legacy Vault | Muted |

---

## Project Timeline

| Act | Departments | Visual |
|-----|-------------|--------|
| 1 · Discover | 01 | Opportunity icon |
| 2 · Develop | 02 | Mood board thumbnail |
| 3 · Produce | 03–04 | Canvas preview |
| 4 · Review | 05–07 | Theater seats |
| 5 · Publish | 08 | Control room |
| 6 · Learn | 09–10 | Observatory |

Tap act → travel to department with Project context.

---

## Founder Notes

| Rule | Detail |
|------|--------|
| Visibility | Always on Project dashboard · pin icon |
| Format | Freeform · voice · Orb capture |
| AI use | Director references in proposals |
| Privacy | Never shared externally without consent |

---

## Department Progress on Project

Each department card shows:

- Concierge name
- Exit criteria (3 max visible)
- Time in department (optional · not pressure)
- **Continue** CTA when ready

---

## AI Memory

| Captured | Used for |
|----------|----------|
| Rejected proposals | Never re-propose same |
| DNA adjustments | Future project defaults |
| Branch decisions | Director explanations |
| Publish learnings | Intelligence loop |

**Transparency:** Founder can view · edit · delete memory in Executive Office.

---

## Multi-Project Experience

| View | Default |
|------|---------|
| Mission Control | All projects · hero = highest priority |
| Creative Wing | Active productions |
| Orb | "Resume [Project]" if single active |

**Never:** 50-row sortable table as home.

---

*Project Lifecycle — direct productions · don't manage files.*
