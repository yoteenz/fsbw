# Founder Acceptance Testing™

**Project:** Studio OS  
**Program:** Studio OS Launch Stack™  
**System:** Founder Acceptance Testing™  
**Status:** Canonical validation methodology draft for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Depends on:** Genesis™, Headquarters Principles™, Proof Before Expansion Principle™, Executive Headquarters™, Orb™, Mission Engine™, Knowledge Core™, Institute of Knowledge™, Universal Interaction Engine™, Universal Decision Engine™, Command Center™  
**Constitutional posture:** Studio OS validates itself before customers ever use it. Validation begins with the founder.

---

## 0. Doctrine

Founder Acceptance Testing™ is Studio OS's official internal quality standard.

It answers the question that architecture and implementation alone cannot answer:

> Can the founder genuinely operate the company using this system?

Studio OS should not wait for public launch to discover whether a system is useful. The founder is the first real operator, first executive user, first power user, first quality gate, and first proof source.

### 0.1 Prime directive

```text
No Launch Stack milestone is complete until it passes Founder Acceptance Testing™.
```

### 0.2 Product promise

Every system should move through proof:

```text
Architecture makes sense
  → implementation works
  → founder can operate with it
  → multiple companies can operate with it
  → external customers can adopt it
```

### 0.3 Rejected patterns

| Rejected | Canonical replacement |
|----------|----------------------|
| Public launch as validation | Internal proof before expansion |
| Feature complete | Founder accepted |
| Demo works once | Operates under real founder workflow |
| Vibes-only approval | Evidence-backed acceptance |
| Customer discovery before internal truth | Founder usage as first validation layer |
| Metrics without story | Quantitative + qualitative evidence |
| Founder delight as optional | Delight as quality signal |

---

## 1. System definition

| Field | Definition |
|-------|------------|
| **Official Name™** | Founder Acceptance Testing™ |
| **Purpose** | Validate Studio OS systems internally before public exposure |
| **Responsibilities** | Define validation levels, gates, metrics, evidence, graduation, failure criteria, learning loops, Genesis updates |
| **Objects owned** | Validation run, acceptance scorecard, founder evidence packet, withdrawal test result, replacement test result, delight test result, Genesis feedback packet |
| **Objects referenced** | Milestone, System, Company, Mission, Decision, Workflow, Room, Briefing, Recommendation, Knowledge Artifact, Command, Founder Feedback |
| **Primary users** | Founder, platform steward, product architect, Genesis reviewer, AI workers |
| **Core philosophy** | A system is not complete because it exists; it is complete when it proves operational value |

---

## 2. Validation Philosophy™

Founder Acceptance Testing™ extends the Proof Before Expansion Principle™ into a measurable product validation method.

### 2.1 Validation ladder

| Level | Name | Core question |
|-------|------|---------------|
| **Level 1** | Architectural Validation™ | Does the architecture make sense? |
| **Level 2** | Implementation Validation™ | Does the implementation function correctly? |
| **Level 3** | Founder Acceptance Testing™ | Can the founder genuinely operate the company using this system? |
| **Level 4** | Company Validation™ | Can multiple businesses successfully operate using the same platform? |
| **Level 5** | Market Validation™ | Can external customers successfully adopt the system? |

### 2.2 Evidence doctrine

Every validation level must produce evidence:

- What was tested
- Who tested it
- What company/context was used
- What worked
- What failed
- What was surprising
- What assumptions changed
- What Genesis should learn
- Whether the system graduates, retries, or is blocked

### 2.3 Validation is not QA alone

QA asks:

> Does it work?

Founder Acceptance Testing asks:

> Does it make the founder better at operating the company?

---

## 3. Validation Levels™

### 3.1 Level 1 — Architectural Validation™

| Requirement | Definition |
|-------------|------------|
| **Purpose** | Confirm the system belongs in Studio OS and fits the canonical architecture |
| **Success criteria** | Clear purpose, boundaries, source-of-truth ownership, dependencies, events, failure modes, expansion path |
| **Failure criteria** | Duplicates an owning system, unclear authority, dashboard regression, no Genesis trace, missing dependencies, unbounded scope |
| **Metrics** | Architecture completeness score, dependency clarity, boundary clarity, integration trace count, unresolved contradiction count |
| **Required evidence** | Genesis article, system relationship map, boundary table, dependency map, minimum lovable scope, anti-patterns |
| **Required duration** | One complete Genesis review cycle plus contradiction resolution |
| **Required documentation** | Canonical article, content home, platform guide or architecture guide |
| **Genesis updates** | Add/update Genesis article, indexes, and any rules needed to prevent drift |

### 3.2 Level 2 — Implementation Validation™

