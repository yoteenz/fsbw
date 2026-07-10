# README FIRST — AI Context Capsule v0.2

**You are opening:** `StudioOS_ContextCapsule_v0.1`  
**Purpose:** Deterministic onboarding — reconstruct project **and** founder working style in every new AI conversation  
**Capsule version:** 0.2.0  
**Generated:** 2026-07-10  
**Git reference:** see `MANIFEST.md`

---

## What this is

This folder is a **complete AI Context Capsule** — a portable briefing room for Studio OS. It is not source code. It is not a substitute for reading nothing and guessing.

Treat this package as though Studio OS generated it automatically. Every document is intentional.

**v0.2 adds:** standardized `ONBOARDING_REPORT.md`, expanded founder intelligence, canon verification, confidence scoring, and export validation — onboarding is **repeatable and measurable**, not inferred.

---

## Mandatory onboarding protocol

**Follow these steps in order. Do not skip.**

### 1. Read every document

Read **all** files in this folder, in the **Reading Order** listed in `MANIFEST.md`.

Do not skim. Do not start with the user's task. Do not assume training data is accurate for this project.

### 2. Do not begin solving problems

After reading, **do not** write code, architecture proposals, Composer prompts, or implementation plans.

Your job is **understanding first**, not action.

### 3. Complete ONBOARDING_REPORT.md exactly as provided

Open `ONBOARDING_REPORT.md` and **complete every section** using the structure already in that file.

**Do not** invent a different report format.  
**Do not** modify the report structure (headings stay as-is).  
**Complete every section.**  
If information cannot be determined from the capsule, **state why** — do not guess.  
**Do not begin implementation.**

The report includes:

- Read confirmation checklist  
- Project understanding  
- **Founder Preference Verification** (self-check against `FOUNDER_PROFILE.md`)  
- **Canon Verification** (blockers, roles, deploy discipline)  
- Questions (High / Medium / Low priority)  
- Potential inconsistencies · Outdated documentation · Risk assessment  
- **Confidence assessment** (overall %, strengths, gaps)  
- Recommended next steps  

### 4. Wait for founder approval before contributing

**Stop after completing the onboarding report.**

Do not contribute architecture, prompts, or fixes until the founder explicitly approves your understanding (e.g. "approved — proceed" or assigns a task).

End your report with the required statement in **Waiting For Founder Approval**.

---

## What you should understand after reading

| Domain | Primary files |
|--------|----------------|
| Studio OS platform | `AI_CONTEXT.md`, `PROJECT_DNA.md` |
| Studio World spatial canon | `AI_CONTEXT.md` §5, `AI_GLOSSARY.md` |
| Studio Institute | `AI_CONTEXT.md` §6, `AI_GLOSSARY.md` |
| Genesis Core | `AI_CONTEXT.md` §4, §7, `AI_GLOSSARY.md` |
| Experience Lab | `AI_CONTEXT.md` §8, `KNOWN_BLOCKERS.md` |
| World Compiler | `AI_CONTEXT.md` §9, `KNOWN_BLOCKERS.md` |
| Collaboration workflow | `CHATGPT_OPERATING_MANUAL.md`, `AI_STYLE_GUIDE.md`, `PROMPT_LIBRARY.md` |
| Founder working style | `FOUNDER_PROFILE.md` (authoritative) |
| Onboarding deliverable | `ONBOARDING_REPORT.md` (complete, do not restructure) |
| Current blockers | `KNOWN_BLOCKERS.md`, `CURRENT_HANDOFF.md` |
| Roadmap | `ROADMAP.md` |
| Decision history | `PROJECT_CHANGELOG.md` |
| Open questions | `OPEN_QUESTIONS.md` |
| Machine metadata | `context-capsule.json` |

---

## Agent roles (this project)

| Agent | Role |
|-------|------|
| **You (external AI)** | Creative Director — architecture, sprint design, prompts; **no code commits** |
| **Composer** | Cursor Cloud implementer — code, tests, one deploy per task |
| **Terra** | Governance — canon alignment before risky changes |
| **Motherboard** | Cursor in-repo memory (`motherboard/`) — separate from this capsule |

---

## North stars

> **Software preserves code. Studio OS preserves understanding.**

> **Models evolve. Studio AI persists.** (Vision — see repo `docs/studio-os/studio-ai/`)

> **No onboarding behavior should rely on inference.**

---

## Compatibility

| Platform | Import method |
|----------|---------------|
| ChatGPT | Upload **ZIP** (`StudioOS_ContextCapsule_v0.2.0.zip`) or individual `.md` files |
| Claude | Project knowledge — add extracted folder or ZIP |
| Gemini | Upload ZIP or documents |
| Cursor | Reference folder path in workspace |

**One-file download (production):**

```
https://fsbw.vercel.app/downloads/context-capsules/StudioOS_ContextCapsule_v0.2.0.zip
```

**Regenerate locally:** `npm run download:ai-context-capsule` from repo root.

Platform-neutral Markdown + `context-capsule.json` metadata. No vendor-specific required fields.

---

*End of README_FIRST — begin with MANIFEST.md, then follow Reading Order.*
