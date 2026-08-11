# Protocol: Adding to the Motherboard

When the user says **"add to motherboard"** (in this or any past chat), follow this protocol so new context is stored **without overwriting or duplicating** existing content. Adding from an old chat only appends a historical entry; current context is CORE + CODEBASE + latest MEMORY.

---

## Rules

0. **Sync after tasks; deploy on command.** After completing a user-requested task, run **`./scripts/agent-commit.sh --sync-only "message"`** (GitHub sync; Vercel skipped). **Only use `--deploy-now`** when the founder says **"deploy now"**.

0b. **MEMORY auto-add is ON by default.** Append **`MEMORY.md`** after completed tasks. Include MEMORY in the same **`--sync-only`** commit when possible.

1. **Append only.** Do not remove, replace, or rewrite existing sections in `CORE.md` or `MEMORY.md`. Only add new content.
2. **No duplicates.** Before adding, read the full `MEMORY.md` and `CORE.md`. If the same fact or decision is already stated, do not add it again. You may add a short cross-reference or "(see entry YYYY-MM-DD)" if useful.
3. **One entry per add.** Add exactly one new entry to `MEMORY.md` per **"add to motherboard"** invocation (or when batching into deploy). Use the format below.
4. **Full conversation context.** Every entry must reflect the **entire conversation so far** in this chat—from inception to now—not just the last message. Summarize all prompts, topics, decisions, and changes so the motherboard stays fully up to date and accurate. When in doubt, err on the side of including more context so future agents have the full picture.
5. **CORE.md updates are optional and minimal.** Only add to `CORE.md` when you have a **new, permanent** fact about design, stack, or flows that is not already there and that future agents should always see. Do not duplicate what's already in CORE.
6. **MEMORY.md is the default place for conversation summaries.** Put learnings, one-off decisions, and "what we did in this chat" in `MEMORY.md`. Entries can be longer when summarizing a whole conversation; use bullets or short paragraphs per topic so they stay scannable.
7. **Sync (default):** **`./scripts/agent-commit.sh --sync-only "message"`** after tasks. **Deploy:** **`--deploy-now`** only when founder says deploy now.

---

## Format for a new MEMORY.md entry

Append to the **end** of `MEMORY.md`. Each entry must summarize the **entire conversation in this chat so far** (all prompts, topics, decisions, changes from the start to now), not only the most recent exchange.

```markdown
---

## YYYY-MM-DD — Short topic title (or "Full conversation summary")

Summary of the **whole conversation so far** in this chat: user goals, what was discussed, what was decided, what was built or changed, and any conventions or preferences stated. Use bullets or short paragraphs so it's scannable. When the conversation is long, include each major topic/decision/change so the motherboard has full context and accuracy.

- **Context:** User's initial goal(s) or problem(s) for this chat.
- **Topics covered:** Key prompts and themes (from start to now).
- **Decisions / outcomes:** What was agreed or decided.
- **Changes:** Files, docs, or areas touched (or "docs only").
- **Conventions:** Any new pattern or preference future agents should follow.
```

Use real date (today's date when adding). Title can be a short topic (e.g. "Admin Sync with Supabase email") or "Full conversation summary" when the entry captures the whole chat.

---

## Auto-add is on by default

Append to **`MEMORY.md`** at the end of any exchange where you completed a user-requested task (code change, fix, feature, or decision). **Do not skip** because the change was small. Only skip when there is nothing to record (thanks/ok, clarifying Q with no code or decision).

- **Every entry must summarize the entire conversation so far** (from chat inception to now), not just the latest turn.
- **"Add to motherboard"** = append one entry now + re-enable auto-add if the user had said **"stop adding to motherboard"**.
- **When to skip:** Q&A with no request to record, "thanks"/"ok", or when the founder said **"stop adding to motherboard"**.
- **Never commit or push** because of a MEMORY update alone unless you are syncing the batch with **`--sync-only`** or deploying with **`--deploy-now`**.

---

## Checklist before adding

- [ ] Read all of `README.md`, `ADDING.md`, `CORE.md`, and `MEMORY.md`.
- [ ] Confirmed the new information is not already in `MEMORY.md` or `CORE.md`.
- [ ] Appended **one** new entry to `MEMORY.md` in the format above.
- [ ] Optionally added a small, non-duplicative update to `CORE.md` only if it's a lasting design/stack/flow fact.
- [ ] Did not delete or overwrite existing content.
- [ ] **Did not use `--deploy-now`** unless the founder said **"deploy now"**.
- [ ] After tasks: **`./scripts/agent-commit.sh --sync-only "message"`** when shipping work.