| Requirement | Definition |
|-------------|------------|
| **Purpose** | Confirm the shipped implementation functions correctly and matches the approved architecture |
| **Success criteria** | Build passes, key flows execute, data persists correctly, projections name owners, no brand hardcoding unless intended, accessibility and routing work |
| **Failure criteria** | Broken build, runtime errors, data loss, source truth duplication, unauthorized action path, unhandled empty state, architecture mismatch |
| **Metrics** | Build result, test pass rate, route coverage, persistence integrity, TypeScript/lint health, core flow success rate |
| **Required evidence** | Build/test logs, screenshots or walkthrough notes when UI exists, changed files summary, architecture-to-code trace |
| **Required duration** | At least one full implementation verification loop after final edits |
| **Required documentation** | Runtime platform guide, API notes, verification notes |
| **Genesis updates** | Mark runtime status, document projection boundaries, update content home |

### 3.3 Level 3 — Founder Acceptance Testing™

| Requirement | Definition |
|-------------|------------|
| **Purpose** | Determine whether the founder can operate the company better using the system |
| **Success criteria** | Founder uses it for real work, completes meaningful missions, trusts outputs, misses it when removed, replaces existing tools, reports less stress or more confidence |
| **Failure criteria** | Founder avoids it, still uses old tools for the same workflow, cannot complete tasks, distrusts recommendations, feels overwhelmed, no measurable time/focus/quality gain |
| **Metrics** | Daily usage, weekly usage, task completion, mission completion, time saved, context switching reduction, apps replaced, decision quality, stress reduction, delight, trust, reliability, retrieval speed, automation success, creative throughput, focus time, satisfaction, system confidence |
| **Required evidence** | Founder usage log, completed mission records, before/after tool comparison, withdrawal test, replacement test, delight test, founder narrative feedback |
| **Required duration** | Enough repeated real operating sessions to show habit, not novelty; minimum: first-use session, repeat-use session, and withdrawal/replacement review |
| **Required documentation** | Founder Acceptance Scorecard™, evidence packet, failure/learning notes, Genesis feedback packet |
| **Genesis updates** | Promote, revise, or block milestone; update assumptions and system doctrine based on evidence |

### 3.4 Level 4 — Company Validation™

| Requirement | Definition |
|-------------|------------|
| **Purpose** | Confirm the system works across multiple businesses without architectural redesign |
| **Success criteria** | Multiple companies operate using same runtime/contracts; company-specific meaning comes from Genome/projections/config; no hardcoded business logic |
| **Failure criteria** | Requires per-company rewrites, leaks context between companies, breaks with different departments, depends on one founder's exact workflow |
| **Metrics** | Company count, successful workflow count per company, configuration reuse, cross-company isolation, company-specific satisfaction, support issues |
| **Required evidence** | Multi-company test packet, company boundary audit, workflow comparison, configuration/projection map |
| **Required duration** | Repeated operating cycles across at least two distinct company contexts |
| **Required documentation** | Company Validation Report™, reusable platform contract notes |
| **Genesis updates** | Update platform contracts, Company Genome requirements, and reusable system doctrine |

### 3.5 Level 5 — Market Validation™

| Requirement | Definition |
|-------------|------------|
| **Purpose** | Confirm external customers can adopt and succeed with the system |
| **Success criteria** | Customers onboard, understand value, complete workflows, return, replace tools, trust system outputs, pay or express clear purchase intent |
| **Failure criteria** | Requires founder-led explanation, unclear value, poor onboarding, no retention, no willingness to pay, high support burden |
| **Metrics** | Activation, retention, workflow completion, time to value, support burden, NPS/CSAT, conversion, renewal/expansion intent |
| **Required evidence** | Customer onboarding logs, usage analytics, interviews, support records, pricing/intent evidence |
| **Required duration** | Enough external customer cycles to separate curiosity from adoption |
| **Required documentation** | Market Validation Report™, adoption blockers, productization requirements |
| **Genesis updates** | Update market-facing doctrine, onboarding requirements, pricing/product packaging assumptions |

---

## 4. Validation Gates™

### 4.1 Gate order

```text
Gate 1: Architecture Accepted
Gate 2: Implementation Verified
Gate 3: Founder Accepted
Gate 4: Company Proven
Gate 5: Market Ready
```

### 4.2 Gate status

| Status | Meaning |
|--------|---------|
| **Blocked** | Cannot continue without material change |
| **Retry** | Evidence insufficient; repeat after fixes |
| **Conditional** | May continue with explicit risk and follow-up |
| **Accepted** | Meets level criteria |
| **Graduated** | May move to next validation level |

### 4.3 Launch Stack milestone rule

A Launch Stack milestone is not complete until:

