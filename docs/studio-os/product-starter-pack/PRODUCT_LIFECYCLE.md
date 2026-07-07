# Product Lifecycle

> **v2.0.0:** Superseded by [START_HERE.md](./START_HERE.md) lifecycle section.

---

## Lifecycle Overview

```
┌─────────┐   ┌──────────┐   ┌──────────────┐   ┌──────────────────┐
│  IDEA   │ → │ RESEARCH │ → │ ARCHITECTURE │ → │ DESIGN GOVERNANCE│
└─────────┘   └──────────┘   └──────────────┘   └──────────────────┘
                                                        ↓
┌────────────┐   ┌─────────────┐   ┌────────────────┐   ┌─────────────────────┐
│ GOVERNANCE │ ← │   LAUNCH    │ ← │      QA        │ ← │  IMPLEMENTATION     │
└────────────┘   └─────────────┘   └────────────────┘   └─────────────────────┘
       ↑                                    ↑                        ↑
       │                          ┌─────────────────┐   ┌──────────────────────┐
       └──────────────────────────│ EXPERIENCE      │ ← │ PRODUCT              │
                                  │ PROTOTYPE       │   │ SPECIFICATION        │
                                  └─────────────────┘   └──────────────────────┘
```

---

## Phase 1 — Idea

| Attribute | Detail |
|-----------|--------|
| **Duration** | Days |
| **Output** | One-page concept |
| **Gate** | Executive approval to research |
| **Registry** | Entry in `product-roadmap.yaml` (queued) |

**Exit criteria:** Clear OS thesis alignment · priority slot assigned

---

## Phase 2 — Research

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1–2 weeks |
| **Output** | Competitive notes · user evidence · module reuse map |
| **Gate** | Research review |

**Exit criteria:** Confirmed no duplicate milestone · Release Channel identified

---

## Phase 3 — Architecture

| Attribute | Detail |
|-----------|--------|
| **Duration** | Days–1 week |
| **Output** | Milestone map · dependencies · channel plan |
| **Gate** | Architecture alignment check |

**Exit criteria:** Master Spec additions scoped (minimal delta)

---

## Phase 4 — Design Governance

| Attribute | Detail |
|-----------|--------|
| **Duration** | Days |
| **Output** | `designCompliance` declaration |
| **Gate** | Design Constitution acknowledgment |

**Exit criteria:** Component Usage Map drafted · no local design language

**Reference:** [GOVERNANCE_RULES.md](./GOVERNANCE_RULES.md)

---

## Phase 5 — Product Specification

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1–3 weeks |
| **Output** | Full [Required Documentation](./REQUIRED_DOCUMENTATION_CHECKLIST.md) |
| **Gate** | **Specification approval** |

**Exit criteria:** Items 1–8 complete · references design governance

---

## Phase 6 — Experience Prototype

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1–2 weeks |
| **Output** | Interactive prototype (catalog components) |
| **Gate** | **Prototype approval** |

**Exit criteria:** Feel validated · Design Health preview ≥70

---

## Phase 7 — Implementation

| Attribute | Detail |
|-----------|--------|
| **Duration** | Variable |
| **Output** | Production code · module doc |
| **Gate** | Sprint reviews · Architecture Validator on compile |

**Exit criteria:** Feature complete per spec · no governance drift

---

## Phase 8 — QA

| Attribute | Detail |
|-----------|--------|
| **Duration** | 1+ weeks |
| **Output** | Validation reports |
| **Gate** | [Definition of Done](./DEFINITION_OF_DONE.md) |

**Validators:**
- Architecture Validator™
- Design Health™
- Accessibility audit
- Release Channel eligibility
- Regression (if applicable)

---

## Phase 9 — Launch

| Attribute | Detail |
|-----------|--------|
| **Duration** | Days |
| **Output** | Launch report · registry registration |
| **Gate** | Release Channel promotion |

**Exit criteria:** System Registry™ · Knowledge Registry™ · product-roadmap status update

---

## Phase 10 — Governance (Ongoing)

| Attribute | Detail |
|-----------|--------|
| **Duration** | Permanent |
| **Output** | VDR compliance · metric reviews |
| **Activities** | Design Health re-cert · deprecation migration · metric tracking |

---

## Lifecycle Status Values

| Status | Meaning |
|--------|---------|
| `queued` | Idea approved · not started |
| `research` | Phase 2 |
| `architecture` | Phase 3 |
| `product-vision` | Phase 5 in progress |
| `spec-approved` | Phase 5 gate passed |
| `prototype` | Phase 6 |
| `prototype-approved` | Phase 6 gate passed |
| `implementation` | Phase 7 |
| `qa` | Phase 8 |
| `launch` | Phase 9 |
| `live` | Post-launch governance |
| `deprecated` | Winding down |

---

## Maintenance & Deprecation

| Event | Process |
|-------|---------|
| Feature addition | Minor spec amendment · no foundation change |
| Visual change | VDR process |
| Product retirement | Deprecation VDR · migration path · registry archive |

---

*Product Lifecycle — ship intentionally · govern permanently.*
