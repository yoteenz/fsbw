# Genesis Orb™

**Ontology:** [`../articles/ORB.md`](../articles/ORB.md)  
**Program:** Studio OS Launch Stack™ — Stack 2  
**Runtime:** *(planned — Executive Intelligence Layer implementation sprint)*  
**Platform guide:** [`../../docs/studio-os/genesis/ORB_ARCHITECTURE.md`](../../docs/studio-os/genesis/ORB_ARCHITECTURE.md)

Orb™ is the Executive Intelligence Layer of Studio OS.

It is **not** an AI chatbot.

It is **not** a floating assistant.

Orb is the founder's permanent executive partner: Chief of Staff, strategist, creative collaborator, mission coordinator, memory keeper, knowledge guide, and business architect.

## Stack 2 v1 scope

| Capability | Role |
|------------|------|
| Arrival behavior | Contextual greeting and orientation |
| Persistent presence | Calm executive partner across rooms |
| Daily Briefing™ | What changed, what matters, what to do next |
| Recommendation engine | Evidence, confidence, alternatives, tradeoffs |
| Mission planning | Founder intent → mission draft |
| Decision support | Options, risks, reversibility, stakeholders |
| Knowledge retrieval | Source-backed answers and provenance |
| Memory hierarchy | Short-term, working, long-term, canonical, company, founder, creative, learning, archived |
| Proactive behavior | Interrupt, remain silent, recommend, observe, summarize, celebrate, teach |
| Command handoff | Draft only; route action through Command Center™ |

## Rule

Orb owns **intelligence composition**. It does not own company truth, mission truth, knowledge truth, command truth, permission truth, file truth, or calendar truth.

## Future runtime

Planned runtime home:

```text
src/studio-os-core/genesis/orb/
```

Use projection adapters until upstream systems mature:

- `OrbFounderContextProjection`
- `OrbCompanyContextProjection`
- `OrbMissionContextProjection`
- `OrbKnowledgeContextProjection`
- `OrbMemoryProjection`
- `OrbRecommendationProjection`
- `OrbBriefingProjection`
- `OrbAttentionProjection`
