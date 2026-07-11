# Decision History

Major project decisions with rationale — explainable architecture.

---
**Last Updated:** 2026-07-11  
**Confidence Level:** Medium (seed entries — expand over time)  
**Source:** MEMORY.md, architecture sprints  
**Status:** Living log  
**Version:** 1.0.0  
**Related Documents:** DECISION_HISTORY.md, Context `PROJECT_CHANGELOG.md`  
**Future Questions:** Automate decision extraction from MEMORY entries?

---

## Format

Each entry: **Decision · Reason · Alternatives rejected · Tradeoffs · Final direction · Future considerations**

---

### D-001 — Three-capsule onboarding (2026-07-11)

| Field | Value |
|-------|-------|
| **Decision** | Split onboarding into Context + DNA + Founder Intelligence capsules |
| **Reason** | Repository alone cannot preserve founder strategy or emotional intent |
| **Alternatives rejected** | Single mega-zip; chat-only onboarding |
| **Tradeoffs** | More maintenance; clearer boundaries |
| **Final direction** | Three artifacts with cross-refs and stable `/context/latest` URL |
| **Future** | Auto-regenerate FIC when major strategy shifts |

---

### D-002 — Work on master, one deploy per task (ongoing)

| Field | Value |
|-------|-------|
| **Decision** | Single commit + push per completed user request |
| **Reason** | Each push triggers Vercel production deploy |
| **Alternatives rejected** | Feature branches for agent work; amend+force-push fixes |
| **Tradeoffs** | No PR review gate on agent commits |
| **Final direction** | `./scripts/agent-commit.sh` + MEMORY in same commit |
| **Future** | Preview branch only when founder explicitly requests |

---

### D-003 — Mobile-first verification (ongoing)

| Field | Value |
|-------|-------|
| **Decision** | Real phone before desktop DevTools as default QA |
| **Reason** | Production users are mobile; desktop masks touch/perf issues |
| **Alternatives rejected** | Desktop-only agent testing instructions |
| **Tradeoffs** | Slower agent verification loops |
| **Final direction** | CORE ACTIVE BUILD TARGET rule |
| **Future** | Dedicated mobile preview branch when requested |

---

### D-004 — Canon preservation policy (2026-07-11)

| Field | Value |
|-------|-------|
| **Decision** | Ideas do not auto-become canon; registry tracks maturity |
| **Reason** | Vision bibles were confused with shipped truth |
| **Alternatives rejected** | Implicit canon from any merged doc |
| **Tradeoffs** | More explicit promotion steps |
| **Final direction** | Studio DNA Capsule Section 21 + CANON_REGISTRY |
| **Future** | Automated canon drift checks in prebuild |

---

*Append new decisions at top. Do not delete history.*
