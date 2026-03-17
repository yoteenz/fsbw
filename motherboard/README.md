# Motherboard — Core Memory for Build-a-Wig

**Location:** This folder is `motherboard/` at the project root (not a single file named "motherboard"). Do **not** create a file `MOTHERBOARD.md` or `Motherboard.md` at project root—this folder and its existing files are the only motherboard.

The **motherboard** is a shared, persistent context store for all agents (past, current, future) working on this project. It holds project design, logic, flows, conventions, and learnings so you don’t have to repeat yourself and agents stay aligned.

A Cursor rule (`.cursor/rules/motherboard.mdc`) is set to **always apply**, so agents in this project will recognize **“load motherboard”** and **“add to motherboard”** without further explanation.

---

## Auto-load and when you need to prompt

- **New chats:** The Cursor rule tells the agent to treat the motherboard as **auto-loaded** at the start of each new conversation. So you do **not** need to say "load motherboard" in every new chat—the agent is instructed to read and use README, CORE, CODEBASE, and MEMORY at conversation start.
- **"Load motherboard":** Say it when you want the agent to **re-read** those files and refresh context (e.g. after you've updated the motherboard).
- **"Add to motherboard":** Auto-add is **on by default** for every new chat—the agent adds to MEMORY at the end of significant exchanges without you saying it. Saying "add to motherboard" adds **one entry now** (and re-enables auto-add if you had said "stop adding to motherboard" earlier).

**Adding from old chats:** If you add to the motherboard from an old chat (e.g. 30 days old), that only **appends** a new entry—it does **not** overwrite or remove existing entries. The new entry is a historical record of that past conversation. For current context, agents should treat **CORE + CODEBASE + the latest MEMORY entries** as the source of truth; older MEMORY entries are timeline/history.

---

## Commands (no extra explanation needed)

### "Load motherboard" (optional; new chats auto-load)

**Meaning:** Re-read the motherboard and refresh context.

**What to do:**

1. Read **all** of these files in order:
   - `motherboard/README.md` (this file)
   - `motherboard/CORE.md` (design, stack, flows, conventions)
   - `motherboard/CODEBASE.md` (current codebase structure and key paths)
   - `motherboard/MEMORY.md` (conversation learnings and decisions)
2. Use this context as the source of truth for how the site works, how it’s styled, and how to add or change features.
3. Prefer patterns and conventions described here; only deviate when the user explicitly asks.

---

### "Add to motherboard"

**Meaning:** Append **one entry** to the motherboard now. (Auto-add is already on by default for every new chat; if the user had said "stop adding to motherboard" earlier, this also re-enables auto-add for the rest of this chat.)

**What to do:**

1. Read **all** of:
   - `motherboard/README.md`
   - `motherboard/ADDING.md` (protocol for adding)
   - `motherboard/CORE.md`
   - `motherboard/MEMORY.md`
2. Follow the rules in `ADDING.md` (append-only, no overwrite, no duplicate, use the required format).
3. Add **one new entry** to `MEMORY.md` now. The entry must summarize the **entire conversation so far** in this chat (all prompts, topics, decisions, and changes from inception to now), not just the last message—so the motherboard stays fully up to date and accurate. Optionally add a small update to `CORE.md` only if you’re adding a new **permanent** fact about design/stack/flows that isn’t already there.
4. Do **not** remove or rewrite existing sections; only append.

**If the user says "stop adding to motherboard" or "don't add to motherboard anymore":** Turn off auto-add for the rest of this chat; only add again if they explicitly say "add to motherboard" later.

---

### "Snapshot codebase to motherboard"

**Meaning:** Capture the **current state of the entire codebase** (structure, entry points, key paths, conventions) into the motherboard so new agents have accurate codebase context without the user revisiting every past chat.

**What to do:**

1. Explore the repo: list key folders (`src/`, `api/`, `public/`, `docs/`), main entry points (`src/main.tsx`, `src/App.tsx`), page routes under `src/pages/`, API routes under `api/`, shared code in `src/utils/` and `api/_lib/`, and config/env files.
2. Write or **overwrite** `motherboard/CODEBASE.md` with a structured summary: repo layout, frontend structure (pages, components, utils), backend structure (API routes, _lib), config and env, and when to refresh. Use the existing `CODEBASE.md` format as a template; update section content to match the current codebase.
3. Do **not** modify MEMORY.md or CORE.md for this command. CODEBASE.md is the only file that gets updated; it is overwritten (not appended) so it always reflects the latest snapshot.

**When the user might say this:** After major refactors, when onboarding a new agent, or when they want the motherboard to reflect "the project as it stands now" without re-running every old conversation.

---

## File roles

| File | Purpose |
|------|--------|
| `README.md` | This file. Explains all motherboard commands. |
| `CORE.md` | Stable project context: stack, design system, key flows, conventions. |
| `CODEBASE.md` | **Current codebase snapshot** (structure, paths). Refreshed by "Snapshot codebase to motherboard." |
| `MEMORY.md` | Append-only log of conversation summaries and one-off decisions. |
| `ADDING.md` | Protocol for how to add entries (format, deduplication, no overwrite). |

For **profiles table and sync** (name, photo, socials, birthday, rewards): see `docs/PROFILES_COLUMNS_AND_APP_MAPPING.md`.

---

## Quick reference for agents

- **"Load motherboard"** → Read `README.md` → `CORE.md` → `CODEBASE.md` → `MEMORY.md` and use that context.
- **"Add to motherboard"** → Add one entry now (per ADDING.md) and **enable auto-add for this chat**; thereafter add at the end of significant exchanges without being asked again. **"Stop adding to motherboard"** → disable auto-add for this chat.
- **"Snapshot codebase to motherboard"** → Explore the repo and overwrite `motherboard/CODEBASE.md` with a structured summary of the current codebase so the motherboard has accurate, up-to-date code context.
