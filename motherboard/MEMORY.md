# Memory — Conversation learnings and decisions

Append-only log. Each entry is from a user request to “add to motherboard.” Do not remove or edit existing entries.

---

## 2025-03-15 — Motherboard system created

Shared “core memory” for all agents: `motherboard/` holds project context and conversation learnings. Commands: **“load motherboard”** = read README → CORE → MEMORY and use as context; **“add to motherboard”** = read ADDING.md and append one new entry to MEMORY (and optionally a small CORE update) without overwriting or duplicating.

- **Context:** User wanted a single place for design/logic/flows and a way for past/future chats to contribute without repeating themselves.
- **Changes:** Created `motherboard/README.md`, `CORE.md`, `ADDING.md`, `MEMORY.md`.
- **Conventions:** Agents should read motherboard when user says “load motherboard”; when user says “add to motherboard,” follow ADDING.md and append only.
