# Future Onboarding™

**Implementation phases · integration map · open questions**

---

## Purpose

Roadmap for implementing Adaptive Onboarding™ philosophy — without building UI or new engines in this sprint.

Defines phases, dependencies, integration points, and success validation.

---

## Implementation Principles

| Principle | Rule |
|-----------|------|
| **No new engine** | Orchestrate existing intelligence stack |
| **Evolve Mode System™** | Do not fork platform |
| **Conversation first** | UI follows philosophy — not reverse |
| **Docs before code** | This sprint is canon |
| **Golden Build discipline** | Production features gate on Certified™ path |

---

## Phase Map

### Phase 0 — Philosophy (Complete)

**This sprint.**

| Deliverable | Status |
|-------------|--------|
| `docs/studio-os/onboarding/` (8 documents) | ✅ |
| Cross-references to Mode System™ · Genome · Blueprint™ | ✅ |
| CORE.md · MEMORY.md update | Pending commit |

---

### Phase 1 — Conversation Layer

**Orb conversation without forms.**

| Work | Depends on |
|------|------------|
| Conversation state machine | Studio Intelligence™ · Model Orchestrator™ |
| Signal extraction pipeline | orb-conversation.md categories |
| Conversation persistence · resume | studio_os_workspace_state |
| Orb UI in HQ spatial context | Arrival Sequence™ · Living HQ shell |
| Reduced-motion instant path | Accessibility · Interaction Engine™ |

**Not in scope:** New chat engine · new LLM provider.

---

### Phase 2 — Mode Recommendation™

| Work | Depends on |
|------|------------|
| Signal scoring → Mode mapping | mode-recommendation-engine.md |
| Reasoning narrative generation | Studio Intelligence Layer |
| Accept · Choose · Why · Compare flows | Mode System™ docs |
| Mode DNA™ application on accept | Existing mode-dna.ts patterns |

**Migration note:** [orb-onboarding.md](../modes/orb-onboarding.md) deprecated for first entry — conversation replaces immediate mode grid.

---

### Phase 3 — Headquarters Preview™

| Work | Depends on |
|------|------------|
| Preview topology renderer | Headquarters Engine™ · Set registry |
| Mode-weighted Set introduction | headquarters-preview.md |
| Sample Transition™ (optional) | Transitions™ canon |
| Preview → active HQ handoff | Organization Inauguration™ |

---

### Phase 4 — Genome Initialization

| Work | Depends on |
|------|------------|
| Conversation → Genome field extractor | company-genome-initialization.md |
| Confidence scoring | Organization Genome™ store |
| Blueprint™ pre-fill integration | business-discovery-blueprint/ |
| Optional Orb reflection beat | Founder correction loop |

---

### Phase 5 — Adaptive Evolution™

| Work | Depends on |
|------|------------|
| Post-onboarding signal monitors | Pulse™ · Predictive Organization™ |
| Evolution suggestion engine | adaptive-evolution.md |
| Evolution Ceremony™ spatial UX | Mode Evolution™ · World Events™ |
| Snooze · dismiss · manual evolution | Founder controls |

---

### Phase 6 — Full Journey Integration

| Work | Depends on |
|------|------------|
| End-to-end: Conversation → Inauguration | All phases |
| Company Onboarding Intelligence™ alignment | M73.5 convergence |
| Arrival Experience™ M73.6 ceremony handoff | ENTER HEADQUARTERS |
| Documentation Registry™ registration | M126 |
| Alpha validation · founder journey test | docs/studio-os/alpha/ |

---

## Integration Map

