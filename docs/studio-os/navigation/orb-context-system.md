# Orb Context System™

**The Intelligent Host of the Headquarters**

---

## Purpose

Define how the **Orb™** accompanies founders through Scene Architecture™ — understanding and narrating navigation context at every level.

---

## Core Law

The Orb is not a chat widget.

The Orb is the **intelligent host** of Studio World™.

---

## Context Stack

The Orb maintains awareness of:

| Context layer | Orb knows |
|---------------|-----------|
| **Studio World™** | World State™ · time of day · company phase |
| **Headquarters™** | Campus layout · active departments |
| **Department™** | Current destination · department personality |
| **Scene™** | Current place · scene purpose |
| **Workspace™** | Active activity · tools in use |
| **Task™** | Immediate action · blockers |
| **Project history** | Prior decisions · branches · approvals |
| **Founder preferences** | Taste Genome™ · communication style |
| **Company context** | Company Genome™ · industry · stage |

```
OrbContext {
  world: WorldState™
  headquarters: HeadquartersContext
  department: DepartmentId | null
  scene: SceneId | null
  workspace: WorkspaceId | null
  task: TaskId | null
  project: ProjectGenome™
  founder: FounderGenome™ + TasteGenome™
  company: CompanyGenome™
}
```

---

## Orb Navigation Behaviors

| Behavior | Trigger | Example line |
|----------|---------|--------------|
| **Welcome** | Department arrival | "Welcome to Creative Direction." |
| **Orient** | First scene visit | "The Mood Wall is where inspiration becomes direction." |
| **Route** | Founder asks · stuck | "The pipeline board is to your left." |
| **Narrate** | Pipeline event | "Braintrust review is ready at the production board." |
| **Remind** | Incomplete work | "You left a note on the Story Table." |
| **Celebrate** | Milestone | "Golden Build™ approved — the atelier remembers." |
| **Transition** | Department exit | "Discover Department is through the glass corridor." |

---

## Orb and Scene Transitions

During movement:

| Phase | Orb role |
|-------|----------|
| **Pre-move** | Confirms destination · previews work |
| **In-transit** | Brief guidance line (Transition™) |
| **Arrival** | Scene-specific orient line |
| **Idle** | Ambient insight · not intrusive |

**Source:** [Orb Guidance — Transitions™](../world/transitions/orb-guidance.md)

---

## Orb and Guild / Professional Context

When [Guild System™](../community/README.md) is active:

- Orb knows guild membership · nominations · mentorship invites
- Orb references professional society context naturally
- Not popularity — excellence and craft

---

## Orb Spatial Placement

| Location | Orb behavior |
|----------|--------------|
| **Story Table Scene™** | Primary host position — above table |
| **Arrival Scene™** | Distant · welcoming pulse |
| **Review scenes** | Facilitator · Braintrust voice |
| **Transit** | Floating guide · not modal |
| **Command scenes** | Advisory · not obstructive |

**Law:** Orb speech is spatial · not chrome overlay.

**Source:** [Orb as Host — CDS V2](../creative-direction-studio/orb-as-host.md)

---

## Orb Intelligence Integration

| System | Orb uses |
|--------|----------|
| [Founder Intelligence™](../intelligence/README.md) | Three Genomes™ |
| [Founder Taste Engine™](../founder-taste-engine/README.md) | Taste learning |
| [Creative Direction Pipeline™](../creative-direction-pipeline/README.md) | Stage narration |
| [World Memory™](../world/world-memory.md) | Position restore |
| [Adaptive Walk™](../engine/adaptive-walk/02_WALK_MODES.md) | Daily ritual context |

---

## Orb Commands (Navigation)

Natural language navigation:

| Founder says | Orb does |
|--------------|----------|
| "Take me to hiring" | Transition™ to Hiring Department™ |
| "Show me the pipeline" | Camera to Production Pipeline Scene™ |
| "I need to review concepts" | Route to Branch Gallery Scene™ |
| "Back to headquarters" | Exit transition to lobby |

Commands are **routing** — not feature menus.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Orb as corner chatbot | Not host |
| Orb unaware of scene | Breaks continuity |
| Orb modal over room | Software not place |
| Orb generic responses | Must use context stack |
| Orb as search bar | Navigation not lookup |

---

## Cross-References

- [immersion-principles.md](./immersion-principles.md)
- [movement-philosophy.md](./movement-philosophy.md)
- [Studio Orb — Golden Department](../golden-department/creative-direction-studio/09_ORB_AND_CONCIERGE.md)
