# Marketplace + Business Ecosystem v1.0

studio os platform pillar — professional operating network for modern businesses.

## Entry point

- **Marketplace:** `/admin/studio/marketplace`

## Design principle

**Not a freelancer marketplace.** Studio OS becomes the professional operating network where businesses launch, operate, discover opportunities, collaborate, and grow. The goal is **lasting partnerships**, not isolated one-off gigs.

## Capabilities (v1)

| Area | Description |
|------|-------------|
| Participant Profiles | Brands, creators, agencies, photographers, editors, developers, lawyers, manufacturers, fulfillment, and more |
| Profile Fields | Portfolio, services, industries, pricing, availability, verification, reviews, completed projects, performance history, workspace + KG connections |
| Intelligent Matching | Company DNA, Creative DNA, Memory Bible, Knowledge Graph, Growth Network, performance, audience fit, industry, budget, goals — compatibility score + explanation |
| Deal Center | Discovery → introduction → meeting → proposal → negotiation → contract → production → approval → delivery → invoice → payment → renewal → relationship history |
| Collaboration Hub | Per-deal workspace: messages, files, deliverables, timelines, approvals, contracts, payments, meeting notes, activity feed, AI recommendations |
| Trust System | Responsiveness, completion rate, quality, timeliness, satisfaction, communication, repeat business, platform history → trust score |
| Verification | Identity, business, brand, portfolio, workspace — visible badges |
| Pricing | Hourly, fixed, retainer, commission, royalty, licensing, revenue share, custom |
| Payments | Architecture for milestone, escrow, invoices, partial, tips, refunds, payouts — **no live processing in v1** |
| Business Ecosystem | Recommend relationships before search — creator↔editor↔photographer↔brand↔manufacturer chains |

## Admin dashboard tabs (14)

Overview · Participants · Matching · Deal Center · Collaboration · Trust · Verification · Pricing · Payments · Ecosystem · Relationships · Reviews · Active Deals · History

## Core modules

- `src/studio-os-core/marketplace/` — types, constants, store, trust score, matching engine, ecosystem engine
- `src/workspaces/ai-media/marketplace/bootstrap.ts` — AI Media demo participants, deals, collaboration hubs, payment records
- `src/hooks/useAdminStudioMarketplaceState.ts` — React hook
- `src/components/admin/studio/marketplace/MarketplaceWorkspace.tsx` — tabbed UI
- `src/utils/adminStudioMarketplaceDemo.ts` — demo config

## Integrations

- **Talent Network** — talent profiles feed marketplace participants
- **Growth Network** — opportunities feed deal center pipeline
- **Knowledge Graph** — nodes for Marketplace, Deal Center, Collaboration Hub + workflow `wf-marketplace`
- **Memory Bible** — naming entry + decision `dec-marketplace-v1`
- **Workspace Creation Engine** — `marketplace` module; promotion item `promo-marketplace-v1`

## Storage

- Platform store: `studioOsMarketplace_v1` (localStorage)
- Demo workspace: `ai-media`

## Future vision

Every new participant strengthens the ecosystem for everyone else. Studio OS becomes where businesses build lasting partnerships — not where they complete isolated freelance jobs.
