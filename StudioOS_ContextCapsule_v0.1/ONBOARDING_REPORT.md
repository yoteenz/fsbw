# AI Onboarding Report — Standard Template (0.3.2)

> **Unified Onboarding Pack:** If you received **StudioOS_OnboardingPack**, use **ONBOARDING_REPORT_TEMPLATE.md** at the pack root instead of this file. This file remains for **standalone Context Capsule** onboarding only.

**Capsule folder:** `StudioOS_ContextCapsule_v0.1`  
**Capsule version:** 0.3.2  
**Purpose:** Deterministic **verification** after reading every required document — not a general summary.  
**Rule:** Complete this document **exactly**. Do **not** begin implementation until the founder approves.

---

> **Instructions for the receiving AI**
>
> 1. Read **all** required capsule documents in **MANIFEST.md reading order**.
> 2. Complete **every section below** in place. Use complete sentences.
> 3. **Distinguish documented facts from inference.** When uncertain, write: *"This information is not documented within the current capsule."*
> 4. Do **not** modify section headings or remove sections.
> 5. Stop after this report. Wait for founder approval before contributing.

---

# Onboarding Compliance Checklist

_Complete near the start of your report. Every item must be checked or explicitly marked N/A with reason._

| Requirement | Verified (✓) |
|-------------|--------------|
| Read every required document in this capsule | ☐ |
| Followed **MANIFEST.md** reading order exactly | ☐ |
| Used **ONBOARDING_REPORT.md** template exactly (no alternate format) | ☐ |
| Did **NOT** begin solving problems | ☐ |
| Did **NOT** create Composer sprints | ☐ |
| Did **NOT** propose architecture changes | ☐ |
| Did **NOT** generate implementation plans | ☐ |
| **Waiting for founder approval** before contributing | ☐ |

---

# Read Confirmation

Verify reading completeness — not just that files were opened.

| # | File | Read (✓) | Notes |
|---|------|----------|-------|
| 0 | `README_FIRST.md` | ☐ | |
| 1 | `MANIFEST.md` | ☐ | |
| 2 | `KNOWN_BLOCKERS.md` | ☐ | |
| 3 | `CURRENT_HANDOFF.md` | ☐ | |
| 4 | `FOUNDER_PROFILE.md` | ☐ | |
| 5 | `PROJECT_DNA.md` | ☐ | |
| 6 | `AI_CONTEXT.md` | ☐ | |
| 7 | `AI_GLOSSARY.md` | ☐ | |
| 8 | `CHATGPT_OPERATING_MANUAL.md` | ☐ | |
| 9 | `AI_STYLE_GUIDE.md` | ☐ | |
| 10 | `PROJECT_CHANGELOG.md` | ☐ | |
| 11 | `ROADMAP.md` | ☐ | |
| 12 | `OPEN_QUESTIONS.md` | ☐ | |
| 13 | `PROMPT_LIBRARY.md` | ☐ | |
| 14 | `ONBOARDING_REPORT.md` (this template) | ☐ | Structure reviewed |

**Every required document read:** ☐ Yes ☐ No — list gaps.

**Reading order matched MANIFEST.md:** ☐ Yes ☐ No — explain if no.

**Missing documents (not in ZIP):** _None — or list._

**Documents skipped (if any):** _None — or list with reason._

---

# Project Understanding

_Summarize from capsule only. Tag each major claim: **Documented** or **Inferred**._

## Studio OS

_What it is, problem it solves, relationship to Build-a-Wig / Frontal Slayer._

## Studio World

_Spatial navigation, place-over-menu, multi-company model._

## Genesis

_Constitutional layer, company genome, experience engine relationship._

## Studio Institute

_Learning OS within Studio World._

## Experience Lab

_Validation render mode, compile pipeline, current status (cite handoff/blockers)._

## World Compiler

_Scene assembly pipeline (shell → layers → mount)._

## Current implementation stage

_Cite `CURRENT_HANDOFF.md` and `KNOWN_BLOCKERS.md` — **Documented** facts only._

## Collaboration workflow

_ChatGPT / Composer / Terra / Motherboard; sprint design; one-deploy-per-task; forensic-before-repair._

---

# Founder Understanding

_Authority: `FOUNDER_PROFILE.md`. Do **not** infer from general training._

