# README FIRST — AI Context Capsule 0.3.2

> **Unified Onboarding Pack notice:** If this capsule is inside **StudioOS_OnboardingPack/**, follow the pack-level **START_HERE.md** and **MASTER_MANIFEST.md**. Do not begin or complete a separate onboarding process from this capsule alone. Use **ONBOARDING_REPORT_TEMPLATE.md** at the pack root — populate in your own words.

**You are opening:** `StudioOS_ContextCapsule_v0.1` (folder name is stable; **capsule version is 0.3.2**)  
**Purpose:** Deterministic **verification** onboarding — reconstruct project and founder working style with **minimal inference**  
**Capsule version:** 0.3.2  
**Generated:** see `CAPSULE_VALIDATION.md` and `context-capsule.json`

---

## What this is

This folder is a **complete AI Context Capsule** — a portable briefing room for Studio OS. It is not source code. It is not permission to guess.

**0.3.2 changes:** Cross-context synchronization with Motherboard — live implementation bridge (motherboard/CORE.md, motherboard/CODEBASE.md, motherboard/MEMORY.md) documented in `AI_CONTEXT.md`; Layer 1 blocker language updated to repair-shipped / verify-pending state.

**0.3.1 changes:** self-verifying export — auto-generated Read Verification, Operational Verification, and Capsule Validation footer in `CAPSULE_VALIDATION.md`. Onboarding remains a **verification process** with documented-vs-inferred labels and compliance checklist.

Check `CAPSULE_VALIDATION.md` to confirm this export passed validation (version, commit SHA, manifest hash, document count).

---

## Mandatory onboarding protocol

**Follow these steps in order. Do not skip.**

### 1. Read every document in MANIFEST order

Read **all** files listed in `MANIFEST.md` **Reading order**, in that exact sequence.

- Do not skim.  
- Do not start with the user's task.  
- Do not assume training data is accurate for this project.

### 2. Do not begin solving problems

After reading, **do not** write code, architecture proposals, Composer prompts, or implementation plans.

Your job is **verification and understanding first**, not action.

### 3. Complete the onboarding report (standalone capsule only)

**If inside the Unified Onboarding Pack:** skip this step here — use **ONBOARDING_REPORT_TEMPLATE.md** at pack root after reading MASTER_MANIFEST.

**If using this capsule alone:** open `ONBOARDING_REPORT.md` and complete every section using the structure provided — populate in your own words; do not copy blank instructional text as answers.

Required sections include:

- Onboarding Compliance Checklist  
- Read Confirmation (missing/skipped docs)  
- Project Understanding (Studio OS, World, Genesis, Institute, Experience Lab, World Compiler, stage, workflow)  
- Founder Understanding  
- **Operational Source of Truth** (document hierarchy — not "the capsule is truth")  
- Canon Verification (**Documented vs Inferred**)  
- Confidence Assessment (assumptions avoided)  
- Documentation Review (Confirmed / Likely / Possible / Unknown)  
- Waiting For Founder Approval  

### 4. Evidence-first grounding

Throughout onboarding, label statements clearly:

| Label | Meaning |
|-------|---------|
| **Documented fact** | Directly stated in a named capsule file |
| **Inference** | Reasonable conclusion — must be labeled and minimized |
| **Unknown** | Not in capsule — say so explicitly |
| **Recommendation** | Suggestion only — never present as fact |

**Never mix these categories in the same sentence without labeling.**

When uncertain: **do not infer · do not generalize · do not assume.**

### 5. Wait for founder approval before contributing

**Stop after completing the onboarding report.**

Do not contribute architecture, prompts, or fixes until the founder explicitly approves (e.g. "approved — proceed").

---

## Operational source of truth (quick reference)

| Document | Governs |
|----------|---------|
| `CURRENT_HANDOFF.md` | Current implementation status |
| `KNOWN_BLOCKERS.md` | Active blockers (P0 gates) |
| `PROJECT_DNA.md` | Architectural canon |
| `AI_CONTEXT.md` | Collaboration + system context |
| `ROADMAP.md` | Future direction |
| `OPEN_QUESTIONS.md` | Outstanding decisions |

See full hierarchy in `ONBOARDING_REPORT.md` § Operational Source of Truth.

---

## What you should understand after reading

| Domain | Primary files |
|--------|----------------|
| Studio OS platform | `AI_CONTEXT.md`, `PROJECT_DNA.md` |
| Studio World | `AI_CONTEXT.md` §5, `AI_GLOSSARY.md` |
| Studio Institute | `AI_CONTEXT.md` §6, `AI_GLOSSARY.md` |
| Genesis | `AI_CONTEXT.md` §4, §7, `AI_GLOSSARY.md` |
| Experience Lab | `AI_CONTEXT.md` §8, `KNOWN_BLOCKERS.md` |
| World Compiler | `AI_CONTEXT.md` §9, `KNOWN_BLOCKERS.md` |
| Collaboration workflow | `CHATGPT_OPERATING_MANUAL.md`, `AI_STYLE_GUIDE.md`, `PROMPT_LIBRARY.md` |
| Founder working style | `FOUNDER_PROFILE.md` (authoritative) |
| Onboarding deliverable | `ONBOARDING_REPORT.md` |
| Export integrity | `CAPSULE_VALIDATION.md`, `context-capsule.json` |

---

## Agent roles

| Agent | Role |
|-------|------|
| **You (external AI)** | Creative Director — architecture, sprint design, prompts; **no code commits** |
| **Composer** | Cursor Cloud implementer — code, tests, one deploy per task |
| **Terra** | Governance — canon alignment before risky changes |
| **Motherboard** | Cursor in-repo memory — separate from this capsule |

---

## Cross-context rules (Motherboard ↔ Onboarding Pack)

When external AI has **live repository access** after completing onboarding:

1. Read the **Motherboard bridge** — `motherboard/CORE.md`, `motherboard/CODEBASE.md`, and latest applicable `motherboard/MEMORY.md` entries
2. Reconcile with `CURRENT_HANDOFF.md`, `KNOWN_BLOCKERS.md`, and founder-provided production evidence
3. Motherboard provides **current implementation detail** — not a replacement for the onboarding manifest
4. Full onboarding remains **deterministic and manifest-driven** inside the Unified Pack
5. **Never** let historical Collaboration Intelligence or old MEMORY entries override newer operational handoff/blocker truth

Motherboard files are **not** in the 93-file required onboarding reading order. Use the concise cross-reference in `AI_CONTEXT.md` § Motherboard.

---

## North stars

> **Software preserves code. Studio OS preserves understanding.**

> **No onboarding behavior should rely on inference.**

---

## Download URLs

**Permanent (always latest validated release):**

```
https://fsbw.vercel.app/downloads/context-capsules/latest.zip
```

**Versioned (immutable):**

```
https://fsbw.vercel.app/downloads/context-capsules/StudioOS_ContextCapsule_v0.3.1.zip
```

**Regenerate locally:** `npm run download:ai-context-capsule` from repo root.

---

*End of README_FIRST — begin with MANIFEST.md, then follow Reading Order.*
