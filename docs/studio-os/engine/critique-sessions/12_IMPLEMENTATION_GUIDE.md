# 12 — Implementation Guide

**Engine Module:** `studio.critique-sessions.v1.implementation`  
**Status:** Abstract engineering roadmap  
**Philosophy:** Architecture only. No production code in this sprint.

---

## Implementation Scope

Studio Critique Sessions™ is a **platform subsystem** — orchestration, dialogue, debate, memory, and workflow routing services. **Not** a React approval screen.

---

## Recommended Subsystems

| Subsystem | Responsibility | Validates Against |
|-----------|----------------|-----------------|
| `SessionOrchestrator` | Lifecycle state machine · session types | 01, 02 |
| `BraintrustAssembler` | Roster resolution · briefing packages | 03 |
| `ConversationEngine` | Turn-taking · natural dialogue · founder interrupt | 04 |
| `RoleBehaviorRegistry` | Specialist personalities · collision avoidance | 05 |
| `DebateCoordinator` | Conflict detection · Orb moderation | 06 |
| `DecisionRecorder` | Founder decisions · rationale capture | 07 |
| `ActionItemGenerator` | Bundle assembly · nothing-lost guarantee | 08 |
| `RevisionRouter` | Production Engine · Generator · Compiler handoff | 09 |
| `CritiqueMemoryStore` | Preferences · philosophy · rejected advice | 10 |
| `OutcomeAnalyzer` | Post-launch recommendation assessment | 11 |
| `OrbSessionAdapter` | Founder commands · session routing via Orb | 01, 04 |

---

## Suggested Build Phases

### Phase 1 — Session Foundation

| Deliverable | Milestone |
|-------------|-----------|
| Session state machine | REQUESTED → COMPLETED lifecycle |
| Session type registry | 11 types from 02 |
| Basic roster assembly | 3 specialists + Orb |
| Transcript storage | ConversationTurn persistence |
| Action Item Bundle (minimal) | Decisions + open questions |

**Milestone:** Founder can complete a Rapid Creative Direction Review with recorded transcript and action items.

### Phase 2 — Conversation Quality

| Deliverable | Milestone |
|-------------|-----------|
| Natural dialogue generation | Anti-comment-thread enforcement |
| Founder interrupt handling | Pause · redirect · question modes |
| Role Behavior Registry | 15 specialist profiles |
| Debate Engine | Live disagreement with Orb moderation |
| Decision Recorder | Inline + explicit decisioning |

**Milestone:** Session feels like colleagues at a table — not a feedback form.

### Phase 3 — Execution Integration

| Deliverable | Milestone |
|-------------|-----------|
| Revision Router | Production Engine work packages |
| Generator/Compiler scope handoff | Surgical regen triggers |
| Validation Loop handoff | Pre-founder-review session scheduling |
| Concierge assignment workflow | Async follow-through |
| Branch experiment routing | Sandbox isolation |

**Milestone:** Approved revision from session triggers scoped regen in Generator/Compiler.

### Phase 4 — Memory and Learning

| Deliverable | Milestone |
|-------------|-----------|
| Critique Memory Store | Preference profile · rejected advice archive |
| Session personalization | Briefing hints from memory |
| Outcome Analyzer | Post-launch assessment pipeline |
| Validation Learning sync | Shared FounderPreferenceProfile |
| Project Retrospective automation | 30/90d scheduled sessions |

**Milestone:** Third session on same subject demonstrably personalized.

### Phase 5 — Full Platform Integration

| Deliverable | Milestone |
|-------------|-----------|
| Orb as primary entry | "Start a critique" natural language |
| CDS integration | Creative Direction Review native |
| Marketplace pre-publish session | Certification Review mandatory |
| Department Review chain | Multi-session sequences |
| Analytics dashboard (internal) | Recommendation effectiveness metrics |

**Milestone:** Every department package passes Critique Session before Validation Loop Founder Review.

---

