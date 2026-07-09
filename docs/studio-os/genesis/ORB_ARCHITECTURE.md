# Genesis Orb™ — Architecture Guide

**Blueprint:** `genesis/articles/ORB.md`  
**Content home:** `genesis/orb/`  
**Program:** Studio OS Launch Stack™ — Stack 2  
**Status:** Architecture approved; runtime implemented (Launch Stack Stack 2)

---

## Purpose

Orb™ is Studio OS's Executive Intelligence Layer.

Orb is **not** an AI chatbot and **not** a floating assistant. Orb is the founder's permanent executive partner: an elite Chief of Staff with institutional memory, company context, strategic judgment, creative taste, operational awareness, and calm executive presence.

---

## Core promise

```text
Orb knows who the founder is.
Orb knows which company is active.
Orb remembers what matters.
Orb explains what changed.
Orb recommends what to do next.
Orb routes action safely.
Orb stays quiet when silence is better.
```

---

## Responsibilities

- Executive Advisor™
- Chief Strategist™
- Creative Director™
- Operations Advisor™
- Research Partner™
- Knowledge Guide™
- Project Manager™
- Mission Coordinator™
- Learning Mentor™
- Business Architect™
- Systems Thinker™
- Memory Keeper™

---

## Experience states

| State | Behavior |
|-------|----------|
| Arrival | Resolve context, greet, orient, recommend path |
| Idle | Present, quiet, ambient |
| Listening | Founder-invoked intent capture |
| Thinking | Transparent context retrieval and reasoning |
| Recommendation | Evidence, confidence, alternatives, tradeoffs |
| Mission planning | Founder intent → mission draft |
| Decision support | Options, risks, reversibility, stakeholders |
| Knowledge retrieval | Source-backed answers |
| Creative collaboration | Taste-aware critique and direction |
| Focus guard | Suppress noise during deep work |
| Command drafting | Prepare safe handoff to Command Center™ |

---

## Context model

Orb assembles an `OrbContextBundle` from:

- Founder context
- Identity context
- Company context
- Project context
- Mission context
- Creative context
- Department context
- Conversation history
- Knowledge history
- Company Genome™
- Calendar
- Files
- Blueprints
- Research
- Permissions
- Environment / room

Context priority:

| Priority | Context |
|----------|---------|
| P0 | Permissions, safety, company boundary, active command/approval |
| P1 | Founder request, active room, active company, active mission |
| P2 | Current project, recent conversation, company pulse |
| P3 | Long-term memory, canonical knowledge, historical decisions |
| P4 | Suggestions, discoveries, learning opportunities |

---

## Memory hierarchy

| Memory | Retention |
|--------|-----------|
| Short-term memory | Session / minutes |
| Working memory | Until task, room, mission, or project resolves |
| Long-term memory | Indefinite unless corrected/deleted |
| Canonical memory | Never forgotten unless superseded |
| Company memory | Life of company |
| Founder memory | Founder-controlled; export/delete |
| Creative memory | Project/company lifecycle |
| Learning memory | Until no longer useful or reset |
| Archived memory | Searchable with provenance |

Orb must never forget founder-approved canonical company facts, Company Genome™ decisions, permanent operating principles, legal/compliance constraints, canonical brand/taste decisions, founder corrections to Orb behavior, explicit "do not do this again" preferences, major strategic decisions, and promises made by Studio OS or Orb.

---

## Recommendation engine

Recommendations are decision drafts, not commands.

Every recommendation includes:

- Recommendation
- Why now
- Evidence
- Confidence
- Alternatives
- Tradeoffs
- Risks
- Source systems
- Required permission if action-bearing
- Reversibility if decision-bearing
- Founder override path

Confidence combines source reliability, recency, context completeness, historical outcomes, founder preference fit, Company Genome™ alignment, risk, reversibility, and permission clarity.

---

## Proactive behavior

Orb may interrupt only for material risk, deadlines, meeting preparation, mission blockers needing founder authority, pending approvals, stale/contradictory information, or company-boundary/permission issues.

Orb remains silent during deep focus, low-confidence insights, non-actionable events, recently dismissed prompts, and moments where the room already communicates the needed context.

---

## System relationships

```text
Orb™
  ↓ interprets
Company Genome™
  ↓ validates canon with
Institute of Knowledge™
  ↓ retrieves truth from
Knowledge Core™
  ↓ coordinates work through
Mission Engine™
  ↓ routes safe action into
Command Center™
  ↓ lives inside
Executive Headquarters™
  ↓ collaborates with
Content Engine™
  ↓ creates through
Studio Foundry™
  ↓ navigates by
Atlas™
```

---

## Implementation posture

Stack 2 v1 may use projection adapters:

- `OrbFounderContextProjection`
- `OrbCompanyContextProjection`
- `OrbMissionContextProjection`
- `OrbKnowledgeContextProjection`
- `OrbMemoryProjection`
- `OrbRecommendationProjection`
- `OrbBriefingProjection`
- `OrbAttentionProjection`

Each projection must name its future owning system and replacement plan.

Orb may cache summaries and pointers for interaction quality. Orb must not become the source of truth for missions, knowledge, company data, files, permissions, or commands.
