# Protocol: Adding to the Motherboard

When the user says **"add to motherboard"** (in this or any past chat), follow this protocol so new context is stored **without overwriting or duplicating** existing content.

---

## Rules

1. **Append only.** Do not remove, replace, or rewrite existing sections in `CORE.md` or `MEMORY.md`. Only add new content.
2. **No duplicates.** Before adding, read the full `MEMORY.md` and `CORE.md`. If the same fact or decision is already stated, do not add it again. You may add a short cross-reference or “(see entry YYYY-MM-DD)” if useful.
3. **One entry per “add to motherboard” request.** Add exactly one new entry to `MEMORY.md` per invocation. Use the format below.
4. **CORE.md updates are optional and minimal.** Only add to `CORE.md` when you have a **new, permanent** fact about design, stack, or flows that is not already there and that future agents should always see. Do not duplicate what’s already in CORE.
5. **MEMORY.md is the default place for conversation summaries.** Put learnings, one-off decisions, and “what we did in this chat” in `MEMORY.md`. Keep entries concise and scannable.

---

## Format for a new MEMORY.md entry

Append to the **end** of `MEMORY.md`:

```markdown
---

## YYYY-MM-DD — Short topic title

(1–2 sentences: what was decided or what this conversation added.)

- **Context:** Optional: user goal or problem.
- **Changes:** Optional: files or areas touched, or “docs only.”
- **Conventions:** Optional: any new pattern future agents should follow.
```

Use real date (today’s date when adding). Keep the topic title short (e.g. “Admin Sync with Supabase email”, “Motherboard system added”).

---

## Checklist before adding

- [ ] Read all of `README.md`, `ADDING.md`, `CORE.md`, and `MEMORY.md`.
- [ ] Confirmed the new information is not already in `MEMORY.md` or `CORE.md`.
- [ ] Appended **one** new entry to `MEMORY.md` in the format above.
- [ ] Optionally added a small, non-duplicative update to `CORE.md` only if it’s a lasting design/stack/flow fact.
- [ ] Did not delete or overwrite any existing content.
