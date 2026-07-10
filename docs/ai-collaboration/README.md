# AI Collaboration Layer — ChatGPT Operating Manual™

**Purpose:** Permanent onboarding bridge between the founder and every future ChatGPT (or other AI) conversation.

This folder is **separate from**:

| Canon | Location | Role |
|-------|----------|------|
| Studio OS Bible | `docs/studio-os/` | Product architecture |
| Genesis documentation | `docs/studio-os/genesis/` | Constitutional platform design |
| Cursor / agent context | `motherboard/`, `AGENTS.md` | In-repo agent memory |
| Company documentation | `docs/frontal-slayer/`, brand docs | Organization-specific |

This folder documents **how the founder and AI collaborate** — not what Studio OS is alone.

---

## Read order for a brand-new ChatGPT conversation

Follow **`NEW_CHAT_CHECKLIST.md`** exactly.

| Step | Document | Time |
|------|----------|------|
| 1 | [CHATGPT_OPERATING_MANUAL.md](./CHATGPT_OPERATING_MANUAL.md) | ~10 min |
| 2 | [AI_STYLE_GUIDE.md](./AI_STYLE_GUIDE.md) | ~5 min |
| 3 | [AI_CONTEXT.md](./AI_CONTEXT.md) | ~10 min |
| 4 | [CURRENT_HANDOFF.md](./CURRENT_HANDOFF.md) | ~3 min |
| 5 | Confirm understanding | — |

Reference as needed:

- [AI_CONTEXT_PROTOCOL_SPECIFICATION.md](./AI_CONTEXT_PROTOCOL_SPECIFICATION.md) — **canonical** institutional memory transfer standard
- [protocol/README.md](./protocol/README.md) — protocol module index (bootstrap, health, graph, canon, …)
- [AI_CONTEXT_CAPSULE_SPECIFICATION.md](./AI_CONTEXT_CAPSULE_SPECIFICATION.md) — portable AI OS implementation (`.studiocapsule`)
- [AI_GLOSSARY.md](./AI_GLOSSARY.md) — canonical terminology
- [AI_CHANGELOG.md](./AI_CHANGELOG.md) — decision history
- [PROMPT_TEMPLATES.md](./PROMPT_TEMPLATES.md) — reusable prompt structures
- [EXPORT_SPECIFICATION.md](./EXPORT_SPECIFICATION.md) — v1 flat export appendix
- [schemas/manifest.v2.schema.json](./schemas/manifest.v2.schema.json) — manifest v2 JSON Schema
- [schemas/manifest.v3.schema.json](./schemas/manifest.v3.schema.json) — manifest v3 + protocol modules

---

## Maintenance strategy

| File | Update frequency | Owner | Trigger |
|------|------------------|-------|---------|
| `CURRENT_HANDOFF.md` | Every sprint / blocker change | Founder or completing agent | Sprint start/end, P0 fix, architecture decision |
| `AI_CHANGELOG.md` | Each significant decision | Completing agent | Append-only entry with date, reason, impact |
| `AI_CONTEXT.md` | Monthly or at milestone | Founder review | Roadmap shift, new product layer, canon addition |
| `AI_GLOSSARY.md` | When new canon term ships | Founder + agent | New ™ term enters production or bible |
| `CHATGPT_OPERATING_MANUAL.md` | Rarely | Founder | Collaboration philosophy change |
| `AI_STYLE_GUIDE.md` | Occasionally | Founder | New formatting or communication preference |
| `PROMPT_TEMPLATES.md` | As patterns emerge | Founder | Reusable prompt proven in 3+ sprints |

**Rule:** Never contradict Studio OS / Genesis bibles without explicit founder approval and a changelog entry explaining supersession.

---

## Export: AI Context Capsule™

Portable **single-file** AI operating system (`.studiocapsule`). Canonical architecture: [AI_CONTEXT_CAPSULE_SPECIFICATION.md](./AI_CONTEXT_CAPSULE_SPECIFICATION.md).

| Phase | Delivery |
|-------|----------|
| Now | Spec + source docs + flat CLI export |
| Next | `.studiocapsule` ZIP + manifest v2 |
| Future | HQ → Studio Archive → Knowledge Management → Export button |

Future triggers: milestone complete, sprint finish, release, founder says **"Export AI Context Capsule."**

---

## Version

| Field | Value |
|-------|-------|
| Package version | 3.0.0 (protocol spec) / Capsule v2 layout + v3 target |
| Created | 2026-07-10 |
| Maintainer | Founder + Studio OS agents |