| Category | Summary (from capsule) | Documented / Inferred |
|----------|-------------------------|------------------------|
| **Working style** | | |
| **Communication preferences** | | |
| **Approval workflow** | | |
| **Implementation philosophy** | | |
| **Architecture philosophy** | | |
| **Prompt preferences** | | |
| **Documentation standards** | | |
| **Risk tolerance** | | |

**Alignment check:** ☐ Summary matches `FOUNDER_PROFILE.md` ☐ Gaps flagged below

---

# Operational Source of Truth

_Identify which document governs which responsibility. Do **not** say "the capsule is the source of truth" without this hierarchy._

| Document | Governs | Primary use in onboarding |
|----------|---------|---------------------------|
| `CURRENT_HANDOFF.md` | Current implementation status, active sprint | What is live **now** |
| `KNOWN_BLOCKERS.md` | Active P0 gates — work that must **not** proceed | Hard stops |
| `PROJECT_DNA.md` | Architectural canon, civilization traits | Design philosophy |
| `AI_CONTEXT.md` | Studio OS / World / Institute / compile stack orientation | System map |
| `ROADMAP.md` | Future direction (not current task list) | Sequencing context |
| `OPEN_QUESTIONS.md` | Outstanding founder decisions | Uncertainty registry |
| `FOUNDER_PROFILE.md` | Founder operating profile | Collaboration rules |
| `MANIFEST.md` | Capsule inventory, reading order, version | Export integrity |
| `context-capsule.json` | Machine metadata, checksums | Validation |
| `CAPSULE_VALIDATION.md` | Export pass/fail, commit SHA, manifest hash | Package integrity |

**Conflict resolution rule:** When documents disagree, cite both and flag for founder — do not silently pick one.

---

# Canon Verification

_For each item: state answer and mark **Documented** or **Inferred**. If not in capsule: "Not documented within the current capsule."_

| Canon item | Your answer | Documented / Inferred |
|------------|-------------|------------------------|
| **Operational source of truth (status)** | | |
| **Current implementation stage** | | |
| **Current blockers (P0)** | | |
| **Collaboration roles** | | |
| **Deployment discipline** | | |
| **Core architectural principles** | | |

**Violations I must avoid:** _Explicit don'ts from blockers/handoff (e.g. resume compile repair before B2, extra deploys, silent redesign)._

---

# Questions

## High Priority

_Blocking or founder-decision required._

1. 

## Medium Priority

_Important but not blocking onboarding approval._

1. 

## Low Priority

_Nice to clarify later._

1. 

---

# Confidence Assessment

## Overall confidence

**Overall confidence:** _____ % (0–100)

## Highest confidence areas

- 

## Lowest confidence areas

- 

## Unknowns requiring clarification

- 

## Assumptions avoided

_List topics where you explicitly refused to guess and stated "not documented within the current capsule."_

- 

---

# Documentation Review

_For each observation, state certainty: **Confirmed** · **Likely** · **Possible** · **Unknown**._

## Potential inconsistencies

| Observation | Sources | Certainty (Confirmed/Likely/Possible/Unknown) |
|-------------|---------|-----------------------------------------------|
| | | |

## Outdated documents

| Path / topic | Why it may be stale | vs handoff | Certainty |
|--------------|---------------------|------------|-----------|
| | | | |

## Version mismatches

| Location | Issue | Certainty |
|----------|-------|-----------|
| | | |

## Missing documentation

| Gap | Impact | Certainty |
|-----|--------|-----------|
| | | |

## Suggested documentation improvements

| Suggestion | Rationale | Type (Fact/Inference/Recommendation) |
|------------|-----------|--------------------------------------|
| | | |

---

# Risk Assessment

**Overall risk level:** ☐ Low ☐ Medium ☐ High

| Risk | Mitigation | Certainty |
|------|------------|-----------|
| | | |

---

# Recommended Next Steps

1. 
2. 
3. 

---

# Waiting For Founder Approval

> **I have completed onboarding verification and will wait for approval before contributing.**

**Report completed by:** _AI model / session ID_  
**Date (UTC):** _YYYY-MM-DD_  
**Capsule version read:** 0.3.2 _(from MANIFEST.md)_

---

*End of ONBOARDING_REPORT — do not proceed until founder explicitly approves.*
