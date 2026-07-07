# 01 — Session Overview

**Engine Module:** `studio.critique-sessions.v1.overview`  
**Status:** Canonical engine definition

---

## What Are Studio Critique Sessions™?

Studio Critique Sessions™ are **structured creative conversations** between the founder and Studio Intelligence — the collaborative review experience that makes important work better before it passes through approval gates.

> Not an approval screen. Not a scorecard. Not a checklist.

Every important Project, Department, Environment, Expansion, Campaign, Experience, or Marketplace Package should pass through **one or more Critique Sessions** before approval.

---

## Purpose

> Make work better through thoughtful, multi-perspective creative dialogue — while the founder retains final creative authority.

Critique Sessions exist because:

1. **Approval without conversation wastes intelligence** — Scorecards and gates answer *should this exist*; critique answers *how do we make this exceptional*
2. **Founders think in dialogue** — Elite creative companies debate before they decide
3. **Specialists see different truths** — Marketing, brand, engineering, and creative rarely agree — and shouldn't
4. **Decisions deserve memory** — Every founder choice becomes institutional knowledge
5. **Recommendations need execution paths** — Critique without workflow is performance
6. **Learning requires conversation context** — Why the founder rejected advice matters as much as what they approved

---

## Participants

| Participant | Role |
|-------------|------|
| **Founder** | Creative Director — final authority · can interrupt · redirect · decide |
| **Studio Orb™** | Moderator · triage · improvement surfacing · session routing |
| **AI Braintrust™** | Session-specific specialists (see 03) — invited only when relevant |
| **Session Recorder** | Captures decisions · action items · rationale (system subsystem) |

**Rule:** The founder is never a passive reviewer. They are the **Creative Director** at the table.

---

## Inputs

```yaml
CritiqueSessionInput:
  sessionType: CritiqueSessionType       # see 02
  subjectType: enum                    # project | department | environment | expansion | campaign | experience | marketplace-package | ai-recommendation
  subjectId: string
  subjectVersion: semver | null

  # Context
  companyGenome: CompanyGenomeSnapshot
  projectGenome: ProjectGenomeSnapshot | null
  creativeDirection: CreativeDirectionSnapshot | null
  founderNotes: FounderNotesSnapshot | null
  validationContext: ValidationContextSnapshot | null   # prior Scorecard · Braintrust report if exists

  # Artifacts under discussion
  artifacts:
    - artifactType: enum
      artifactId: string
      previewUrl: string | null
      runtimePreviewSessionId: string | null

  # Session config
  invitedSpecialists: AIRoleId[] | auto   # auto = Braintrust Model resolves
  priorSessionId: string | null          # continuation session
  founderAgenda: string[] | null          # optional topics founder wants covered
```

---

## Outputs

```yaml
CritiqueSessionOutput:
  sessionId: string
  sessionType: CritiqueSessionType
  status: enum                         # active | paused | completed | archived
  transcript: ConversationTranscript
  debateRecord: DebateRecord | null
  founderDecisions: FounderDecision[]
  actionItems: ActionItemBundle          # see 08
  revisionWorkflows: RevisionWorkflow[] | null
  memoryEvents: MemoryEvent[]
  suggestedNextSession: CritiqueSessionType | null
  validationHandoff: ValidationHandoff | null   # when ready for Validation Loop founder review
```

**Rule:** A completed session always produces an **Action Item Bundle** — even if the founder approves everything as-is (documented as explicit decisions).

---

## Lifecycle

```
REQUESTED
    ↓
ASSEMBLING (Braintrust Model selects specialists)
    ↓
BRIEFING (Orb + specialists receive context)
    ↓
CONVERSATION (natural dialogue · debate · founder interruption)
    ↓
┌─ PAUSED (founder requests break — state preserved)
└─ DECISIONING (founder records choices)
    ↓
ACTION_ITEMS (structured outputs generated)
    ↓
REVISION_ROUTING (optional — Production Engine · Generator · Concierge)
    ↓
MEMORY_PERSIST (institutional knowledge stored)
    ↓
COMPLETED → Validation Loop handoff OR next session scheduled
    ↓
POST_LAUNCH → Post Session Learning (11) when outcomes available
```

---

## Relationship Map

### Studio Validation Loop™

| Validation Loop | Critique Sessions |
|-----------------|-------------------|
| Determines if work **deserves to exist** | Determines how to **make work better** |
| Studio Scorecard™ (quantified dimensions) | Conversation (qualitative dialogue) |
| AI Braintrust (07) — independent async critique | Braintrust Model (03) — live conversational assembly |
| Founder Review (approval gate) | Founder Decisions (07) — dialogue-first |
| Revision Engine (09) — surgical regen | Revision Workflows (09) — routes work to Production |

**Integration:** Critique Sessions typically occur **before** Validation Loop Founder Review. Session outputs feed Scorecard context, Revision Engine scopes, and Learning Engine preference profiles.

**Not redundant:** Validation Loop Braintrust runs independent parallel critique for scoring. Critique Sessions run **conversational** multi-turn dialogue with founder participation.

### Company Genome™

Every session loads Genome snapshot. Brand Concierge and Experience Architect reference Genome pacing, voice, luxury register, and `thingsWeNeverDo`. Sessions that surface Genome drift generate Genome update recommendations.

### Creative Direction Studio™

Creative Direction Review sessions are the primary interface between CDS and production. Active direction strip, mood board, and timeline context load automatically. Approval in CDS may trigger Critique Session before Production unlock.

### Studio Production Engine™

Action items become structured work packages routed to department workspaces (Discover · Development · Production · Review · Marketing · Publishing · etc.). Revision Workflows (09) define handoff contracts.

### Founder Notes™

Voice transcripts, sketches, annotations, and rationale drops attach to session context. Founder can drop notes mid-session; specialists reference them in dialogue.

### Studio Orb™

Orb moderates debate, surfaces improvement options, routes founder commands, and maintains session continuity. Orb never overrides founder decisions.

---

## Critique vs Validation vs QA

| Dimension | QA | Validation Loop | Critique Sessions |
|-----------|-----|-----------------|-----------------|
| Question | Does it work? | Should it exist? | How do we make it better? |
| Format | Checklist | Pipeline + Scorecard | Conversation |
| Founder role | Observer | Approver | Creative Director |
| AI role | Automated checks | Independent critique | Colleagues at the table |
| Output | Pass/fail | Token + certification | Action items + memory |
| Consensus | N/A | Disagreement surfaced | Debate encouraged |

---

## Canonical Statement

> The founder should never feel judged. They should feel challenged, supported, inspired, and equipped to make better creative decisions.

Every session should make both the **project** and the **Company Genome™** smarter.

---

_Next: [02 — Session Types](./02_SESSION_TYPES.md)_
