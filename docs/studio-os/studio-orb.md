# Studio Orb™ — Command Dock Reimagined

Design revision (not a new milestone). Replaces the permanently visible bottom Command Dock with **Studio Orb™** — the physical manifestation of Studio Intelligence™.

## Interaction model

| Layer | Behavior |
|-------|----------|
| **Studio Orb** | Bottom-right crystal orb (~58px) · idle breathing · ambient glow on insights |
| **Radial menu** | Tap Orb → AssistiveTouch-style menu (Command Dock · Page Guide · future slots) |
| **Conversation Mode™** | Opening Command Dock blurs/scales page (~98%) · centered acrylic panel |
| **Page Guide** | Contextual guide from Knowledge Graph / Interactive Manual |
| **Awakening Sequence™** | One-time per organization on first HQ entry |

## Code

| Path | Role |
|------|------|
| `src/components/admin/studio/studio-orb/` | Orb UI · provider · radial menu · awakening · sounds (optional, off by default) |
| `src/components/admin/studio/command-dock/CommandDock.tsx` | `CommandDockConversationPanel` — conversation-only dock |
| `AdminStudioLayout` · `StudioPlatformLayout` | `StudioOrbProvider` + `StudioOrbMount` |

## Removed clutter

- Permanently visible dock greeting bar
- Chief Concierge brief panel on every page (`StudioImmersionShell`)
- Morning arrival greeting strip (when `hideGreetingPanels`)

## Voice & sound

- `studioOrbSounds.ts` — luxury sound hooks · **disabled by default**
- **Voice Mode™** — radial menu action · `StudioOrbVoicePanel` · routes through Conversation Engine™

## Conversation Engine™

Sessions orchestrate Command Dock, Voice Mode, and future surfaces — see `conversation-engine.md`.

## Philosophy

Users say *"Ask the Orb"* — not *"open AI."* Technology disappears; Studio Intelligence feels present.
