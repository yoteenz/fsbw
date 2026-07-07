# Organization Genome™ V1.0 (Milestone 95)

**Route:** `/admin/studio/organization-genome`

## Purpose

The **Organization Genome™** is the DNA of every organization — the permanent **identity layer** for Studio OS.

- **Profession Brain™** teaches the AI what the organization **knows**.
- **Organization Genome™** teaches the AI who the organization **is**.

Both are required for Studio OS to behave like a true extension of the business.

## What the Genome preserves

| Layer | Examples |
|-------|----------|
| Brand personality | Unique value proposition, organizational character |
| Tone of voice | Workspace brand voice, communication standards |
| Communication style | Executive-direct · warm-professional · technical-precise · story-driven · educational |
| Leadership philosophy | Founder patterns, judgment preservation |
| Core values | Charter values, wisdom from Blueprint |
| Customer experience standards | Service promise, escalation tone |
| Approval preferences | Founder-final · delegated · consensus · autonomous-with-escalation |
| Risk tolerance | Conservative · balanced · bold · experimental |
| Decision-making principles | How decisions are made, corrected, and documented |
| Design philosophy | Visual and narrative identity |
| Brand vocabulary | Approved terms for external communication |
| Internal terminology | Headquarters · Profession Brain · Digital Staff |
| Mission · Vision · Long-term objectives | From Blueprint and Organization Charter |
| **Release Channel** | Constitutional operating channel — Stable · Preview · Beta · Experimental (CA-001) |

## Release Channel (Organization Profile)

Every organization profile carries an assigned **Release Channel** per Studio OS Release Channel System™ (M127.14 / CA-001):

| Organization | Default Channel |
|--------------|-----------------|
| Frontal Slayer | Stable |
| NDXBOOK | Beta |
| Sandbox | Experimental |

Resolved via `resolveOrganizationReleaseChannel()` and stored on `OrganizationGenomeProfile.releaseChannel`.

## AI consultation

Every email, workflow, proposal, presentation, automation, Concierge response, marketing campaign, and customer interaction should **consult the Genome before generating work**.

Core API:

- `consultOrganizationGenome(profile, context)` — returns constraints, tone, vocabulary
- `formatGenomeConsultationBrief(profile, context)` — human-readable brief for AI surfaces
- Contexts: email · workflow · proposal · presentation · automation · concierge-response · marketing-campaign · customer-interaction · document · general

## Sync sources

1. **Business Discovery Blueprint™** — identity, founder, decision, wisdom, growth chapters
2. **Organization Charter** — mission, vision, values from Inauguration
3. **Workspace brand** — brandVoice, brandRules, metadata

Sync triggers:

- Blueprint upsert (`finalizeBlueprintUpdate`)
- Inauguration profile upsert
- Organization boundary activation

## Code

| Area | Path |
|------|------|
| Core | `src/studio-os-core/organization-genome/` |
| UI | `src/components/admin/studio/organization-genome/OrganizationGenomeWorkspace.tsx` |
| Page | `src/pages/admin/studio/organization-genome/page.tsx` |
| Hook | `src/hooks/useOrganizationGenomeState.ts` |
| Command Dock | `resolveOrganizationGenomeAdvice()` · proactive on Genome route |

## Relationship to Company Genome (M57)

**Company Genome** (M57) visualizes living organizational genetics across DNA layers and zoom levels.

**Organization Genome™** (M95) is the **identity governance layer** consumed by AI before generating work. Complementary — not a replacement.

## Brand voice

*"Know who you are. Reflect it everywhere."*
