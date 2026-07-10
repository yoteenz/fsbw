# MANIFEST — StudioOS_ContextCapsule_v0.1

**Capsule ID:** `capsule-2026-07-10-v0.2-onboarding`  
**Capsule Version:** 0.2.0  
**Format:** Flat Markdown prototype + `context-capsule.json` + ZIP download (`npm run download:ai-context-capsule`)  
**Protocol alignment:** AI Context Protocol™ v1.0.0 + v0.2 onboarding extensions

---

## Version metadata

| Field | Value |
|-------|-------|
| **Capsule Version** | 0.2.0 |
| **Project Version** | `build-a-wig@0.0.0` (see git SHA at export) |
| **Studio OS Version** | git SHA on `master` at export |
| **Generation Date** | 2026-07-10 |
| **Generator** | Prebuild packager + admin export |
| **Generator Version** | 0.2.0 |
| **Export Type** | full |
| **Host deployment** | Frontal Slayer / Build-a-Wig (Vercel) |

---

## Document inventory

| # | File | Purpose | Required |
|---|------|---------|----------|
| 0 | `README_FIRST.md` | Mandatory onboarding protocol | **Read first** |
| 1 | `MANIFEST.md` | Inventory, health, reading order | Required |
| 2 | `KNOWN_BLOCKERS.md` | P0 gates — do not violate | **Critical** |
| 3 | `CURRENT_HANDOFF.md` | Live sprint snapshot | Required |
| 4 | `FOUNDER_PROFILE.md` | Founder operating profile (v0.2 expanded) | Required |
| 5 | `PROJECT_DNA.md` | Philosophy and civilization traits | Required |
| 6 | `AI_CONTEXT.md` | Studio OS / World / Institute / compile stack | Required |
| 7 | `AI_GLOSSARY.md` | Canonical terminology | Required |
| 8 | `CHATGPT_OPERATING_MANUAL.md` | Creative Director role | Required |
| 9 | `AI_STYLE_GUIDE.md` | Formatting, prompts, URLs, tone | Required |
| 10 | `PROJECT_CHANGELOG.md` | Architectural decision history | Required |
| 11 | `ROADMAP.md` | Phased priorities | Required |
| 12 | `OPEN_QUESTIONS.md` | Unresolved founder decisions | Required |
| 13 | `PROMPT_LIBRARY.md` | Composer / Terra / ChatGPT templates | Required |
| 14 | `ONBOARDING_REPORT.md` | **Standardized onboarding template — complete every section** | **Required** |
| — | `context-capsule.json` | Machine-readable export metadata | Required |

**Total markdown documents:** 15 (including README_FIRST and MANIFEST)  
**Onboarding completeness:** Export validation **fails** if any required file above is missing.

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

**Then stop.** Submit completed report. **Do not contribute until founder approval.**

Completion of `ONBOARDING_REPORT.md` is **mandatory** before any implementation work begins.

---

## Onboarding gates (v0.2)

| Gate | Requirement |
|------|-------------|
| **Read gate** | All files in reading order — confirm in report checklist |
| **Founder Preference Verification** | Summarize working style from `FOUNDER_PROFILE.md` — no inference |
| **Canon Verification** | State P0 blockers, roles, deploy discipline from capsule |
| **Confidence Assessment** | Percentage + explicit gaps — no silent guessing |
| **Approval gate** | Founder explicitly approves before code/architecture contributions |

---

## Health status

| Score | Value | Notes |
|-------|-------|-------|
| **Completeness** | 0.96 | v0.2 onboarding template + metadata |
| **Freshness** | 0.95 | 2026-07-10 |
| **Consistency** | 0.92 | Cross-checked vs `docs/ai-collaboration/` |
| **Coverage** | 0.90 | Core systems + founder intelligence |
| **Confidence** | 0.93 | Suitable for deterministic onboarding test |

**Overall health:** 🟢 **Upload recommended**

**Export blocked:** false (when validation passes)

---

## Export validation (automated)

Before ZIP packaging, the build validates:

- ✓ Every required markdown file exists (see inventory)  
- ✓ `ONBOARDING_REPORT.md` exists  
- ✓ `context-capsule.json` exists and matches reading order checksum  
- ✓ `MANIFEST.md` capsule version matches package version  

If any required onboarding document is missing → **fail validation**, list missing files, **do not package ZIP**.

---

## Future extensibility (v0.2 design)

The onboarding pipeline supports future modules without breaking flat export compatibility:

- Knowledge quizzes · Architecture verification · Founder updates  
- Project health summary · Governance checks · Model compatibility  
- Automatic onboarding analytics  

Add new sections to `ONBOARDING_REPORT.md` or new metadata fields in `context-capsule.json` with schema version bumps — do not remove v0.2 required fields.

---

## Compatibility notes

| Platform | Support | Notes |
|----------|---------|-------|
| ChatGPT | ✅ Primary target | Upload ZIP; complete ONBOARDING_REPORT in thread or file |
| Claude | ✅ Expected | Project knowledge |
| Gemini | ✅ Expected | Multi-file upload |
| Cursor | ⚠️ Partial | Prefer `motherboard/` for in-repo agents |

**Minimum viable read:** README_FIRST → KNOWN_BLOCKERS → CURRENT_HANDOFF → FOUNDER_PROFILE → AI_CONTEXT → complete ONBOARDING_REPORT

---

## Security / redaction

- No credentials, API keys, or env secrets  
- No customer PII  
- Founder profile: collaboration traits only  
- No full motherboard MEMORY dump  

---

## Validation purpose

Success = new ChatGPT session reads capsule, **completes standardized ONBOARDING_REPORT**, correctly cites **B1/B2**, founder preferences, one-deploy-per-task, forensic-before-repair, reports confidence %, and **waits for approval**.

---

*End of MANIFEST — StudioOS_ContextCapsule v0.2.0*
