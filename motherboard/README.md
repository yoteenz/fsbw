# Motherboard — Core Memory for Build-a-Wig

The **motherboard** is a shared, persistent context store for all agents (past, current, future) working on this project. It holds project design, logic, flows, conventions, and learnings so you don’t have to repeat yourself and agents stay aligned.

A Cursor rule (`.cursor/rules/motherboard.mdc`) is set to **always apply**, so agents in this project will recognize **“load motherboard”** and **“add to motherboard”** without further explanation.

---

## Commands (no extra explanation needed)

### "Load motherboard"

**Meaning:** Read the motherboard to get full project context before making changes.

**What to do:**

1. Read **all** of these files in order:
   - `motherboard/README.md` (this file)
   - `motherboard/CORE.md` (design, stack, flows, conventions)
   - `motherboard/MEMORY.md` (conversation learnings and decisions)
2. Use this context as the source of truth for how the site works, how it’s styled, and how to add or change features.
3. Prefer patterns and conventions described here; only deviate when the user explicitly asks.

---

### "Add to motherboard"

**Meaning:** (1) Append a summary of this conversation (or new facts/decisions) to the motherboard now, and (2) **enable auto-add for the rest of this chat** — from this point on, you will automatically add to the motherboard at the end of **significant** exchanges without the user having to say it again.

**What to do (first time in this chat):**

1. Read **all** of:
   - `motherboard/README.md`
   - `motherboard/ADDING.md` (protocol for adding)
   - `motherboard/CORE.md`
   - `motherboard/MEMORY.md`
2. Follow the rules in `ADDING.md` (append-only, no overwrite, no duplicate, use the required format).
3. Add **one new entry** to `MEMORY.md` now. The entry must summarize the **entire conversation so far** in this chat (all prompts, topics, decisions, and changes from inception to now), not just the last message—so the motherboard stays fully up to date and accurate. Optionally add a small update to `CORE.md` only if you’re adding a new **permanent** fact about design/stack/flows that isn’t already there.
4. Do **not** remove or rewrite existing sections; only append.
5. **Remember for this chat:** Auto-add is now **on**. For the rest of this conversation, at the end of any **significant** exchange (see ADDING.md), add one new entry to `MEMORY.md` without the user saying "add to motherboard" again. Each of those entries must also summarize the **entire conversation so far**, not just the latest turn.

**If the user says "stop adding to motherboard" or "don't add to motherboard anymore":** Turn off auto-add for the rest of this chat; only add again if they explicitly say "add to motherboard" later.

---

## File roles

| File | Purpose |
|------|--------|
| `README.md` | This file. Explains "load motherboard" and "add to motherboard." |
| `CORE.md` | Stable project context: stack, design system, key flows, conventions. |
| `MEMORY.md` | Append-only log of conversation summaries and one-off decisions. |
| `ADDING.md` | Protocol for how to add entries (format, deduplication, no overwrite). |

---

## Quick reference for agents

- **"Load motherboard"** → Read `README.md` → `CORE.md` → `MEMORY.md` and use that context.
- **"Add to motherboard"** → Add one entry now (per ADDING.md) and **enable auto-add for this chat**; thereafter add at the end of significant exchanges without being asked again. **"Stop adding to motherboard"** → disable auto-add for this chat.