1. Level 1 passes.
2. Level 2 passes.
3. Level 3 passes or is explicitly marked **Founder Acceptance Pending** with a blocker.
4. Genesis receives a feedback packet.

---

## 5. Founder Acceptance Testing™ metrics

### 5.1 Core metrics

| Metric | Definition | Strong signal |
|--------|------------|---------------|
| **Daily Usage** | Founder uses system during real operating day | Becomes first or default place for workflow |
| **Weekly Usage** | Founder returns across repeated operating cycles | System survives novelty |
| **Task Completion Rate** | Tasks completed inside system vs attempted | High completion without workarounds |
| **Mission Completion** | Missions advanced or completed using system | System moves real work forward |
| **Time Saved** | Time avoided vs prior workflow | Founder notices speed |
| **Context Switching Reduction** | Fewer app/tool switches | Founder stays in Studio OS |
| **Apps Replaced** | External tools no longer needed for workflow | Replacement evidence |
| **Decision Quality** | Better decisions, fewer reversals, clearer rationale | Founder trusts judgment |
| **Stress Reduction** | Lower anxiety, fewer open loops | Founder feels calmer |
| **Delight** | Surprise, joy, confidence, calm | Founder talks about it unprompted |
| **Trust** | Founder accepts recommendations/outputs | Low verification burden |
| **Reliability** | System behaves predictably | Few failures, no data loss |
| **Knowledge Retrieval Speed** | Time to source-backed answer | Faster than manual search |
| **Automation Success** | Approved automations complete safely | No unsafe execution |
| **Creative Throughput** | More quality creative work completed | Better output, less friction |
| **Focus Time** | Uninterrupted founder work supported | More deep work |
| **Founder Satisfaction** | Founder-rated usefulness | Clear yes to continued use |
| **System Confidence** | Founder believes system can run the workflow | Uses without hesitation |

### 5.2 Score bands

| Score | Meaning |
|-------|---------|
| **90-100** | Founder would fight to keep it |
| **75-89** | Accepted; meaningful value, some improvements needed |
| **60-74** | Conditional; promising but not yet habit-forming |
| **40-59** | Retry; function exists but value is weak |
| **0-39** | Blocked; not founder-accepted |

### 5.3 Minimum Founder Acceptance threshold

Founder Acceptance passes when:

- Overall score ≥ 75
- Withdrawal Test passes
- Replacement Test passes for at least one meaningful tool/workflow
- No critical failure criteria remain
- Founder can describe the value in their own words

---

## 6. Graduation Requirements™

### 6.1 Graduate from Level 1 to Level 2

- Architecture accepted
- Scope defined
- Boundaries explicit
- Dependencies named
- Genesis updated

### 6.2 Graduate from Level 2 to Level 3

- Implementation works
- Build/tests pass
- Key flows verified
- Runtime docs updated
- Known issues documented

### 6.3 Graduate from Level 3 to Level 4

- Founder Acceptance score ≥ 75
- Withdrawal Test passes
- Replacement Test passes
- Delight signal present
- Founder uses system for real work
- Genesis feedback packet complete

### 6.4 Graduate from Level 4 to Level 5

- Multiple company contexts operate successfully
- No hardcoded company behavior
- Company boundary protections verified
- Reusable platform contract documented

### 6.5 Graduate to public readiness

- Market validation evidence supports adoption
- Onboarding and support burden acceptable
- Product packaging is clear
- Genesis and docs reflect reality

---

## 7. Failure Criteria™

A system fails Founder Acceptance if any of these are true:

- Founder does not voluntarily return.
- Founder still prefers old tools for the same work.
- System creates more stress than clarity.
- Founder distrusts outputs.
- Mission completion does not improve.
- Context switching increases.
- System cannot retrieve needed knowledge quickly.
- Recommendations are generic or wrong.
- Creative work becomes slower or flatter.
- Automation requires too much supervision or creates risk.
- Founder would not miss the system if removed.
- Value cannot be explained without a demo.

Critical failures block graduation:

- Data loss
- Cross-company leakage
- Unsafe command execution
- Hidden memory writes
- Permission bypass
- Founder confusion about source truth

---

## 8. Withdrawal Test™

### 8.1 Question

```text
If this system disappeared tomorrow, would the founder immediately miss it?
```

### 8.2 Objective criteria

The Withdrawal Test passes when at least four are true:

1. Founder reaches for the system without prompting.
2. Founder complains or feels friction when using the old workflow.
3. A real mission/task slows down without it.
4. Founder loses context, memory, or confidence without it.
5. Founder asks when it will return.
6. Founder can name specific value the system provided.
7. Removing it increases app switching or open loops.
8. Removing it reduces creative throughput, decision quality, or focus time.

### 8.3 Failure

The test fails when the founder can continue normally without noticing meaningful loss.

---

