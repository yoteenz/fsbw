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

**Meaning:** Append a summary of this conversation (or new facts/decisions) to the motherboard **without overwriting or duplicating** existing content.

**What to do:**

1. Read **all** of:
   - `motherboard/README.md`
   - `motherboard/ADDING.md` (protocol for adding)
   - `motherboard/CORE.md`
   - `motherboard/MEMORY.md`
2. Follow the rules in `ADDING.md` (append-only, no overwrite, no duplicate, use the required format).
3. Add **one new entry** to `MEMORY.md` (and optionally a small update to `CORE.md` only if you’re adding a new **permanent** fact about design/stack/flows that isn’t already there).
4. Do **not** remove or rewrite existing sections; only append.

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
- **"Add to motherboard"** → Read `README.md` → `ADDING.md` → `CORE.md` → `MEMORY.md`, then append one new entry to `MEMORY.md` (and optionally a small, non-duplicative update to `CORE.md`).
