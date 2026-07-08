# Navigation — Studio Builder™

**Sprint:** Alpha 002  
**Scope:** Production interface wayfinding — not department zone walk

---

## Navigation Layers

```
L0  Studio OS / Headquarters
L1  Studio Builder
L2  Department (Creative Direction Studio™)
L3  Project (Project 001)
L4  Production Group OR Asset Detail
L5  Validation / Prompt Ready modal (ephemeral)
```

Founder spends 90% of time at **L3–L4**.

---

## L0 → L1 Entry

| From | Action | Lands |
|------|--------|-------|
| Headquarters Mission Control | **Production** | Studio Builder department picker |
| Department card (CDS) | **Build** | L2 Creative Direction Studio |
| Command Dock | *"Build Creative Direction"* | L2 directly |

No path through documentation registry or file tree.

---

## L1 Department Picker

```
Studio Builder

┌─────────────────────────┐  ┌─────────────────────────┐
│ Creative Direction      │  │ Discover (future)       │
│ Studio™                 │  │ Not started             │
│ Blueprint Complete      │  │                         │
│ [ Enter Production ]    │  │ [ Locked ]              │
└─────────────────────────┘  └─────────────────────────┘
```

Alpha: only Creative Direction Studio active.

---

## L2 Department Shell

Persistent chrome (minimal):

```
← Headquarters    CREATIVE DIRECTION STUDIO™    Production | Preview Room
```

| Tab | Purpose |
|-----|---------|
| **Production** | Studio Builder queue (default) |
| **Preview Room** | Graybox/live department camera (when assets exist) |

No Settings tab with 40 options. Production settings live in asset detail only when needed.

---

## L3 Project Context

If multiple projects:

```
Project  ▾  Project 001 — Spring Campaign
```

Single project Alpha: hide selector · show subtitle only.

Header always shows:

- Department status (Blueprint Complete · In Production · Ready for Walk)
- Asset fraction (12 / 35)
- Overall progress bar

---

## L4 Production Groups (Primary Scroll)

Vertical **production strip** — one group per screen section:

1. Environment  
2. Architecture  
3. Lighting  
4. Furniture  
5. Glass Systems  
6. Mood Wall  
7. Orb  
8. Timeline  
9. Panels  
10. Particles  
11. Audio  
12. Animations  
13. Holograms / Intelligence  
14. Runtime Metadata  

Tap group header → expand inline asset list OR navigate to group detail.

Tap asset row → **Asset Detail View** (L4 deep).

---

## L4 Asset Detail

Full-screen or slide-over panel (not new browser page):

```
← Back to Production    MOOD WALL — wall-mood-cds

[ Preview area ]
[ Status · History · Validation · Actions ]
```

See [asset-detail-view.md](./asset-detail-view.md).

---

## L5 Ephemeral Surfaces

| Surface | Trigger | Dismiss |
|---------|---------|---------|
| Prompt Ready | Generate completes compile step | Copy · Open Generator · Close |
| Upload Result | Alpha post-FAL | Drag drop · file pick |
| Validation Report | After upload | Approve · Reject · Retry |
| Founder Review | Hero asset | Approve · Request Revision |

Modals feel like **production checkpoints** — slate frame, not browser alert.

---

## Breadcrumb Rule

Maximum visible trail:

```
Studio Builder › Creative Direction › Project 001 › Mood Wall
```

Never:

```
docs › studio-os › alpha › environment-storytelling.md
```

---

## Keyboard / Mobile

| Input | Action |
|-------|--------|
| Tap Generate | Primary action |
| Swipe back | Asset detail → queue |
| Pull refresh | Sync job status (automation phase) |

Mobile-first — production oversight from phone acceptable for Alpha.

---

## Deep Links (Internal)

| Link | Target |
|------|--------|
| `/builder/creative-direction` | L2 |
| `/builder/creative-direction/project-001` | L3 |
| `/builder/creative-direction/project-001/environment` | L4 group |
| `/builder/creative-direction/project-001/asset/wall-mood-cds` | Asset detail |

Founder may bookmark department production — never individual markdown paths.

---

## Navigation Anti-Patterns

| Anti-pattern | Fix |
|--------------|-----|
| Sidebar linking to docs folder | Remove |
| Prompt editor route | Does not exist |
| Manual queue reorder screen | Does not exist |
| Provider picker settings page | Hidden in automation config (admin only, future) |

---

_Navigation — three taps from HQ to Generate, zero taps to markdown._
