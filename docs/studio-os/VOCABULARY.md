# studio os Vocabulary Guide

Use these terms consistently in UI labels, documentation, folder names, and code comments.

**Platform philosophy:** [Headquarters Engine™](./headquarters-engine.md) · [Studio Project™ Model](./project-model.md)

| Term | Definition |
|------|------------|
| **Headquarters** | The customer's entire living business environment — Mission Control home; grows via Expansions |
| **Building** | Major wing or destination on the headquarters lot |
| **Department** | Named business or production room with concierge, tools, exit criteria |
| **Workspace** | Focused room inside a department (studio, editor, gallery) |
| **Project** | Complete creative or business initiative — single source of truth |
| **Output** | Published derivative linked to a Project (Reel, landing page, newsletter, …) |
| **Expansion** | Business capability installed into Headquarters — not a template or app |
| **Organization / Workspace** | A company operating inside studio os. Example: Frontal Slayer, NDXBOOK. |
| **Asset** | Production artifact belonging to a Project |
| **Content Pack** | Legacy term — prefer **Project** + **Outputs** in user-facing copy |

Canonical definitions: `src/studio-os/core/vocabulary.ts` (evolving toward Headquarters hierarchy)

## Platform vs Workspace

- **studio os** — the Business Headquarters Operating System (software platform).
- **Headquarters** — one organization's immersive operating environment.
- **Workspace** — technical tenant scope for one business on studio os.
- **Brand** — identity configuration inside a Workspace (name, colors, voice, rules).

studio os must never assume beauty, hair, e-commerce, PSA, or Lounge TV — those belong to individual Workspaces.

## Avoid (user-facing)

Apps · templates · feature packs · pages · posts · files · screens · tasks (as primary objects)
