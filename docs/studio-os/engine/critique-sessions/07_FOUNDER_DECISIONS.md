# 07 — Founder Decisions

**Engine Module:** `studio.critique-sessions.v1.founder-decisions`  
**Status:** Founder authority and decision capture  
**Philosophy:** The founder always has final authority.

---

## Design Principle

> The founder is the **Creative Director**. Every decision — approve, reject, redirect, branch — becomes **institutional knowledge**.

The founder should never feel judged. They should feel **equipped** to decide.

---

## Founder Powers (During Any Session)

| Power | Description | Recorded As |
|-------|-------------|-------------|
| **Approve recommendation** | Accept specialist advice | `decision: approved` |
| **Reject recommendation** | Decline with optional rationale | `decision: rejected` |
| **Ask for alternatives** | Request more options before deciding | `decision: pending-alternatives` |
| **Request evidence** | Demand artifact · data · Genome citation | `decision: evidence-requested` |
| **Create branch** | Experimental path alongside main direction | `decision: branched` |
| **Pause discussion** | Session → PAUSED | `decision: session-paused` |
| **Assign follow-up** | Route work to specialist · department · Concierge | `decision: assigned` |
| **Record rationale** | Explicit reasoning for institutional memory | `rationale: string` |
| **Override all** | "We're proceeding as-is" — ends debate | `decision: proceed-unchanged` |
| **Schedule next session** | Defer remaining topics | `decision: deferred` |

---

## Decision Capture Schema

```yaml
FounderDecision:
  decisionId: string
  sessionId: string
  timestamp: ISO8601

  subject:
    type: enum                   # recommendation | debate | action-item | open-question
    referenceId: string
    summary: string

  decision: enum
    # approved | rejected | modified | branched | deferred | proceed-unchanged | assigned | pending-alternatives

  rationale: string | null       # founder voice — encouraged
  rationaleSource: enum            # voice | text | orb-transcript | implicit

  recommendation:
    fromRole: AIRoleId
    originalSuggestion: string
    modifiedSuggestion: string | null

  downstreamEffects:
    - productionUnlock: boolean | null
    - revisionRequired: boolean
    - departmentImpacted: string[]
    - validationHandoff: boolean

  memoryTags: string[]           # for Memory System (10)
```

---

## Decision Modes

### Inline (During Conversation)

Founder speaks decision naturally:

> "Approved. Let's do the dual-path entry Engineering suggested."

Orb confirms and records:

> "Recorded — approved Engineering's dual-path entry. I'll add that to action items."

### Explicit (Decisioning Phase)

Orb prompts structured decisioning for unresolved recommendations:

```
Orb: "Three recommendations remain open:
  1. Creative Director — add focal point to arrival zone
  2. Brand Concierge — slow interaction pacing to Genome spec
  3. Marketing — strengthen CTA on first zone

  How would you like to proceed on each?"
```

### Batch (Rapid Sessions)

Founder may approve/reject multiple items in one statement. Orb parses and confirms each.

---

## Rationale as Institutional Memory

Every decision **should** invite rationale — never require:

```
Orb: "You rejected Marketing's CTA simplification. Want to record why? This helps future sessions."

Founder: [voice] "Our audience is returning luxury clients. They don't need hand-holding."

→ Stored in Memory System · tagged preference: cta-complexity-tolerance-high
```

Rationale may come from:
- Live voice (Founder Notes integration)
- Typed text
- Orb-transcribed founder speech
- Implicit (system infers from pattern if founder skips)

---

## Branch Decisions

When founder creates experimental branch:

```yaml
BranchDecision:
  parentDecisionId: string
  branchName: string
  branchScope: string
  hypothesis: string
  successCriteria: string[]
  mergePolicy: enum              # founder-decides | auto-if-metrics | never-merge
```

Branches route to Revision Workflows (09) as `branch-into-experiment`.

---

## Relationship to Validation Loop Founder Override

| System | Scope |
|--------|-------|
| Critique Sessions Founder Decisions (07) | Dialogue-first · improvement-focused |
| Validation Loop Founder Override (12) | Approval gate · may approve/reject despite Scorecard |

Critique decisions may **inform** Validation Override rationale. Both feed shared founder preference profiles.

---

## Decision Quality Gates

Before session completes:

- [ ] All material recommendations have founder decision OR explicit deferral
- [ ] Deferred items appear in Action Items open questions (08)
- [ ] Branches have named scope and success criteria
- [ ] Rationale captured for rejected advice (encouraged · not blocking)

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| AI records decision founder didn't make | Violates authority |
| Default approve on timeout | Founder must explicitly decide or defer |
| Shame language on rejection | "You ignored best practice" |
| Re-litigate decided items in same session | Orb redirects to recorded decision |

---

_Next: [08 — Action Items](./08_ACTION_ITEMS.md)_
