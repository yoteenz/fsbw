# Voice Mode™

**Product Phase Priority 1 · Milestone M89.2 · Module ID:** `voice-mode`

## Purpose

**Voice Mode™** enables Orb-native speech interaction — founders speak to Studio Intelligence™ instead of typing.

## Architecture

| Layer | Path |
|-------|------|
| Core | `src/studio-os-core/voice-mode/` |
| UI | `src/components/admin/studio/studio-orb/StudioOrbVoicePanel.tsx` |
| Hook | `src/hooks/useConversationEngineState.ts` (`useVoiceModeState`) |
| Radial menu | Studio Orb™ → Voice Mode action |

## Flow

1. User opens Voice Mode from Studio Orb™ radial menu
2. Conversation Engine™ starts `voice-mode` session
3. Web Speech API captures speech (when supported)
4. Final transcript routes through Command Dock™ submit pipeline
5. Studio Intelligence™ handles routing as with typed commands

## Browser support

Uses `SpeechRecognition` / `webkitSpeechRecognition` when available. Graceful fallback message when unsupported.

## Release Channel

**Preview** — per Release Channel System™ (CA-001).

## Related

- Studio Orb™ (M89.1)
- Conversation Engine™
- Command Dock™ (M82)
- Model Orchestrator™ (M123)

---
_Product Phase — specification expanded by implementation requirement._
