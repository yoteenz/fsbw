# 07 — AI Braintrust™

**Engine Module:** `studio.validation-loop.v1.ai-braintrust`  
**Status:** Independent multi-specialist critique system  
**Philosophy:** Thoughtful critique — not consensus.

---

## Design Principle

> Before founder review, multiple AI specialists critique the work **independently**. They praise strengths, identify weaknesses, suggest improvements, challenge assumptions, recommend alternatives, and **disagree respectfully** when appropriate.

The goal is **better work** — not unanimous approval.

---

## Braintrust Roster

| Specialist | Critique Focus |
|------------|----------------|
| **Creative Director™** | Strategic creative coherence · direction alignment |
| **Editorial Art Director™** | Composition · typography · editorial quality |
| **Brand Concierge™** | Genome alignment · brand personality |
| **Marketing Concierge™** | Campaign readiness · audience resonance |
| **Accessibility Concierge™** | Reduced motion · audio · contrast · verb alternatives |
| **UX Concierge™** | Verb discoverability · friction · exploration |
| **Motion Director™** | Pacing · ceremony weight · idle aliveness |
| **Audio Director™** | Sonic identity · spatial mix · silence rules |
| **Experience Architect™** | Journey · immersion · HQ fantasy |
| **Strategy Concierge™** | Business purpose · department ROI · maturity fit |

Roster adapts per artifact type — not all specialists review every artifact.

---

## Review Protocol

```
1. Each specialist receives: Runtime preview · Scorecard draft inputs · Genome snapshot · Creative Direction (if applicable)
2. Independent critique — no shared draft before submission
3. Structured output per specialist
4. Braintrust Orchestrator aggregates — highlights agreement AND disagreement
5. Founder receives: strengths summary · conflicts · recommended actions
```

**Duration:** Parallel execution. No serial bottleneck.

---

## Specialist Output Schema

```yaml
BraintrustCritique:
  roleId: AIRoleId
  displayName: string
  overallSentiment: enum           # strong | adequate | concerned | critical
  strengths: string[]              # minimum 2 if pass-leaning
  weaknesses: string[]             # minimum 1 always
  improvements: ImprovementSuggestion[]
  assumptionsChallenged: string[]
  alternatives: Alternative[]
  disagreementsWith:               # respectful dissent
    - roleId: AIRoleId
      topic: string
      myPosition: string
      theirLikelyPosition: string
  scoreRecommendation: number      # 0–100 for their domain
  passRecommendation: boolean      # advisory — not binding
```

---

## Artifact Roster Profiles

| Artifact Type | Required Specialists |
|---------------|---------------------|
| Department Package | All 10 |
| Single asset | Editorial Art Director · Brand Concierge · Motion/Audio (if applicable) |
| AI recommendation | Strategy · Brand · Creative Director |
| Workflow | Experience Architect · UX · Strategy |
| Marketplace listing | Brand · Experience · Accessibility · Performance |

---

## Disagreement Is Valuable

| Example Disagreement | Value |
|---------------------|-------|
| Creative Director loves mood · Brand Concierge flags Genome drift | Surfaces tension founder must resolve |
| Motion Director wants slower ceremony · UX Concierge wants snappier | Informs founder preference |
| Marketing Concierge wants bolder · Editorial Art Director wants restraint | Creative judgment call |

Braintrust Orchestrator **never suppresses** respectful disagreement.

---

## Braintrust Report Schema

```yaml
BraintrustReport:
  validationId: string
  critiques: BraintrustCritique[]
  consensusStrengths: string[]
  consensusWeaknesses: string[]
  activeDisagreements: Disagreement[]
  recommendedRevisions: RevisionSuggestion[]    # prioritized
  advisoryPass: boolean                         # majority advisory
  founderSummary: string                          # Chief Concierge synthesized brief
```

---

## Relationship to Concierge Layer

Chief Concierge synthesizes Braintrust into **Founder Brief** before founder review — not six separate panels. Founder sees unified critique with disagreement highlights.

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| Single AI summary only | Independent critiques |
| Unanimous rubber-stamp | Document disagreements |
| Braintrust after founder | Braintrust before founder |
| Auto-reject on one critical | Advisory + founder gate |
| Consensus required to proceed | Proceed to founder with conflicts visible |

---

_Next: [08 — Scorecard System](./08_SCORECARD_SYSTEM.md)_
