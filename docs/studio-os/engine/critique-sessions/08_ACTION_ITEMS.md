# 08 — Action Items

**Engine Module:** `studio.critique-sessions.v1.action-items`  
**Status:** Session output bundle  
**Philosophy:** Nothing should be lost.

---

## Design Principle

> At the end of every session, generate a structured **Action Item Bundle** — decisions made, open questions, revisions, assignments, dependencies, and next session recommendation.

Even a session where the founder approves everything produces explicit documentation.

---

## Action Item Bundle Schema

```yaml
ActionItemBundle:
  sessionId: string
  generatedAt: ISO8601
  sessionType: CritiqueSessionType
  subjectId: string

  decisionsMade: FounderDecisionSummary[]
  openQuestions: OpenQuestion[]
  recommendedRevisions: RecommendedRevision[]
  assignedSpecialists: Assignment[]
  departmentsImpacted: DepartmentImpact[]
  estimatedEffort: EffortEstimate[]
  dependencies: Dependency[]
  suggestedNextSession: NextSessionSuggestion | null

  orbClosingSummary: string      # natural language recap for founder
```

---

## Bundle Components

### Decisions Made

```yaml
FounderDecisionSummary:
  decisionId: string
  summary: string                # one-line human readable
  decision: enum
  rationale: string | null
  fromRecommendation: string | null
```

### Open Questions

```yaml
OpenQuestion:
  questionId: string
  question: string
  raisedBy: AIRoleId | founder
  priority: enum                 # blocking | important | exploratory
  suggestedResolver: AIRoleId | department | founder
  dueBy: ISO8601 | null
```

**Rule:** Unresolved debates tabled by founder become open questions — never silently dropped.

### Recommended Revisions

```yaml
RecommendedRevision:
  revisionId: string
  title: string
  description: string
  sourceRole: AIRoleId
  founderDecision: enum          # approved | rejected | modified | pending
  revisionScope: RevisionScope   # links to Validation Loop 09 + Generator 14
  targetArtifact: string | null
  priority: enum                 # critical | high | medium | low
```

### Assigned Specialists

```yaml
Assignment:
  assignmentId: string
  assigneeType: enum             # ai-specialist | concierge | department | founder
  assigneeId: string
  task: string
  context: string
  dueBy: ISO8601 | null
  status: enum                   # pending | in-progress | complete
```

### Departments Impacted

```yaml
DepartmentImpact:
  departmentId: string
  impactType: enum               # direction-change | asset-revision · workflow · unlock · block
  summary: string
  productionEngineRoute: string | null
```

### Estimated Effort

```yaml
EffortEstimate:
  revisionId: string | null
  estimate: string               # "2 hours" · "1 day" · "sprint"
  confidence: enum               # high | medium | low
  estimatedBy: AIRoleId          # typically Engineering Concierge
```

### Dependencies

```yaml
Dependency:
  dependentItemId: string
  dependsOnItemId: string
  dependencyType: enum           # blocks · informs · parallel
  notes: string | null
```

### Suggested Next Session

```yaml
NextSessionSuggestion:
  sessionType: CritiqueSessionType
  reason: string
  suggestedWhen: enum            # immediately | after-revisions | pre-launch | post-launch-30d
  prerequisites: string[]
```

---

## Generation Protocol

```
1. Session enters DECISIONING phase
2. Orb prompts founder for any remaining decisions
3. Action Item Generator aggregates:
   - All Founder Decisions (07)
   - Unresolved Open Questions from transcript
   - Approved revisions → Recommended Revisions
   - Rejected revisions → logged in Memory (not in revision list)
   - Engineering estimates for approved revisions
   - Production Engine department routing
4. Orb presents bundle summary in natural language
5. Founder confirms or edits bundle
6. Bundle persisted · triggers Revision Workflows (09) if applicable
```

---

## Example Closing Summary (Orb)

> "Here's what we captured:
>
> **Decisions:** You approved the dual-path entry and rejected CTA simplification. You asked Brand to slow interaction pacing.
>
> **Revisions:** Three items — focal point in arrival zone, Genome pacing adjustment, Mood Wall saturation tweak. Engineering estimates lighting-path fixes at ~2 hours; focal point asset regen at ~4 hours.
>
> **Open question:** Whether to run a Marketing Review before launch — you deferred until Production completes.
>
> **Next session:** Experience Review after Runtime preview is ready.
>
> Nothing lost. Ready to route revisions?"

---

## Nothing Lost Guarantee

| Artifact | Persistence |
|----------|-------------|
| Full transcript | Conversation Engine store |
| Debate records | Debate Engine store |
| Founder decisions | Decision store + Memory System |
| Action item bundle | Session output + Production Engine handoff |
| Rejected advice | Memory System (valuable for learning) |
| Rationale | Memory System + optional Founder Notes |

---

## Integration Points

| Consumer | Uses Action Items For |
|----------|----------------------|
| Revision Workflows (09) | Route approved revisions |
| Validation Loop | Founder Review context |
| Production Engine | Department work packages |
| Learning Engine | Pattern extraction |
| Studio Orb | Follow-up reminders |

---

_Next: [09 — Revision Workflows](./09_REVISION_WORKFLOWS.md)_
