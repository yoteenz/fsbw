# Workspaces as Scenes™

**Module:** `studio.creative-intelligence-engine.v1.workspaces`  
**Status:** Tabs are dead — scenes are rooms

---

## Law

> Every former navigation **tab** is a **workspace scene** — not a page · not a route-rendered form · not a dashboard panel.

The founder **transitions between workspaces** as if moving through connected rooms inside one creative headquarters.

---

## Workspace Scene Map

| Former tab / zone | Workspace scene | Scene ID |
|-------------------|-----------------|----------|
| Entry / spawn | **Arrival™** | `arrival` |
| Strategy / brief | **Story Table™** | `story-table` |
| Inspiration | **Mood Wall™** | `mood-wall` |
| Notes / journal | **Notes Desk™** | `notes-desk` |
| Production | **Pipeline™** | `pipeline` |
| Reference / archive | **Library™** | `library` |

---

## Scene vs Page

| Page (forbidden) | Scene (required) |
|------------------|------------------|
| React route swaps card layout | Camera transitions between physical rooms |
| Scrollable content column | Diegetic surfaces · localized scroll only |
| Sidebar nav | Walk · doorway · orbital discover |
| Form embedded in page | Controls on physical objects |
| Loading spinner on white | Environmental loading (lights · Orb) |

---

## Transition Model

```yaml
WorkspaceTransition:
  fromScene: string
  toScene: string
  type: walk | doorway | orbit | elevator | cut  # cinematic
  durationMs: number
  preserveWorldState: true
  arrivalSequence: boolean    # first visit may use Arrival Sequence™
```

Founder should **feel movement** — not SPA navigation.

---

## Per-Scene Requirements

Each workspace scene must have:

| Requirement | Definition |
|-------------|------------|
| **Physical envelope** | Architecture · scale · lighting unique to room |
| **Scene Stack™ manifest** | Independent generatable layers |
| **Signature object** | Hero furniture or landmark |
| **Orb presence** | Host behavior per room |
| **Natural controls** | Interactions emerge from objects |
| **Connection** | Visible or implied path to adjacent scenes |

Detail: [physical-workspaces.md](./physical-workspaces.md).

---

## CDS Headquarters Topology

```
                    ┌─────────────┐
                    │  Library™   │
                    └──────┬──────┘
                           │
    ┌──────────┐    ┌─────┴─────┐    ┌──────────────┐
    │ Mood     │    │  Story    │    │  Pipeline™   │
    │ Wall™    ├────┤  Table™   ├────┤  (production │
    └──────────┘    │  + Orb    │    │   command)   │
                    └─────┬─────┘    └──────────────┘
                          │
                    ┌─────┴─────┐
                    │ Notes     │
                    │ Desk™     │
                    └───────────┘

    Entry: Arrival™ → reveals Story Table™ sightline first
```

---

## Scene Generation

Each workspace is a **Scene Stack™** instance — not a designed mockup.

[Scene Generation Pipeline](./scene-generation-pipeline.md) generates layers per scene.

---

## Relationship to Architectural Icons™

| Workspace | Landmark |
|-----------|----------|
| Story Table™ | **Signature Landmark™** of CDS |
| Mood Wall™ | Scene (not department landmark) |
| Pipeline™ | Production command scene |

See [Architectural Icons™](../architectural-icons/README.md).

---

_Workspaces as Scenes™ — walk the headquarters, never browse tabs._
