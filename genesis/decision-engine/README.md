# Genesis Universal Decision Architecture™

**Ontology:** [`../articles/UNIVERSAL_DECISION_ARCHITECTURE.md`](../articles/UNIVERSAL_DECISION_ARCHITECTURE.md)  
**Runtime:** `src/studio-os-core/genesis/decision-engine/`  
**Admin:** `/admin/studio/genesis` → Decisions tab

The Universal Decision Architecture is Studio World's reasoning engine. Registries start **empty** — no Studio World decision content is seeded at runtime.

## Structure

| Path | Purpose |
|------|---------|
| `decisions/` | Decision Registry™ and Decision Engine |
| `recommendations/` | Recommendation Engine™ |
| `priorities/` | Priority Engine™ |
| `strategies/` | Strategy registration |
| `evidence/` | Evidence Model™ |
| `context/` | Context Engine™ |
| `confidence/` | Confidence Model™ |
| `review/` | Decision review workflow |
| `history/` | Decision History™ |
| `learning/` | Learning Feedback™ |

## Rule

Every recommendation, automation, AI action, workflow, approval, and prioritization must use shared decision primitives rather than isolated reasoning logic.
