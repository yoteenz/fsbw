# Capability map

Inspected on `origin/master` at the start of this sprint. Documentation existing is not treated as production readiness.

| Capability | Where | Class | Notes |
| --- | --- | --- | --- |
| Expert interviews, follow-ups, confirmation | `src/studio-os-core/expert-capture/`, `/expert-capture` | ADAPT | One question at a time. Device storage plus optional server sync. Do not replace it. |
| Permitting and tax profiles | `expert-capture/profiles/` | REUSE DIRECTLY | Company-specific interview content. |
| Knowledge ownership and worker isolation | `expert-capture/trust-vault/` | CONNECT | Isolation manifest is a declaration. Server enforcement for the new lesson is in the apprenticeship access checks, not yet a database policy. |
| Private invites | `expert-capture/invite-system/`, `/studio-institute/invites` | CONNECT | Use later so an expert opens one workflow. Not wired to this proof. |
| Workflow definitions and governance | `src/studio-os-core/workflow-engine/`, `/admin/studio/workflow-engine` | CONNECT | Node language can describe a process. A lesson must not call a live run. |
| Mansion tour, spotlights, progress | `src/tutorial-os/` | ADAPT | Frontal Slayer onboarding. Useful spotlight behavior. Wrong place for company operating procedures. |
| Studio manual, walkthroughs, progress | `src/studio-interactive-manual/` | ADAPT | Workspace help. Progress must not be confused with approved company policy. |
| Cinematic stops and hotspots | `src/studio-os-core/vision-engine/` | DEFER | Presentation shell. No guide character and no takeover model. |
| Rooms, zones, presence | `studio-world-architecture-v2/room-blueprint.ts`, `progressive-presence/` | DEFER | The office is the stage. The active office polish sprint owns those files. This sprint does not edit them. |
| Workflow Journal | Separate branch `cursor/workflow-journal-pilot-1087` | CONNECT | Written capture. Same lifecycle names. Not merged, so this branch does not import it. |
| SITE 00 | Separate client product | DEFER | Not the home of this guide. |

## Recommended integration

Institute owns the lesson. The company office is the stage. Tutorial OS and the manual contribute spotlight behavior later. Vision Engine contributes pacing later. The Workflow Engine receives an approved description only. Nothing in a lesson executes.
