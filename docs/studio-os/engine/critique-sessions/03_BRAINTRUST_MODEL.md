# 03 — Braintrust Model

**Engine Module:** `studio.critique-sessions.v1.braintrust-model`  
**Status:** Session specialist assembly system  
**Philosophy:** Invite only who belongs at this table.

---

## Design Principle

> Every session assembles the **correct specialists automatically**. Not every advisor reviews every subject. Relevance over roster size.

This differs from Validation Loop AI Braintrust (07), which runs **independent parallel critique** for scoring. Critique Sessions Braintrust is **conversational** — specialists speak in turn, respond to founder questions, and debate each other live.

---

## Specialist Roster

| Specialist | Role ID | Expertise |
|------------|---------|-----------|
| **Studio Orb™** | `studio-orb` | Moderation · triage · improvement surfacing · session continuity |
| **Creative Director™** | `creative-director` | Vision · strategic coherence · emotional impact |
| **Editorial Art Director™** | `editorial-art-director` | Composition · typography · editorial quality |
| **Brand Concierge™** | `brand-concierge` | Genome alignment · identity protection |
| **Marketing Concierge™** | `marketing-concierge` | Audience · CTA · campaign outcomes |
| **Growth Strategist™** | `growth-strategist` | Acquisition · retention · funnel impact |
| **Experience Architect™** | `experience-architect` | Journey · immersion · HQ fantasy |
| **UX Concierge™** | `ux-concierge` | Verb discoverability · friction · exploration |
| **Accessibility Concierge™** | `accessibility-concierge` | Usability · reduced motion · contrast · inclusion |
| **Motion Director™** | `motion-director` | Pacing · ceremony · idle aliveness |
| **Photography Director™** | `photography-director` | Lens · lighting · photographic register |
| **Legal Concierge™** | `legal-concierge` | Compliance · claims · risk |
| **Audio Director™** | `audio-director` | Sonic identity · spatial mix · silence |
| **Engineering Concierge™** | `engineering-concierge` | Feasibility · performance · implementation cost |
| **Marketplace Concierge™** | `marketplace-concierge` | Buyer trust · listing quality · certification |

---

## Assembly Protocol

```
1. Session type resolves default roster (02)
2. Subject type may add/remove specialists
3. Founder agenda may request additional specialists
4. Orb confirms roster with founder ("I've invited Creative Director, Brand Concierge, and Marketing Concierge. Add anyone?")
5. Founder may dismiss or add before session begins
6. Mid-session: founder may invite specialist ("Engineering, what would this cost?")
```

**Rule:** Maximum active speakers at table: **6** (including Orb). Overflow specialists remain on standby for founder invitation.

---

## Roster Resolution Matrix

| Subject Type | Always Include | Conditionally Include |
|--------------|----------------|----------------------|
| Department Package | Creative Director · Experience Architect · Brand · Engineering · Orb | Motion · Audio · Accessibility · Marketplace |
| Project | Creative Director · Strategy · Orb | Marketing · Editorial · Growth |
| Campaign | Marketing · Growth · Brand | Creative Director · Editorial |
| Marketplace Package | Marketplace · Brand · Engineering | Experience · Legal |
| Environment | Experience Architect · Creative Director · Motion · Audio | UX · Accessibility |
| AI Recommendation | Strategy · Creative Director · Brand | Engineering · Legal |

---

## Specialist Briefing Package

Each invited specialist receives before speaking:

```yaml
SpecialistBriefing:
  roleId: AIRoleId
  sessionType: CritiqueSessionType
  subjectSummary: string
  companyGenome: CompanyGenomeSnapshot
  relevantArtifacts: ArtifactRef[]
  priorSessionSummary: string | null
  founderPreferences: PreferenceHints | null    # from Memory System (10)
  validationContext: ScorecardSummary | null
  speakingOrder: number | null                  # null = respond when relevant
  constraints:
    - speakFromOwnPerspective: true
    - doNotRepeatOtherSpecialists: true
    - praiseBeforeCritique: encouraged
    - minimumOneImprovement: true
```

---

## Relationship to Validation Loop Braintrust

| Aspect | Validation Loop Braintrust (07) | Critique Sessions Braintrust (03) |
|--------|--------------------------------|-----------------------------------|
| Mode | Independent parallel | Conversational multi-turn |
| Founder | Receives report | Active participant |
| Output | BraintrustReport for Scorecard | Transcript + Decisions + Action Items |
| Disagreement | Aggregated in report | Live Debate Engine (06) |
| Timing | Pipeline stage | On-demand or pre-approval |

**Integration:** Validation Loop Braintrust report may **seed** Critique Session opening statements. Critique Session transcript may **enrich** Validation Loop Founder Review context.

---

## Orb as Permanent Seat

Studio Orb™ is present in **every** session type except explicit founder-only reflection mode.

| Orb Responsibility | Detail |
|--------------------|--------|
| Open session | Summarize subject · introduce roster |
| Moderate | Manage speaking turns · prevent pile-on |
| Surface options | "I've identified three possible improvements…" |
| Founder commands | Parse interrupt · redirect · invite · pause |
| Close session | Confirm decisions · preview action items |

Orb does **not** vote on recommendations. Orb **facilitates** founder judgment.

---

## On-Demand Specialist Invocation

Founder may invoke any roster member mid-session:

```
Founder: "Brand Concierge — does this feel like us?"
Founder: "Engineering — is this realistic for launch?"
Founder: "Accessibility — what are we missing?"
```

Invoked specialist receives full briefing package + conversation transcript to date.

---

## Schema

```yaml
SessionRoster:
  sessionId: string
  required: AIRoleId[]
  optional: AIRoleId[]
  active: AIRoleId[]              # currently at table (max 6)
  standby: AIRoleId[]
  founderOverrides:
    added: AIRoleId[]
    dismissed: AIRoleId[]
```

---

_Next: [04 — Conversation Engine](./04_CONVERSATION_ENGINE.md)_
