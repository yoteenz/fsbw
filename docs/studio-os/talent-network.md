# Talent Network v1.0

studio os platform pillar — unified talent operating system for AI and human talent.

## Entry point

- **Talent Network:** `/admin/studio/talent-network`

## Design principle

AI talent and human talent are **not separate systems**. They share one registry, one casting model, one wardrobe manager, one contract layer, and one performance score — only `talentType` differs.

The legacy **Talent Agency** (`/admin/studio/talent-agency`) remains the Frontal Slayer casting department and is **not** replaced by this module.

## Capabilities (v1)

| Area | Description |
|------|-------------|
| Talent Registry | Centralized profiles — id, names, type, workspace, status, bio, portfolio, contact, representation, availability, verified, onboarding |
| Talent Types | ai-presenter, human-creator, actor, voice-actor, model, photographer, videographer, editor, designer, developer, writer, producer, creative-director, executive, contractor, assistant, custom |
| AI Talent Profiles | Appearance, voice, personality, wardrobe, models, topics, Creative DNA version, brand restrictions |
| Wardrobe Manager | Reusable looks — business, casual, luxury, medical, fitness, technology, formal, streetwear, seasonal, holiday, custom |
| Casting System | Host, co-host, expert, narrator, guest, background, voiceover, interviewer, moderator — multiple talent per production |
| Series Assignment | Shows, series, campaigns, brands, episodes — recurring hosts supported |
| Performance Analytics | Views, watch time, retention, engagement, revenue, brand safety, sentiment |
| Talent Score | Dynamic overall score from retention, trust, engagement, brand fit, consistency, revenue, professionalism, availability, growth |
| Audience Intelligence | Best demographics, platforms, pillars, publishing times, voice, wardrobe, hooks, collaborations |
| Character Evolution | Version history for AI personalities — appearance, voice, wardrobe, personality, Creative DNA — no overwrites |
| Growth Network Bridge | Talent recommendations from Growth Network (presenter match, expert need, photographer need, series host fit) |
| Contract Management | Rates, deliverables, exclusivity, usage rights, payment history, renewals |
| Human Onboarding | Same workflow as AI — bio, platforms, portfolio, rates, audience, niche, goals, verification |

## Admin dashboard tabs (14)

Overview · Active Productions · Performance · Analytics · Wardrobe · Contracts · Earnings · Campaigns · Availability · Growth · Auditions · Casting · History · Versioning

## Core modules

- `src/studio-os-core/talent-network/` — types, constants, store, talent score, growth bridge
- `src/workspaces/ai-media/talent-network/bootstrap.ts` — AI Media demo seeds (Maya Chen, Alex Rivera, Jordan Kim + human crew)
- `src/hooks/useAdminStudioTalentNetworkState.ts` — React hook
- `src/components/admin/studio/talent-network/TalentNetworkWorkspace.tsx` — tabbed UI
- `src/utils/adminStudioTalentNetworkDemo.ts` — demo config

## Integrations

- **Knowledge Graph** — nodes for Talent Network, Talent Registry, demo talent (Maya Chen) + workflow `wf-talent-network`
- **Memory Bible** — naming entry + decision `dec-talent-network-v1`
- **Growth Network** — `buildGrowthTalentRecommendations()` feeds talent match suggestions
- **AI Media Network** — demo hosts linked to Money Monday, Truth Tuesday, Future Friday shows
- **Studio OS Labs** — performance signals feed talent analytics (future connector)
- **Workspace Creation Engine** — `talent-network` module; promotion item `promo-talent-network-v1`

## Storage

- Platform store: `studioOsTalentNetwork_v1` (localStorage)
- Demo workspace: `ai-media`

## Future vision

Talent Network becomes the operating system for all talent — AI presenters, influencers, photographers, signed creators, agencies, and production teams — inside one unified ecosystem.
