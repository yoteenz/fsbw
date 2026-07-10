# Spatial Architecture Review Engine™

## Constitutional Design Enforcement

**Status:** Permanent governance protocol — Studio OS Bible  
**Version:** 1.0.0  
**Date:** July 2026  
**Authority:** Enforces [The Spatial Computing Philosophy™](./THE_SPATIAL_COMPUTING_PHILOSOPHY.md) before any Studio OS implementation begins  
**Sprint:** COMPOSER — Spatial Architecture Review Engine™

---

> *This is not a coding sprint. This is not a UI sprint. This is an architectural governance sprint.*
>
> *Every implementation inside Studio OS must pass a Spatial Architecture Review before code generation begins.*
>
> *Composer should stop behaving like an engineer receiving feature requests. Composer should behave like the **Chief Architect of Studio World**.*

**Implements:** [The Spatial Computing Philosophy™](./THE_SPATIAL_COMPUTING_PHILOSOPHY.md) · [Studio World Bible™](../docs/studio-os/STUDIO_WORLD_BIBLE.md) · [Foundation Sprint](../docs/studio-os/foundation-sprint/README.md)

**Future subsystem:** This protocol will become a Studio OS governance module — Genesis pauses implementation when spatial placement cannot be justified.

---

## Table of Contents

1. [Mission](#mission)
2. [Composer Workflow](#composer-workflow)
3. [When Review Applies](#when-review-applies)
4. [Automatic Review Questions](#automatic-review-questions)
5. [Genesis Review](#genesis-review)
6. [World Review](#world-review)
7. [Design Review Output](#design-review-output)
8. [Red Flags — Automatic Rejection](#red-flags--automatic-rejection)
9. [Design Score](#design-score)
10. [Review Output Template](#review-output-template)
11. [Approval Gate](#approval-gate)
12. [Long-Term Vision](#long-term-vision)
13. [Integration with Planning Prompts](#integration-with-planning-prompts)
14. [Relationship to Other Canon](#relationship-to-other-canon)

---

## Mission

Every implementation inside Studio OS must pass a **Spatial Architecture Review** before code generation begins.

| Old Composer behavior | Required Composer behavior |
|-----------------------|----------------------------|
| Receives feature request → writes code | Receives request → **reviews as Chief Architect** → places in world → approves architecture → then implements |
| Optimizes for shipping fast | Optimizes for **spatial integrity** |
| Adds pages and utilities | Adds **places and departments** |
| Connects Genesis by default | Connects Genesis **with purpose** |

**Law:** Code must **never** be generated before the review completes and architecture is approved — by the founder for significant scope, or by self-certification for minor placement-aligned work within an approved department.

---

## Composer Workflow

Every new Studio OS request enters **Design Review first**.

```
Feature Request
        ↓
Spatial Architecture Review
        ↓
World Placement
        ↓
Department Assignment
        ↓
Genesis Integration Review
        ↓
Experience Review
        ↓
Architecture Approval
        ↓
Implementation
```

### Stage definitions

| Stage | Question answered | Output |
|-------|-------------------|--------|
| **Spatial Architecture Review** | Does this belong in Studio World at all? | Proceed / redesign / reject |
| **World Placement** | Where exactly does it live? | Building · wing · floor · room |
| **Department Assignment** | Who owns and operates it? | Department + executive role |
| **Genesis Integration Review** | How does consciousness interact? | Initiate · observe · coordinate · present · ignore |
| **Experience Review** | What is the founder actually doing? | Event · journey · emotional target |
| **Architecture Approval** | Is placement justified and scored? | Approved review artifact |
| **Implementation** | Build within approved boundaries | Code · docs · graph nodes |

**Hard stop:** If any stage fails, **implementation does not begin**. Redesign or defer.

---

## When Review Applies

### Review required (always before code)

- New Studio OS modules or admin pages
- New capabilities, workflows, or navigation entries
- Genesis or Orb integration changes
- Cross-department features
- Company-scoped routes and headquarters expansions
- Marketing-facing Studio OS surfaces
- Architecture sprints and roadmap items

### Review skipped (unless founder explicitly requests)

- **P0 hotfixes** — restore broken production path
- **Forensic / debugging sprints** — prove root cause; trace failures
- **Bug fixes** within an already-placed department (no new surface, no new nav, no new Genesis behavior)
- **Docs-only sprints** that do not introduce new product surfaces
- **Explicit founder override** — "skip spatial review for this sprint"

When skipping, state: **`Spatial Architecture Review: SKIPPED — [reason]`** in the sprint header so future agents know placement was not re-evaluated.

---

## Automatic Review Questions

Composer must answer **all ten questions** before writing any Studio OS implementation code.

| # | Question | Pass criterion |
|---|----------|----------------|
| 1 | **Where does this live inside Studio World?** | Named place on map / in World Graph |
| 2 | **Which department owns it?** | Existing or newly justified department |
| 3 | **Who interacts with it?** | Founder · employee · Genesis · guest · client — list all |
| 4 | **What physical place represents this capability?** | Describable environment with evidence of work |
| 5 | **Does this reinforce immersion?** | Yes — or redesign required |
| 6 | **Does this make Studio World feel larger?** | Expands believable organization — not shrinks to utility |
| 7 | **Would this still make sense if there were no traditional UI?** | Event/place metaphor holds without grids |
| 8 | **Does this create another dashboard?** | **No** — if yes, **redesign** |
| 9 | **Does this belong inside an existing department instead?** | Consolidated or justified as new home |
| 10 | **What experience is the user actually having?** | Named event — not "using a feature" |

### Question 8 — Dashboard test

If the primary surface is a **grid of metrics**, **card layout of unrelated tools**, or **tabbed admin panel without departmental identity**, the answer to question 8 is **yes**. **Redesign is mandatory.** Reframe as Executive Intelligence Center observation deck, department floor, or meeting room — not a dashboard.

---

## Genesis Review

Every feature must answer **why Genesis knows about this** and **how Genesis participates**.

| Question | Options |
|----------|---------|
| **Why does Genesis know about this?** | Organizational relevance — coordination, memory, attention, scheduling |
| **Should Genesis initiate it?** | Genesis summons founder to event |
| **Observe it?** | Genesis tracks state for briefing |
| **Coordinate it?** | Genesis schedules departments and handoffs |
| **Present it?** | Genesis surfaces in Orb / briefing / meeting |
| **Ignore it?** | Department-local; Genesis has no role |

**Law:** Genesis must **never** be connected to features without purpose. Default chat integration is **forbidden** unless the surface is explicitly a **meeting room** or **executive session**.

### Genesis integration matrix (examples)

| Capability | Genesis role |
|------------|--------------|
| Analytics | **Present** in Morning Briefing™ · **Observe** KPIs |
| Creative Review | **Coordinate** schedule · **Observe** outcomes |
| Settings / Operations | **Ignore** day-to-day · **Observe** policy changes if org-wide |
| World Compiler run | **Initiate** or **Coordinate** · **Present** compile status |
| Debug / forensic tools | **Ignore** unless founder-facing recovery |

---

## World Review

Composer must classify spatial impact:

| Classification | Meaning | Action |
|----------------|---------|--------|
| **Creates a new place** | New room, set, or building | Register in World Graph · Atlas |
| **Belongs inside an existing place** | Extends current room | Document parent place |
| **Requires a new department** | New organizational unit | Justify vs existing departments |
| **Requires a new floor** | Vertical expansion within building | Update headquarters hierarchy |
| **Requires a new district** | Campus-level expansion | Master Plan alignment |
| **Requires no spatial representation** | Pure infrastructure (API, migration) | Document as **infrastructure layer** — not founder-facing |

**Law:** "Requires no spatial representation" applies only to **non-founder-facing infrastructure**. Any founder-visible capability **must** have spatial representation.

---

## Design Review Output

Before implementation, Composer generates a **Spatial Architecture Review artifact** containing:

| Field | Description |
|-------|-------------|
| **Spatial Placement** | Building · wing · floor · room · route |
| **Department Owner** | Department name + executive role |
| **Genesis Relationship** | Initiate · observe · coordinate · present · ignore + rationale |
| **Founder Journey** | Arrive → walk → act → depart (verbs, not clicks) |
| **Physical Environment** | What the place looks like; evidence of work |
| **Expected Emotional Response** | What founder should feel |
| **Architecture Risks** | Duplication · orphan · dashboard drift · Genesis sprawl |

Only after this artifact is complete may **implementation** begin.

---

## Red Flags — Automatic Rejection

The following patterns **fail review automatically**. Do not implement. Redesign or reject the request.

| Red flag | Why it fails |
|----------|--------------|
| **Generic dashboards** | Violates presence principle — software, not company |
| **Floating utilities** | No spatial home |
| **Orphan pages** | Route without World Graph / department address |
| **Feature-first navigation** | Nav organized by features, not places |
| **Settings dumping grounds** | Unrelated controls in Operations Office without structure |
| **Duplicate departments** | Overlaps existing org unit without merge plan |
| **AI for AI's sake** | Genesis connected without initiate/observe/coordinate purpose |
| **Non-spatial workflows** | Completable without sense of where/when |

### Rejection response

When a red flag triggers:

1. **Stop** — do not write implementation code.
2. **Name the red flag** explicitly.
3. **Propose redesign** — placement, department, experience reframing.
4. **Return review artifact** with **REJECTED** status and revision path.

---

## Design Score

Every feature receives scores **1–5** per dimension (5 = exemplary spatial architecture).

| Dimension | Measures |
|-----------|----------|
| **Spatial Integrity** | Clear, unique, non-orphan placement |
| **Immersion** | Reinforces place over software |
| **Department Clarity** | Obvious owner and operational home |
| **Genesis Integration** | Purposeful consciousness role — not default chat |
| **Emotional Presence** | Founder feels arrival, event, leadership |
| **Architectural Consistency** | Aligns with canon, graph, and language constitution |
| **Future Expandability** | Room to grow within district without rewrite |

### Overall World Score

**Overall World Score** = weighted average (all dimensions equal weight unless founder specifies otherwise).

| Score | Gate |
|-------|------|
| **4.0 – 5.0** | Approved for implementation |
| **3.0 – 3.9** | Approved with documented mitigations for weak dimensions |
| **Below 3.0** | **Not approved** — redesign required |

Record scores in the review artifact. Significant Studio OS features should target **≥ 4.0**.

---

## Review Output Template

Copy this template into sprint planning, PR descriptions, or architecture memos:

```markdown
# SPATIAL ARCHITECTURE REVIEW — [FEATURE NAME]

**Status:** APPROVED | APPROVED WITH MITIGATIONS | REJECTED | SKIPPED — [reason]
**Reviewed against:** STUDIO_OS_BIBLE/SPATIAL_ARCHITECTURE_REVIEW.md v1.0.0
**Date:** YYYY-MM-DD

## Automatic review answers

1. **Where does this live?** …
2. **Department owner?** …
3. **Who interacts?** Founder · … · Genesis · …
4. **Physical place?** …
5. **Reinforces immersion?** Yes / No — …
6. **Makes World feel larger?** Yes / No — …
7. **Sensible without traditional UI?** Yes / No — …
8. **Creates a dashboard?** No / YES — REDESIGN
9. **Existing department instead?** …
10. **User experience?** …

## Genesis review

- **Why Genesis knows:** …
- **Role:** Initiate | Observe | Coordinate | Present | Ignore
- **Rationale:** …

## World review

- **Classification:** New place | Existing place | New department | New floor | New district | Infrastructure only
- **World Graph impact:** …

## Design review output

| Field | Value |
|-------|-------|
| Spatial Placement | … |
| Department Owner | … |
| Genesis Relationship | … |
| Founder Journey | … |
| Physical Environment | … |
| Expected Emotional Response | … |
| Architecture Risks | … |

## Design score

| Dimension | Score (1–5) |
|-----------|-------------|
| Spatial Integrity | |
| Immersion | |
| Department Clarity | |
| Genesis Integration | |
| Emotional Presence | |
| Architectural Consistency | |
| Future Expandability | |
| **Overall World Score** | |

## Red flags

None | [list triggered flags]

## Implementation gate

- [ ] Review complete
- [ ] Score ≥ 3.0 (or founder override)
- [ ] No unresolved red flags
- [ ] **Implementation may begin**
```

---

## Approval Gate

Implementation may begin **only when all are true**:

1. All ten automatic review questions answered
2. Genesis review complete with purposeful role (or explicit ignore)
3. World review classification documented
4. Design review output fields filled
5. No red flags — or red flags resolved through redesign
6. Overall World Score ≥ 3.0 — or founder explicit override
7. For new departments or districts: founder approval recorded

ChatGPT / Terra may produce the review artifact. **Composer must not skip it** when implementing Studio OS product work.

---

## Long-Term Vision

Eventually this review engine becomes an **actual Studio OS subsystem** — not merely a Composer protocol.

### Future behavior

Before Genesis creates anything, Genesis asks:

> **"Where does this belong?"**

If the answer cannot be justified spatially, **implementation pauses** until architecture is resolved.

| Phase | Capability |
|-------|------------|
| **Now (v1.0)** | Document protocol · Composer workflow · planning prompt integration |
| **Next** | Review artifact registry in Knowledge Hub · World Graph validation hooks |
| **Future** | Automated placement linter · Genesis pre-flight gate · score dashboard in Documentation Governance |

This document defines **v1.0 human + agent enforcement**. Automation extends — never replaces — the constitution.

---

## Integration with Planning Prompts

### For ChatGPT (architecture partner)

Before authoring a Composer sprint prompt for Studio OS product work, produce a **Spatial Architecture Review** artifact (template above) or embed the ten questions in the sprint header.

See [PROMPT_TEMPLATES.md](../docs/ai-collaboration/PROMPT_TEMPLATES.md) → **Spatial Architecture Review** and updated **Composer sprint (standard)**.

### For Composer (Cursor agent)

1. Read [THE_SPATIAL_COMPUTING_PHILOSOPHY.md](./THE_SPATIAL_COMPUTING_PHILOSOPHY.md) and this document at the start of Studio OS feature work.
2. Complete review artifact **before** first code edit.
3. Skip only per [When Review Applies](#when-review-applies).
4. Behave as **Chief Architect of Studio World** — not feature engineer.

See `AGENTS.md` · `.cursor/rules/spatial-architecture-review.mdc`.

### For Terra (governance)

Validate review artifacts against canon. Reject sprints that begin implementation without placement.

---

## Relationship to Other Canon

| Document | Relationship |
|----------|--------------|
| [THE_SPATIAL_COMPUTING_PHILOSOPHY.md](./THE_SPATIAL_COMPUTING_PHILOSOPHY.md) | **Constitution** — this document **enforces** it |
| [STUDIO_WORLD_BIBLE.md](../docs/studio-os/STUDIO_WORLD_BIBLE.md) | Experiential targets for Experience Review stage |
| [Foundation Sprint](../docs/studio-os/foundation-sprint/README.md) | Room taxonomy · department hierarchy reference |
| [CHATGPT_OPERATING_MANUAL.md](../docs/ai-collaboration/CHATGPT_OPERATING_MANUAL.md) | Architecture review workflow §9 |
| [PROMPT_TEMPLATES.md](../docs/ai-collaboration/PROMPT_TEMPLATES.md) | Review + sprint templates |
| [Documentation Governance](../docs/studio-os/documentation-governance.md) | Future automated audit home |

**Hierarchy:**

1. Spatial Computing Philosophy — **what** we believe  
2. Spatial Architecture Review Engine — **how** we enforce before build  
3. Sprint specifications — **what** we build (only after approval)

---

*End of Spatial Architecture Review Engine™ v1.0.0 — Studio OS Bible*
