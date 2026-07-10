# New Chat Checklist — ChatGPT Onboarding

Use this at the **start of every brand-new AI conversation** (ChatGPT, Claude, or any external assistant). In-repo Cursor agents use `motherboard/` instead; this checklist is for **external** AI collaboration.

---

## Step 1 — Load context (choose one path)

### Path A — AI Context Capsule™ (preferred)

Upload **`StudioOS_ContextCapsule_v*.studiocapsule`** to the AI platform.

The importer follows `Manifest/manifest.json` → `readOrder[]` (see [AI_CONTEXT_CAPSULE_SPECIFICATION.md](./AI_CONTEXT_CAPSULE_SPECIFICATION.md)).

Until `.studiocapsule` export ships: run `npm run export:ai-context-capsule` and upload the generated `.md` or paste executive sections.

**If Path A with a full capsule:** Steps 2–4 below are satisfied by the capsule `readOrder` — proceed to Step 5.

### Path B — Manual read (fallback)

Open and read in full:

**`docs/ai-collaboration/CHATGPT_OPERATING_MANUAL.md`**

Understand: communication philosophy, sprint workflow, architecture vs implementation boundaries, escalation.

---

## Step 2 — Read the Style Guide

Open and read in full:

**`docs/ai-collaboration/AI_STYLE_GUIDE.md`**

Understand: formatting rules, code-block conventions, URL presentation, explanation style, verification expectations.

---

## Step 3 — Read Project Context

Open and read in full:

**`docs/ai-collaboration/AI_CONTEXT.md`**

Understand: current vision, products, architecture layers, roadmap, blockers, canonical terminology overview.

---

## Step 4 — Read Current Handoff

Open and read in full:

**`docs/ai-collaboration/CURRENT_HANDOFF.md`**

Understand: active sprint, current blocker, latest decisions, immediate next priorities.

This file changes frequently — always prefer it over older chat memory.

---

## Step 5 — Confirm understanding

Before continuing any work, respond with:

> **I understand the current architecture and workflow.**

Then briefly restate (3–5 bullets):

1. Current sprint / priority
2. Active blocker (if any)
3. What is **in scope** vs **out of scope** for this conversation
4. Which agent role applies (Composer = implementation, Terra = governance/review, ChatGPT = creative director / architecture partner)
5. Verification expectation for this session

---

## Optional — deep reference

| Need | Read |
|------|------|
| Term definition | `AI_GLOSSARY.md` |
| Why a decision was made | `AI_CHANGELOG.md` |
| Copy-paste prompt structure | `PROMPT_TEMPLATES.md` |
| Full portable bundle | Run **Export AI Context Capsule™** (see `EXPORT_SPECIFICATION.md`) |

---

## Do not skip

Skipping Steps 1–4 causes the AI to rebuild months of context from scratch, contradict canon, or propose work that conflicts with active P0 blockers.

---

## After the conversation

If the session produced a **decision**, **blocker change**, or **completed sprint**:

1. Update `CURRENT_HANDOFF.md`
2. Append `AI_CHANGELOG.md`
3. Update `AI_GLOSSARY.md` only if a new canonical term was introduced

The founder or completing Cursor agent performs these updates — ChatGPT should **propose** diffs, not assume they were written.
