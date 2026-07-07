# 10 — Memory System

**Engine Module:** `studio.critique-sessions.v1.memory-system`  
**Status:** Institutional creative memory  
**Philosophy:** Every critique becomes part of the company's institutional memory.

---

## Design Principle

> Future sessions should become **more personalized**. The system remembers how this founder thinks — not to manipulate, but to **respect creative judgment**.

---

## Memory Domains

| Domain | Tracks |
|--------|--------|
| **Founder Preferences** | Recurring approvals · rejections · style choices |
| **Successful Recommendations** | Advice founder accepted that improved outcomes |
| **Rejected Advice** | Advice founder declined — with rationale when available |
| **Creative Philosophy** | Emergent principles from decision patterns |
| **Decision Rationale** | Explicit founder reasoning per topic |
| **Debate Patterns** | Recurring tensions and how founder resolves them |
| **Session History** | Prior sessions on same subject · continuity |

---

## Memory Event Schema

```yaml
MemoryEvent:
  eventId: string
  sessionId: string
  timestamp: ISO8601
  eventType: enum
    # preference-signal | decision | rationale | debate-resolution | dismissed-advice | creative-philosophy

  subject:
    topic: string
    tags: string[]
    genomeFields: string[]

  signal:
    direction: enum                # prefer | avoid | neutral | context-dependent
    strength: number               # 0–1 confidence from repetition
    evidence: string[]             # session ids supporting signal

  content: string
  source: enum                     # founder-explicit | inferred-from-decisions | post-session-learning
```

---

## Preference Profile

Aggregated per company/founder:

```yaml
FounderPreferenceProfile:
  founderId: string
  companyId: string
  lastUpdated: ISO8601

  preferences:
    - topic: string                # e.g., "ceremony-weight", "cta-complexity", "motion-register"
      direction: enum
      strength: number
      rationale: string | null
      supportingSessions: string[]

  creativePhilosophy:
    emergentPrinciples: string[]   # e.g., "Beauty before clarity for returning users"
    confidence: number

  debateTendencies:
    - tensionPair: [AIRoleId, AIRoleId]
      typicalResolution: enum      # favors-first | favors-second | hybrid | context-dependent
      examples: string[]
```

---

## How Memory Personalizes Sessions

| Personalization | Example |
|-----------------|---------|
| Specialist emphasis | Marketing speaks shorter on CTA if founder consistently rejects simplification |
| Orb framing | "You typically prefer ceremony over clarity — Creative Director's point may resonate." |
| Debate prediction | Orb pre-names likely tension (Marketing vs Creative) |
| Recommendation filtering | Deprioritize advice matching repeatedly rejected patterns |
| Agenda suggestions | "Last Department Review surfaced pacing — include again?" |

**Rule:** Personalization **informs** · never **overrides** specialist honesty. Advisors still speak truthfully.

---

## Rejected Advice Archive

Rejected advice is **valuable**:

```yaml
RejectedAdviceRecord:
  sessionId: string
  roleId: AIRoleId
  recommendation: string
  founderRationale: string | null
  dismissedPermanent: boolean
  postLaunchOutcome: OutcomeAssessment | null   # filled by 11
```

Learning Engine (Validation Loop 10) receives shared events — single preference profile across engines.

---

## Creative Philosophy Emergence

System detects patterns after N similar decisions:

```
Sessions 1–3: Founder rejects CTA simplification (rationale: luxury audience)
Sessions 4–5: Founder rejects reduced ceremony
Session 6: System proposes emergent principle:

  "This founder prioritizes editorial luxury over conversion optimization
   for returning audience segments."

→ Stored in creativePhilosophy · surfaced to Braintrust briefing packages
→ May inform Company Genome update recommendations
```

Emergent principles require **3+ consistent signals** before promotion.

---

## Genome Integration

Memory may recommend Genome updates:

```yaml
GenomeUpdateRecommendation:
  source: critique-memory
  field: string                  # e.g., interactionPacing · ceremonyWeight
  currentValue: unknown
  suggestedValue: unknown
  evidence: MemoryEvent[]
  requiresFounderApproval: true
```

Genome changes never auto-apply from memory alone.

---

## Privacy and Scope

| Scope | Rule |
|-------|------|
| Per-company | Memory isolated by companyId |
| Per-founder | Preference profile per founder within company |
| Cross-company | **Never** — no learning from other founders' sessions |
| Marketplace | Anonymized pattern aggregates only (future · optional) |

---

## Memory Retention

| Data | Retention |
|------|-----------|
| Full transcripts | Indefinite · searchable |
| Preference signals | Indefinite · decay strength without reinforcement |
| Dismissed advice | Indefinite · for post-session learning |
| Inferred signals | Decay if contradicted by later decisions |

---

## Relationship to Validation Loop Learning Engine

| Critique Memory (10) | Validation Learning (10) |
|---------------------|-------------------------|
| Conversational preferences · rationale | Approval/rejection patterns · scorecard trends |
| Debate resolutions | Override patterns |
| Creative philosophy | Failed/successful validation patterns |

**Shared store:** `FounderPreferenceProfile` — both engines read/write.

---

_Next: [11 — Post Session Learning](./11_POST_SESSION_LEARNING.md)_