## Service Boundaries

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (future — not this sprint)            │
│  Immersive session room · Orb interface · NOT dashboard   │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  CRITIQUE SESSIONS API (this engine)                      │
│  SessionOrchestrator · ConversationEngine · DebateEngine  │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Production   │ Validation   │ Generator/   │ Memory /     │
│ Engine       │ Loop         │ Compiler     │ Learning     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Law:** Presentation layer renders conversation — business logic lives in engine services.

---

## API Surface (Abstract)

```yaml
CritiqueSessionsAPI:
  sessions:
    - POST /sessions                    # create session
    - GET  /sessions/{id}               # session state + transcript
    - POST /sessions/{id}/interrupt     # founder message
    - POST /sessions/{id}/pause
    - POST /sessions/{id}/resume
    - POST /sessions/{id}/decide        # record founder decision
    - POST /sessions/{id}/complete      # generate action items

  workflows:
    - POST /workflows                   # route revision from action item
    - GET  /workflows/{id}              # workflow status

  memory:
    - GET  /memory/preferences          # founder preference profile
    - GET  /memory/sessions/{subjectId} # prior session history

  learning:
    - POST /learning/assess             # trigger outcome assessment
    - GET  /learning/assessments/{sessionId}
```

---

## Data Stores

| Store | Contents |
|-------|----------|
| `critique_sessions` | Session metadata · status · type |
| `critique_transcripts` | ConversationTurn[] |
| `critique_debates` | DebateRecord[] |
| `critique_decisions` | FounderDecision[] |
| `critique_action_items` | ActionItemBundle |
| `critique_workflows` | RevisionWorkflow[] |
| `critique_memory` | MemoryEvent[] · FounderPreferenceProfile |
| `critique_outcomes` | OutcomeAssessment[] |

---

## Integration Contracts

### Studio Validation Loop™

```yaml
ValidationHandoff:
  sessionId: string
  actionItemBundleId: string
  founderDecisionsSummary: string
  recommendedForValidationReview: boolean
  scorecardContext: object | null
```

Validation Loop Founder Review receives handoff as enriched context — not replacement for approval gate.

### Studio Production Engine™

```yaml
WorkPackageRequest:
  workflowId: string
  projectId: string
  departmentDestination: string
  package: ProductionEngineHandoff
```

### Studio Orb™

Orb routes natural-language intents:

| Intent | Action |
|--------|--------|
| "Critique this department" | Create Department Review session |
| "What did we decide last time?" | Load memory + prior transcript summary |
| "Schedule retrospective" | Create Project Retrospective · 30d |
| "Apply that revision" | Trigger RevisionWorkflow apply-immediately |

### Founder Notes™

Voice drops during session attach to transcript as `FounderDecision.rationaleSource: voice`.

---

## Non-Goals (This Sprint)

| Non-Goal | Owner |
|----------|-------|
| React critique UI | Future presentation layer |
| Real-time voice synthesis | Future immersive experience |
| Replacing Validation Loop | Complementary subsystem |
| Auto-applying revisions without founder disposition | Forbidden |

---

## Success Criteria (Engine Complete)

1. Any subject type can schedule appropriate session type
2. Conversation passes anti-comment-thread quality gate
3. Debate activates on material conflict · Orb moderates · founder resolves
4. Every completed session produces Action Item Bundle
5. Approved revisions route to Production Engine or Generator/Compiler
6. Memory personalizes third session on same subject
7. Post-launch outcome assessment runs for launched projects
8. Validation Loop receives handoff before Founder Review

---

## Schema Namespace

```
studio.critique-sessions.v1
├── session
├── session-type
├── conversation-turn
├── debate-record
├── founder-decision
├── action-item-bundle
├── revision-workflow
├── memory-event
├── preference-profile
└── outcome-assessment
```

---

## Canonical Statement

> Studio Critique Sessions™ should feel like gathering the leadership team of an elite creative company before making an important decision.

Engineering builds the **conversation infrastructure** — the immersive room comes later.

---

_End of Studio Critique Sessions™ Engine Specification._
