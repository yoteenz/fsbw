# Future Taste Engine™

**Implementation phases · integration map · open questions**

---

## Purpose

Roadmap for implementing Founder Taste Engine™ as a **foundational intelligence layer** — without UI · React · or new generation engines in this sprint.

---

## What This Sprint Did

| Deliverable | Status |
|-------------|--------|
| `docs/studio-os/founder-taste-engine/` (11 documents) | ✅ |
| Foundational intelligence philosophy | ✅ |
| Founder Taste Genome™ schema | ✅ |
| Platform integration map | ✅ |
| CORE.md · MEMORY.md update | Pending commit |

---

## What This Sprint Did NOT Do

| Excluded | Reason |
|----------|--------|
| React · UI components | User instruction |
| New generation engine | Platform freeze |
| Taste profile settings page | Philosophy rejects manual forms |
| Code changes to studio-builder | Docs sprint only |

---

## Architectural Position

Founder Taste Engine™ is **not a new engine** in the frozen stack sense.

It is an **intelligence layer** that:

1. **Subscribes** to founder decision events
2. **Maintains** Founder Taste Genome™ store
3. **Consults** before generation via existing Context Engine
4. **Surfaces** observations via Orb

### Proposed Code Location (Future)

```
src/studio-os-core/founder-taste-engine/
  types.ts                 — Taste Genome schema
  signal-capture.ts        — Decision event handlers
  taste-learning.ts        — Pattern extraction
  taste-genome-store.ts    — Founder-scoped persistence
  predictive-design.ts     — Concept weighting · elimination
  canon-store.ts           — Canon™ · Alternate Branch™
  taste-transfer.ts        — Cross-company resolution
  orb-taste-advisor.ts     — Observation generation
  context-consultation.ts  — Studio Intelligence hook
  index.ts
```

Orchestrates existing systems — does not replace Generation Manager™ · Prompt Compiler™ · or Model Orchestrator™.

---

## Implementation Phases

### Phase 1 — Signal Capture

| Work | Source events |
|------|---------------|
| Decision event schema | Approve · reject · branch · select · feedback |
| Hook Creative Direction Pipeline™ | Concept selection |
| Hook Refinement Pipeline™ | Node approval |
| Hook Director Feedback™ | NL parse → taste intents |
| Hook Adaptive Onboarding™ | Early conversation signals |

### Phase 2 — Taste Genome

| Work | Output |
|------|--------|
| Genome store (founder-scoped) | `studioOsFounderTasteGenome_v1` |
| Dimension mutation engine | Incremental weight updates |
| Confidence model | Hypothesis → core |
| Founder confirm/reject/refine API | Override automation |

### Phase 3 — Predictive Design

| Work | Consumer |
|------|----------|
| Concept weighting | Concept First™ generators |
| Weak concept elimination | Pre-presentation filter |
| Prompt Compiler™ consultation | Material · lighting · scale defaults |
| Transparency report | Orb · optional founder view |

### Phase 4 — Canon & Branches

| Work | Integration |
|------|-------------|
| Canon™ store per company | Production truth |
| Alternate Branch™ archive | Legacy Vault™ path |
| Branch → Canon promotion ceremony | Spatial acknowledgment |

### Phase 5 — Platform Integration

| Work | Systems |
|------|---------|
| Studio Intelligence Context Engine | Taste as source 11 |
| Marketplace ranking | Taste alignment score |
| Orb taste dialogue | Observation surfacing |
| Command Dock proactive | Taste-informed prep |
| Event Bus™ publishers/subscribers | Platform-wide signals |

### Phase 6 — Taste Transfer

| Work | Behavior |
|------|----------|
| Founder-scoped genome on new org | Day-one alignment |
| Company Taste Overlay | Per-company adjustments |
| Portfolio multi-company resolution | Holding company support |

---

## Relationship to Existing M-Systems

| System | Relationship |
|--------|--------------|
| **M112 Relationship Memory™** | Complementary — work habits vs creative taste |
| **M95 Organization Genome™** | Company identity — taste informs · does not replace |
| **M96 Memory Engine™** | Organizational outcomes — taste is founder creative memory |
| **M122 Studio Intelligence™** | Taste joins Context Engine |
| **M131 Event Bus™** | Decision events publish here |
| **Creative Direction Pipeline™** | Primary taste signal source |
| **Founder Journey™** | Taste matures with founder stage |

---

## Migration from Current Implementation

| Current | Evolution |
|---------|-----------|
| `directors-notes-store.ts` | Feeds taste signals · remains |
| `project-genome` creative notes | Per-project · taste is cross-project |
| Creative Approval Pipeline decisions | Signal source until CD Pipeline migrates |
| Rejected concept archive (CD Pipeline docs) | Elevated to Alternate Branch™ platform law |

No breaking changes until vision-first pipeline ships.

---

## Open Questions

| Question | Options |
|----------|---------|
| Genome storage | localStorage founder key vs Supabase `founder_taste_genomes` |
| Team taste (V2) | Separate genomes per role vs founder-only V1 |
| Taste decay rate | 90-day half-life vs milestone-based |
| Elimination transparency | Always show count vs founder preference |
| Cross-founder companies | CEO vs creative director taste conflict resolution |
| Marketplace taste privacy | Anonymized pattern contribution opt-in |

---

## Success Validation

| Test | Pass criteria |
|------|---------------|
| Founder sentiment | "I no longer have to explain myself" |
| Prediction accuracy | >70% concept selection predictable at "established" maturity |
| Transfer | Company 2 day-one concepts taste-aligned without re-training |
| Transparency | Every elimination explainable by Orb |
| Override | Founder reject removes pattern within 1 session |
| Platform coverage | Taste consulted in generation · review · marketplace |

---

## Documentation Updates Required (On Implementation)

| Document | Update |
|----------|--------|
| [Creative Direction Pipeline™](../creative-direction-pipeline/README.md) | Taste Learning integration |
| [Studio Intelligence Architecture™](../studio-intelligence-architecture.md) | Context source 11 |
| [relationship-memory.md](../relationship-memory.md) | Differentiation section |
| [documentation-registry](../documentation-registry.md) | Register taste cluster |
| CORE.md | Implementation path when code lands |

---

## Final Note

Founder Taste Engine™ is among the most important philosophy sprints in Studio OS because it answers the deepest product question:

> **What is Studio OS actually building toward?**

Not more features. Not more assets. **Understanding.**

The founder teaches through living their creative life inside the platform. Studio OS learns. Every company gets better because the founder was understood — not configured.

---

## Cross-References

- [README.md](./README.md)
- [founder-taste-engine.md](./founder-taste-engine.md)
- [world-integration.md](./world-integration.md)
- [Company Engine™](../philosophy/company-engine.md)
