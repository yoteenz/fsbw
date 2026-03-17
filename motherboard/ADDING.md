# Protocol: Adding to the Motherboard

When the user says **"add to motherboard"** (in this or any past chat), follow this protocol so new context is stored **without overwriting or duplicating** existing content.

---

## Rules

1. **Append only.** Do not remove, replace, or rewrite existing sections in `CORE.md` or `MEMORY.md`. Only add new content.
2. **No duplicates.** Before adding, read the full `MEMORY.md` and `CORE.md`. If the same fact or decision is already stated, do not add it again. You may add a short cross-reference or “(see entry YYYY-MM-DD)” if useful.
3. **One entry per add.** Add exactly one new entry to `MEMORY.md` per invocation (or per significant exchange when auto-add is on). Use the format below.
4. **Full conversation context.** Every entry must reflect the **entire conversation so far** in this chat—from inception to now—not just the last message. Summarize all prompts, topics, decisions, and changes so the motherboard stays fully up to date and accurate. When in doubt, err on the side of including more context so future agents have the full picture.
5. **CORE.md updates are optional and minimal.** Only add to `CORE.md` when you have a **new, permanent** fact about design, stack, or flows that is not already there and that future agents should always see. Do not duplicate what’s already in CORE.
6. **MEMORY.md is the default place for conversation summaries.** Put learnings, one-off decisions, and “what we did in this chat” in `MEMORY.md`. Entries can be longer when summarizing a whole conversation; use bullets or short paragraphs per topic so they stay scannable.

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
- **Changes:** Files, docs, or areas touched (or "docs only"). “docs only.”
- **Conventions:** Any new pattern or preference future agents should follow.
```

Use real date (today’s date when adding). Title can be a short topic (e.g. “Admin Sync with Supabase email”, “Full conversation summary" when the entry captures the whole chat”).

---

## Auto-add (continuous) for the rest of this chat

When the user says **"add to motherboard"**, you turn on **auto-add for this conversation**. From that point on in the **same chat**:

- At the end of any **significant** exchange, add one new entry to `MEMORY.md` (same format and rules as above) **without** the user saying "add to motherboard" again.
- **Every entry must still summarize the entire conversation so far** (from chat inception to now), not just the latest turn. So each new entry is an updated “full state” of the chat: all topics, decisions, and changes to date. That keeps the motherboard fully up to date and accurate.
- **Significant** = you completed a task, made a decision, fixed a bug, added a feature, or the user learned something they might want future agents to know. Do **not** add an entry for every trivial back-and-forth (e.g. "thanks", "ok", or a single clarifying question with no outcome).
- If there’s nothing new to record in a given response, skip adding; only add when there’s something worth storing.
- If the user says **"stop adding to motherboard"** or **"don't add to motherboard anymore"**, turn off auto-add for the rest of this chat. Only add again if they explicitly say "add to motherboard" later.

---

## Checklist before adding

- [ ] Read all of `README.md`, `ADDING.md`, `CORE.md`, and `MEMORY.md`.
- [ ] Confirmed the new information is not already in `MEMORY.md` or `CORE.md`.
- [ ] Appended **one** new entry to `MEMORY.md` in the format above.
- [ ] Optionally added a small, non-duplicative update to `CORE.md` only if it’s a lasting design/stack/flow fact.
- [ ] Did not delete or overwrite existing content.
- [ ] If this was the user’s first "add to motherboard" in this chat: auto-add is now **on** for the rest of this conversation.
