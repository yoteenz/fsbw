# Studio Orb™ — Command Dock Reimagined

> **Genesis Core™ supersession (2026-07-10):** Intelligence **visual architecture** and **state ownership** for the orb are being re-architected under **Genesis Core™** / **The Genesis Orb**. Radial menu, Command Dock, Conversation Mode, Voice, and Hero Object toolbelt behavior in this doc remain current. Canonical visual/state spec: **`docs/studio-os/genesis-core/`**. Production orb swap waits on founder review of Directions A/B/C.

Design revision (not a new milestone). Replaces the permanently visible bottom Command Dock with **Studio Orb™** — the physical manifestation of Studio Intelligence™.

## Interaction model

| Layer | Behavior |
|-------|----------|
| **Studio Orb** | Bottom-right crystal orb (~58px) · idle breathing · ambient glow on insights |
| **Radial menu** | Tap Orb → AssistiveTouch-style menu (Command Dock · Page Guide · future slots) |
| **Conversation Mode™** | Opening Command Dock blurs/scales page (~98%) · centered acrylic panel |
| **Page Guide** | Contextual guide from Knowledge Graph / Interactive Manual |
| **Awakening Sequence™** | One-time per organization on first HQ entry |
| **Contextual Hero Object Toolbelt™** | Orb surfaces the five most relevant Hero Objects™ for the founder's current location |

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

## ARTICLE-D09 — Contextual Orb™

The Orb should not behave like a static app launcher.

Per **ARTICLE-D09 — Hero Objects™ & Contextual Orb™**, the Orb becomes an adaptive toolbelt that surfaces living, collectible Hero Objects™ based on current location and work context.

Examples:

- Command Center™ → World Atlas Globe™ · Mission Control Console™ · Daily Brief Lens™ · Knowledge Core Crystal™ · Production Board Slate™
- Creative Direction Studio™ → Story Table Relic™ · Mood Wall Prism™ · Studio Foundry Crucible™ · Asset Registry Vault™ · Golden Review Marquee™
- Warehouse Wing™ → Generation Bay Engine™ · Materials Library Tower™ · Blueprint Archive Scroll™ · Marketplace Pavilion Arch™ · Hero Object Vault™

**Rule:** Future Orb navigation should render Hero Objects™ as living artifacts, never as flat software icons.

## Philosophy

Users say *"Ask the Orb"* — not *"open AI."* Technology disappears; Studio Intelligence feels present.
