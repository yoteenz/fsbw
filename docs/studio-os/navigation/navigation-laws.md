# Navigation Laws™

**Binding Rules for All of Studio OS**

---

## Purpose

Codify the **non-negotiable navigation laws** every department · scene · workspace · and future implementation must obey.

---

## The Ten Laws

### Law 1 — Places Not Pages

Studio OS navigates through **places**.

Never through pages · screens · dashboards · or card grids.

---

### Law 2 — Departments Are Destinations

A Department™ is a destination the founder **enters**.

Not a route · not a sidebar item · not a module.

---

### Law 3 — Scenes Are Workspaces

A Scene™ is a focused place with **one clear purpose**.

Scenes exist because work happens there — never because another page was needed.

---

### Law 4 — Arrival Before Exploration

No department exposes its full interior on load.

**Arrival Scene™** first · partial sightlines · scale reveal · then exploration.

---

### Law 5 — Movement Not Scroll

The room never scrolls vertically.

Movement = walk · camera · pan · orbit · transition · station nav.

Internal workstation scroll only where specified.

---

### Law 6 — Continuity Always

Every department inherits headquarters continuity:

Arrival Zone™ · Orb™ · Navigation™ · Lighting™ · Ambient Life™ · Hallways™ · Transitions™ · Doors™ · Materials™

---

### Law 7 — Orb Knows Context

The Orb maintains the full context stack:

department · scene · workspace · task · project · founder · company.

The Orb hosts — not chats from a corner.

---

### Law 8 — World Never Empty

Departments feel alive on entry.

Idle Life™ · ambient systems · background work · displays updating.

The founder joins work in progress.

---

### Law 9 — Inheritance Downward

```
Studio World™ → Headquarters™ → Department™ → Scene™ → Workspace™ → Interaction™ → Task™
```

Every lower level inherits context from above.

---

### Law 10 — Ask Workspace Not Page

| Forbidden | Required |
|-----------|----------|
| "What page should we build?" | "What workspace belongs in this department?" |
| "Where in the nav?" | "Where in the headquarters?" |
| "Modal or drawer?" | "What object in the room?" |

---

## Implementation Gates

Before any navigation UI ships:

| Gate | Test |
|------|------|
| **G1 Place** | Can founder point to where they are? |
| **G2 Arrival** | Is full department hidden on entry? |
| **G3 Movement** | Is vertical room scroll absent? |
| **G4 Scene** | Does each zone have one clear purpose? |
| **G5 Orb** | Does Orb know current scene? |
| **G6 Life** | Does room breathe when idle 30s? |
| **G7 Continuity** | Does it feel like same headquarters? |
| **G8 Workspace** | Is activity named · not just "panel"? |

---

## Relationship to Production Lifecycle™

Navigation respects lifecycle — scenes expose stage-appropriate work:

| Lifecycle stage | Navigation emphasis |
|-----------------|---------------------|
| Blueprint™ | Exploration · concept scenes |
| Golden Build™ | Production Pipeline scenes |
| Certified™ | Review · certification scenes |
| Live™ | Operations · monitoring scenes |
| Legacy™ | Archive · chronicle scenes |

---

## Violation Severity

| Violation | Severity |
|-----------|----------|
| Page scroll for full room | **Critical** — reject |
| No arrival scene | **Critical** — reject |
| Floating dashboard panel | **High** — redesign |
| Scene without physical anchor | **High** — invalid scene |
| Missing Orb context | **Medium** — fix before ship |
| Weak idle life | **Medium** — polish gate |

---

## Cross-References

- [scene-architecture.md](./scene-architecture.md)
- [movement-philosophy.md](./movement-philosophy.md)
- [world-rules.md](../world/world-rules.md)