```
┌──────────────────────────────────────────────────────────────────┐
│                    ADAPTIVE ONBOARDING™                          │
├──────────────────────────────────────────────────────────────────┤
│  Orb Conversation™                                               │
│       ↓ signals                                                  │
│  Mode Recommendation Engine™                                     │
│       ↓ Mode DNA™                                                │
│  Headquarters Preview™                                           │
│       ↓ topology intent                                          │
│  Company Genome™ Initialization                                  │
│       ↓ identity layer                                           │
├──────────────────────────────────────────────────────────────────┤
│  EXISTING SYSTEMS (no fork)                                      │
│  · Business Discovery Blueprint™                               │
│  · Organization Inauguration™                                    │
│  · Studio World™ · Sets™ · Transitions™                        │
│  · Organization Genome™ (M95)                                    │
│  · Mode System™ · Mode Evolution™                              │
│  · Studio Intelligence™ · Model Orchestrator™                  │
│  · Relationship Memory™ · Ambient Awareness™                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Updated Onboarding Order (Canonical)

| Step | System | Status |
|------|--------|--------|
| 1 | Arrival Sequence™ | Existing |
| 2 | **Adaptive Onboarding™ — Conversation** | New philosophy |
| 3 | **Mode Recommendation™** | Evolves Mode System™ |
| 4 | **Headquarters Preview™** | New beat |
| 5 | **Genome Initialization** | New path into M95 |
| 6 | Business Discovery Blueprint™ | Existing · inherits Genome |
| 7 | Organization Inauguration™ | Existing |
| 8 | ENTER HEADQUARTERS | Existing |

**Supersedes** modes/README.md order of "Mode → Blueprint → Inauguration" for first entry.

---

## Company Onboarding Intelligence™ (M73.5) Convergence

[M73.5 Company Onboarding Intelligence](../motherboard/CORE.md) covers broader welcome journeys including existing-company import.

| M73.5 path | Adaptive Onboarding™ role |
|------------|---------------------------|
| Create new company | Full Adaptive Onboarding™ flow |
| Bring existing company | Conversation adapts · "tell me about your business today" |
| Both converge | Same Genome · Blueprint · Inauguration |

No duplication — M73.5 orchestrates · Adaptive Onboarding™ defines first-conversation philosophy.

---

## Open Questions

| Question | Options | Decision needed |
|----------|---------|-----------------|
| Minimum conversation length before recommendation | 3 signals vs time-based | Founder research |
| Low-confidence default Mode | Entrepreneur vs ask one more question | Product |
| Genome reflection beat | Optional vs recommended | UX research |
| Preview interactivity level | Tour-only vs clickable Sets | Golden Build |
| Evolution suggestion frequency cap | Max 1 per 30 days | Cognitive load policy |
| Holding Company Mode timing | Phase 5 vs future-modes | Architecture |

---

## Success Validation

| Test | Pass criteria |
|------|---------------|
| Founder sentiment | "Hired executive team" not "completed setup" |
| Duplicate entry audit | Zero Genome/Blueprint duplicate questions |
| Mode acceptance | >60% accept recommendation OR informed override |
| Time to HQ Preview | <10 minutes conversational (target) |
| Evolution suggestion quality | Founders rate reasoning helpful |
| Accessibility | Reduced-motion path complete |

---

## Documentation Updates Required (Future)

When implementation begins:

| Document | Update |
|----------|--------|
| [modes/README.md](../modes/README.md) | Cross-reference Adaptive Onboarding™ |
| [modes/orb-onboarding.md](../modes/orb-onboarding.md) | Mark V1 superseded for first entry |
| [modes/mode-system.md](../modes/mode-system.md) | Insert conversation phase in flow |
| [business-discovery-blueprint.md](../business-discovery-blueprint.md) | Genome inheritance section |
| [documentation-registry](../documentation-registry.md) | Register onboarding cluster |
| [alpha/founder-journey.md](../alpha/founder-journey.md) | Update journey map |

---

## What This Sprint Did NOT Do

| Excluded | Reason |
|----------|--------|
| React components | User instruction |
| UI implementation | Philosophy sprint |
| New engines | Platform freeze |
| Mode System™ code changes | Docs evolution only |
| Blueprint™ code changes | Docs evolution only |

---

## Final Note

Adaptive Onboarding™ is the bridge between:

- **Mode System™** — *how* you build
- **Company Engine™** — *what* Studio OS exists to do
- **Founder Experience™** — *how* it should feel

When implementation ships, the founder's first minutes in Studio OS should forever feel like **the first meeting with their future executive team**.

---

## Cross-References

- [README.md](./README.md)
- [adaptive-onboarding.md](./adaptive-onboarding.md)
- [Mode System™](../modes/README.md)
- [Company Engine™](../philosophy/company-engine.md)
- [alpha/founder-journey.md](../alpha/founder-journey.md)
