# Return Brief — Simulation1

**Service:** `buildReturnBrief(fromIso, toIso, access)` · **UI:** Return Brief tab on `/__studio-world/residents`

## Input

- Organization/world context from life OS store
- `last_seen_at` → `fromIso`, `now` → `toIso`
- Access: `isFounderPrivileged` gates `FOUNDER_PRIVILEGED` / private visibility

## Output

Event-grounded items with category, significance, founder action flag, linked event ids.

Low-significance `WORK_PROGRESS` tick noise is suppressed (significance floor).

## Status

`DEBUG_VISIBLE` — not final cinematic presentation.