## 9. Replacement Test™

### 9.1 Purpose

Founder Acceptance requires replacing real behavior, not merely adding another place to check.

### 9.2 Replacement map

| Existing tool | Studio OS replacement signal |
|---------------|------------------------------|
| **Apple Notes** | Founder captures durable notes/memory in Studio OS |
| **Notion** | Operating knowledge, docs, and project structure live in Knowledge Core / HQ |
| **Trello** | Missions replace cards for operational runway |
| **ClickUp / Asana** | Mission Engine + Department Rooms coordinate work |
| **Google Docs** | Drafting, source-backed docs, and canonical memory move into Studio OS |
| **ChatGPT** | Orb becomes contextual executive partner, not generic prompt surface |
| **Slack** | Executive advisories, mission updates, and department context reduce chat dependency |
| **Calendar** | Orb meeting prep and daily planning reduce calendar-only planning |
| **Email** | Command/mission workflows reduce inbox as task manager |
| **Spreadsheets** | Company Pulse and Health projections replace manual status tracking |

### 9.3 Pass criteria

The Replacement Test passes when:

- Founder uses Studio OS instead of at least one existing tool for a real workflow.
- The old tool becomes backup, archive, or external communication only.
- Outcome quality is equal or better.
- Founder prefers the Studio OS workflow.

---

## 10. Delight Test™

### 10.1 Purpose

Delight is not decoration. Delight proves the system creates confidence, calm, surprise, momentum, or emotional attachment.

### 10.2 Delight signals

| Signal | Evidence |
|--------|----------|
| **Surprise** | Founder discovers useful context they did not ask for |
| **Joy** | Founder smiles, comments, shares, or revisits feature |
| **Confidence** | Founder makes decision faster or with less second-guessing |
| **Calm** | Founder reports reduced overwhelm |
| **Momentum** | Founder continues into next mission without prompting |
| **Craft pride** | Founder says the system feels premium or inevitable |

### 10.3 Measurement

Delight is measured by:

- Founder quote
- Repeat voluntary use
- Unprompted positive reaction
- Reduced stress score
- Increased trust score
- Increased system confidence
- Qualitative notes in evidence packet

### 10.4 Failure

The system fails delight when it is useful but cold, noisy, confusing, generic, or emotionally forgettable.

---

## 11. Continuous Learning™

Founder Acceptance Testing™ is not a one-time checklist. It creates continuous learning.

Every validation run should produce:

- Metric deltas
- Founder quotes
- Failed assumptions
- Workflow gaps
- Replacement opportunities
- Delight moments
- Reliability incidents
- Genesis updates
- Next experiment

### 11.1 Learning cadence

Learning occurs after:

- First use
- Repeat use
- Withdrawal test
- Replacement test
- Major mission completion
- Failed mission
- Company context expansion
- Public readiness review

---

## 12. Genesis Feedback™

Every completed validation must answer:

1. What worked?
2. What failed?
3. What surprised us?
4. What assumptions were incorrect?
5. What should Genesis learn?
6. What system boundaries changed?
7. What source-of-truth conflicts appeared?
8. What should be promoted, revised, deprecated, or blocked?

### 12.1 Genesis Feedback Packet

| Field | Required |
|-------|----------|
| System / milestone | Yes |
| Validation level | Yes |
| Company context | Yes |
| Evidence summary | Yes |
| Metrics | Yes |
| Founder narrative | Yes for Level 3+ |
| Withdrawal result | Yes for Level 3 |
| Replacement result | Yes for Level 3 |
| Delight result | Yes for Level 3 |
| Failure criteria | Yes |
| Graduation decision | Yes |
| Genesis changes required | Yes |

### 12.2 Genesis actions

Validation can trigger:

- New Genesis rule
- Article amendment
- Dependency update
- Build order change
- Runtime requirement
- System deprecation
- Scope reduction
- Expansion block
- Platform graduation

---

## 13. Founder Acceptance Scorecard™

| Category | Weight |
|----------|--------|
| Real usage | 15 |
| Mission/task completion | 15 |
| Tool replacement | 12 |
| Time/focus improvement | 12 |
| Trust/reliability | 14 |
| Decision/knowledge quality | 12 |
| Delight/calm/confidence | 10 |
| Documentation/Genesis learning | 10 |

Pass threshold: **75 / 100** with no critical failures.

---

## 14. Official milestone standard

Every Launch Stack milestone must publish:

```text
Architecture Validation: pass / retry / blocked
Implementation Validation: pass / retry / blocked
Founder Acceptance: pass / pending / retry / blocked
Company Validation: pending until multi-company proof
Market Validation: pending until external launch readiness
Genesis Feedback: complete / incomplete
```

If the milestone cannot show this, it is not complete. It is only built.

