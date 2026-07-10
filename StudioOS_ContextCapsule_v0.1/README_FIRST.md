# README FIRST — AI Context Capsule v0.1

**You are opening:** `StudioOS_ContextCapsule_v0.1`  
**Purpose:** Institutional memory for onboarding any AI into Studio OS / Frontal Slayer collaboration  
**Capsule version:** 0.1.0 (manual prototype)  
**Generated:** 2026-07-10  
**Git reference:** `3b8fb4fa7`

---

## What this is

This folder is a **complete AI Context Capsule** — a portable briefing room for Studio OS. It is not source code. It is not a substitute for reading nothing and guessing.

Treat this package as though Studio OS generated it automatically. Every document is intentional.

---

## Mandatory onboarding protocol

**Follow these steps in order. Do not skip.**

### 1. Read every document

Read **all** files in this folder, in the **Reading Order** listed in `MANIFEST.md`.

Do not skim. Do not start with the user's task. Do not assume training data is accurate for this project.

### 2. Do not begin solving problems

After reading, **do not** write code, architecture proposals, Composer prompts, or implementation plans.

Your job is **understanding first**, not action.

### 3. Generate an onboarding report

Produce a structured onboarding report containing:

- **Understanding summary** — Studio OS, Studio World, Institute, Genesis, Experience Lab, World Compiler, collaboration workflow, founder style, blockers, roadmap, philosophy
- **Questions** — blocking questions first; label priority
- **Potential inconsistencies** — between documents or vs your prior knowledge
- **Outdated documentation** — anything that looks stale vs `CURRENT_HANDOFF.md`
- **Risk assessment** — what you must not do without founder approval
- **Recommended next steps** — ordered, with owners (founder / ChatGPT / Composer / Terra)
- **Read confirmation** — list every file read; note any skipped

Use the format implied by AI Context Protocol onboarding report (see repo: `docs/ai-collaboration/protocol/ONBOARDING_REPORT.md`).

### 4. Wait for founder approval before contributing

**Stop after the onboarding report.**

Do not contribute architecture, prompts, or fixes until the founder explicitly approves your understanding (e.g. "approved — proceed" or assigns a task).

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
| Founder working style | `FOUNDER_PROFILE.md` |
| Current blockers | `KNOWN_BLOCKERS.md`, `CURRENT_HANDOFF.md` |
| Roadmap | `ROADMAP.md` |
| Decision history | `PROJECT_CHANGELOG.md` |
| Open questions | `OPEN_QUESTIONS.md` |

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

---

## Compatibility

| Platform | Import method |
|----------|---------------|
| ChatGPT | Upload all `.md` files or paste README_FIRST + read order |
| Claude | Project knowledge — add entire folder |
| Gemini | Upload documents |
| Cursor | Reference folder path in workspace |

Platform-neutral Markdown only. No vendor-specific required fields.

---

*End of README_FIRST — begin with MANIFEST.md, then follow Reading Order.*
