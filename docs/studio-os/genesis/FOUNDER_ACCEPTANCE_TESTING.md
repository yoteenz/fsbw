# Founder Acceptance Testing™ — Validation Methodology

**Blueprint:** `genesis/articles/FOUNDER_ACCEPTANCE_TESTING.md`  
**Content home:** `genesis/founder-acceptance-testing/`  
**Status:** Canonical methodology draft; runtime not yet implemented

---

## Purpose

Founder Acceptance Testing™ is Studio OS's official internal product validation framework.

It ensures Studio OS validates itself before public launch. A system is not complete because it was built; it is complete when the founder can genuinely operate the company with it.

---

## Validation levels

| Level | Name | Core question |
|-------|------|---------------|
| 1 | Architectural Validation™ | Does the architecture make sense? |
| 2 | Implementation Validation™ | Does the implementation function correctly? |
| 3 | Founder Acceptance Testing™ | Can the founder genuinely operate the company using this system? |
| 4 | Company Validation™ | Can multiple businesses successfully operate using the same platform? |
| 5 | Market Validation™ | Can external customers successfully adopt the system? |

Each level defines purpose, success criteria, failure criteria, metrics, required evidence, required duration/evidence window, documentation, and Genesis updates.

---

## Founder Acceptance metrics

- Daily Usage
- Weekly Usage
- Task Completion Rate
- Mission Completion
- Time Saved
- Context Switching Reduction
- Apps Replaced
- Decision Quality
- Stress Reduction
- Delight
- Trust
- Reliability
- Knowledge Retrieval Speed
- Automation Success
- Creative Throughput
- Focus Time
- Founder Satisfaction
- System Confidence

---

## Founder Acceptance Scorecard™

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

## Required Founder Acceptance tests

### Withdrawal Test™

Question:

```text
If this system disappeared tomorrow, would the founder immediately miss it?
```

Pass signals:

- Founder reaches for it without prompting.
- Old workflow feels worse.
- Real mission/task slows down without it.
- Founder loses context, memory, or confidence without it.
- Founder asks when it will return.
- App switching or open loops increase without it.

### Replacement Test™

The system must replace real behavior, not merely add another place to check.

Candidate tools/workflows:

- Apple Notes
- Notion
- Trello
- ClickUp
- Asana
- Google Docs
- ChatGPT
- Slack
- Calendar
- Email
- Spreadsheets

### Delight Test™

Delight is measured by surprise, joy, confidence, calm, momentum, and craft pride.

Evidence may include founder quotes, repeat voluntary use, unprompted positive reaction, reduced stress score, trust increase, or increased system confidence.

---

## Genesis Feedback Loop™

Every completed validation answers:

1. What worked?
2. What failed?
3. What surprised us?
4. What assumptions were incorrect?
5. What should Genesis learn?
6. What system boundaries changed?
7. What source-of-truth conflicts appeared?
8. What should be promoted, revised, deprecated, or blocked?

---

## Official milestone status format

```text
Architecture Validation: pass / retry / blocked
Implementation Validation: pass / retry / blocked
Founder Acceptance: pass / pending / retry / blocked
Company Validation: pending until multi-company proof
Market Validation: pending until external launch readiness
Genesis Feedback: complete / incomplete
```

If a Launch Stack milestone cannot show this, it is not complete. It is only built.
