# MANIFEST — StudioOS_ContextCapsule_v0.1

**Capsule ID:** `capsule-2026-07-10-v0.3-verification`  
**Capsule Version:** 0.3.0  
**Format:** Flat Markdown + `context-capsule.json` + `CAPSULE_VALIDATION.md` + ZIP download  
**Protocol alignment:** AI Context Protocol™ v1.0.0 + v0.3 verification onboarding

---

## Version metadata

| Field | Value |
|-------|-------|
| **Capsule Version** | 0.3.0 |
| **Project Version** | `build-a-wig@0.0.0` (see git SHA at export) |
| **Studio OS Version** | git SHA on `master` at export |
| **Generation Date** | See `CAPSULE_VALIDATION.md` |
| **Generator** | Prebuild packager + admin export |
| **Generator Version** | 0.3.0 |
| **Export Type** | full |
| **Host deployment** | Frontal Slayer / Build-a-Wig (Vercel) |

---

## Document inventory

| # | File | Purpose | Required |
|---|------|---------|----------|
| 0 | `README_FIRST.md` | Mandatory verification onboarding protocol | **Read first** |
| 1 | `MANIFEST.md` | Inventory, health, reading order | Required |
| 2 | `KNOWN_BLOCKERS.md` | P0 gates — do not violate | **Critical** |
| 3 | `CURRENT_HANDOFF.md` | Live sprint snapshot | Required |
| 4 | `FOUNDER_PROFILE.md` | Founder operating profile | Required |
| 5 | `PROJECT_DNA.md` | Philosophy and civilization traits | Required |
| 6 | `AI_CONTEXT.md` | Studio OS / World / Institute / compile stack | Required |
| 7 | `AI_GLOSSARY.md` | Canonical terminology | Required |
| 8 | `CHATGPT_OPERATING_MANUAL.md` | Creative Director role | Required |
| 9 | `AI_STYLE_GUIDE.md` | Formatting, prompts, URLs, tone | Required |
| 10 | `PROJECT_CHANGELOG.md` | Architectural decision history | Required |
| 11 | `ROADMAP.md` | Phased priorities | Required |
| 12 | `OPEN_QUESTIONS.md` | Unresolved founder decisions | Required |
| 13 | `PROMPT_LIBRARY.md` | Composer / Terra / ChatGPT templates | Required |
| 14 | `ONBOARDING_REPORT.md` | **v0.3 verification template — complete every section** | **Required** |
| — | `context-capsule.json` | Machine-readable export metadata | Required |
| — | `CAPSULE_VALIDATION.md` | Auto-generated validation page (export integrity) | Required |

**Total markdown documents for onboarding:** 15  
**Export validation fails** if any required file above is missing or version-sync checks fail.

---

## Reading order

Read in this exact sequence after `README_FIRST.md`:

1. `MANIFEST.md`
2. `KNOWN_BLOCKERS.md`
3. `CURRENT_HANDOFF.md`
4. `FOUNDER_PROFILE.md`
5. `PROJECT_DNA.md`
6. `AI_CONTEXT.md`
7. `AI_GLOSSARY.md`
8. `CHATGPT_OPERATING_MANUAL.md`
9. `AI_STYLE_GUIDE.md`
10. `PROJECT_CHANGELOG.md`
11. `ROADMAP.md`
12. `OPEN_QUESTIONS.md`
13. `PROMPT_LIBRARY.md`
14. `ONBOARDING_REPORT.md` — **review structure, then complete every section**

**Optional reference (not in reading order):** `CAPSULE_VALIDATION.md` — confirm export integrity.

**Then stop.** Submit completed report. **Do not contribute until founder approval.**

---

## Onboarding gates (v0.3)

| Gate | Requirement |
|------|-------------|
| **Compliance checklist** | All items verified in ONBOARDING_REPORT |
| **Read gate** | All files in reading order — confirm with missing/skipped list |
| **Evidence gate** | Documented vs Inferred vs Unknown labeled |
| **Source-of-truth gate** | Operational hierarchy identified — not generic "capsule is truth" |
| **Founder Understanding** | From `FOUNDER_PROFILE.md` only |
| **Canon Verification** | P0 blockers, roles, deploy discipline — tagged Documented/Inferred |
| **Confidence Assessment** | Percentage + assumptions avoided |
| **Documentation Review** | Observations tagged Confirmed/Likely/Possible/Unknown |
| **Approval gate** | Founder explicitly approves before contributions |

---

## Health status

| Score | Value | Notes |
|-------|-------|-------|
| **Completeness** | 0.97 | v0.3 verification template + validation page |
| **Freshness** | 0.95 | 2026-07-10 |
| **Consistency** | 0.94 | Version sync enforced at export |
| **Coverage** | 0.91 | Core systems + founder + source-of-truth hierarchy |
| **Confidence** | 0.94 | Suitable for deterministic onboarding test |

**Overall health:** 🟢 **Upload recommended**

---

## Export validation (automated)

Before ZIP packaging, the build validates:

- ✓ `README_FIRST.md`, `MANIFEST.md`, `ONBOARDING_REPORT.md` exist  
- ✓ Every manifest inventory entry exists on disk  
- ✓ All v0.3 ONBOARDING_REPORT required sections present  
- ✓ Reading order valid; checksum in `context-capsule.json`  
- ✓ Capsule version **0.3.0** synchronized across README, MANIFEST, AI_CONTEXT, ONBOARDING_REPORT  
- ✓ `CAPSULE_VALIDATION.md` generated with commit SHA, manifest hash, validation status  

If validation fails → **no `latest.zip` update** — errors reported to console.

---

## Compatibility notes

| Platform | Support | Notes |
|----------|---------|-------|
| ChatGPT | ✅ Primary | Upload ZIP; complete ONBOARDING_REPORT |
| Claude | ✅ Expected | Project knowledge |
| Gemini | ✅ Expected | Multi-file upload |
| Cursor | ⚠️ Partial | Prefer `motherboard/` for in-repo agents |

---

## Validation purpose

Success = new ChatGPT session reads capsule, completes v0.3 ONBOARDING_REPORT with compliance checklist, correctly identifies operational source-of-truth hierarchy, separates documented facts from inference, cites B1/B2, reports confidence % and assumptions avoided, and **waits for approval**.

---

*End of MANIFEST — StudioOS_ContextCapsule v0.3.0*
