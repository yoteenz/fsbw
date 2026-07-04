# Growth Network v1.0

studio os platform pillar — intelligent business growth ecosystem (not a traditional talent agency).

## Entry point

- **Growth Network:** `/admin/studio/growth-network`

## Platform-wide

Every workspace receives an auto-provisioned **growth profile** on bootstrap (`bootstrapGrowthProfiles()` in `src/workspaces/index.ts`). Privacy controls default to private — nothing public by default.

## Capabilities (v1)

| Area | Description |
|------|-------------|
| Growth Profile | Company overview, founder, niche, audience, products, revenue channels, goals, growth score |
| Company Registry | Searchable registry of creators, brands, startups, agencies, and more |
| Opportunity Engine | Matches partnerships, affiliates, sponsorships, UGC, grants, and collaborations |
| Deal Pipeline CRM | Lead → qualified → … → renewal → completed |
| Partnership Management | Brand, contact, deliverables, budget, renewal reminders |
| Contract Intelligence | Educational insights only — not legal advice |
| Revenue Center | Monthly/annual revenue, diversification score, channel breakdown |
| Growth Analytics | Engagement, audience growth, campaign performance |
| AI Recommendations | Explainable next-best actions |
| Service Marketplace | Trusted professionals by category |
| Brand Marketplace | Verified brands discover companies (owner-controlled visibility) |
| Growth Executives | CGO, Partnership Director, Revenue Strategist, Contract Analyst, and more |
| Growth Roadmap | Launch → traction → growth → scale → enterprise → legacy |

## Core modules

- `src/studio-os-core/growth-network/` — types, engine, store, executives, profile factory
- `src/hooks/useAdminStudioGrowthNetworkState.ts` — React hook
- `src/components/admin/studio/growth-network/GrowthNetworkWorkspace.tsx` — tabbed UI
- `src/utils/adminStudioGrowthNetworkDemo.ts` — demo seeds & UI config

## Integrations

- **Memory Bible** — growth strategy, partnership preferences, pricing philosophy stored in profile `memoryBibleGrowth`
- **Knowledge Graph** — nodes for Growth Network, Opportunity Engine, Deal Pipeline, Revenue Center + workflow `wf-growth-network`
- **Workspace Creation Engine** — `growth-network` auto-enabled for every provisioned workspace; promotion item `promo-growth-network-v1`
- **AI Media pilot** — reference workspace for growth feature validation before Frontal Slayer promotion

## Storage

- Platform store: `studioOs_growthNetwork_v1` (localStorage)
- Per-workspace growth profiles keyed by workspace id

## Privacy

Workspace owners control: profile visibility, registry discoverability, public profile, partnership requests, brand invitations, contact methods.
