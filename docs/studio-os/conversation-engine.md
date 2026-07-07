# Conversation Engine™

**Product Phase Priority 1 · Milestone M89.3 · Module ID:** `conversation-engine`

## Purpose

**Conversation Engine™** orchestrates Studio Orb™ surfaces, Command Dock™ sessions, and Voice Mode™ into unified conversation sessions with turn history.

## Architecture

| Layer | Path |
|-------|------|
| Core | `src/studio-os-core/conversation-engine/` |
| Hook | `src/hooks/useConversationEngineState.ts` |
| Orb integration | `StudioOrbProvider` — session start/end on surface open/close |

## Surfaces

- `command-dock` — Conversation Mode™ acrylic panel
- `voice-mode` — Voice Mode™ speech panel
- `page-guide` — reserved for guided conversation flows

## Session model

Each organization maintains active conversation sessions with turns (`user` · `assistant` · `system`), capped for storage efficiency.

## Release Channel

**Preview** — per Release Channel System™ (CA-001).

## Related

- Studio Orb™ (M89.1)
- Voice Mode™ (M89.2)
- Conversation Mode™ (M89.3)
- Command Dock™ (M82)

---
_Product Phase — specification expanded by implementation requirement._
