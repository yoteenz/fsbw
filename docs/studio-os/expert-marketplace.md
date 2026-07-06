# Expert Marketplace™ (Milestone 92)

Where organizations publish approved portions of their **Profession Brain™** for customers, professionals, businesses, and learners — not AI bots.

## Philosophy

- Organizations transform expertise into **products**.
- Private operational knowledge is **never** exposed without explicit approval.
- Organizations retain **ownership and control** over all publications.

Official contextual voice: **Share expertise. Expand your legacy.**

## Expert profiles

Every published Profession Brain generates an **Expert Profile** with:

Expert name · organization · creator · years of experience · industries · specialties · services · knowledge areas · certifications · languages · availability · version · last updated · ratings · trust level.

Profiles originate from enabled **public surfaces** on Profession Brain (`customer-experience.ts`). Sync runs on Profession Brain upsert.

## Customer experience

Consumers can learn · ask questions · follow guided workflows · purchase templates · book consultations · request estimates · schedule services · purchase digital products · join memberships · enroll in academy courses · upgrade to professional services.

## Multi-audience knowledge

One Profession Brain can serve the organization · employees · managers · contractors · customers · students · future owners · future family members. Studio OS generates audience-appropriate experiences via `multi-audience.ts`.

## Trust & transparency

Four levels: **educational** · **preparation** · **consultation** · **licensed**. Regulated industries (law, medical, dental, financial services, insurance) surface disclaimers and licensed-review requirements. The platform educates responsibly — it supports professionals; it does not replace them.

## Academy connection

Published brains generate courses · lessons · learning paths · articles · playbooks · checklists · reference libraries · certification programs from the same source of truth (`academy-connection.ts`).

## Business growth

Revenue channels: knowledge · templates · courses · consultations · digital products · memberships · subscriptions · professional services (`monetization.ts`).

## Discovery

Consumers discover experts by industry · profession · location · problem · specialty · experience · services · ratings · certifications · topics · organization (`discovery-engine.ts`).

## Architecture

```
src/studio-os-core/expert-marketplace/
  constants.ts
  types.ts
  profile-generator.ts      — from Profession Brain public surfaces
  discovery-engine.ts
  trust-transparency.ts
  academy-connection.ts
  monetization.ts
  multi-audience.ts
  store.ts                  — sync from profession-brain/store
  bootstrap.ts
  dock-advisor.ts
  index.ts
```

## UI

**`/admin/studio/expert-marketplace`** — tabs: Overview · Expert Profiles · Discovery · Academy Connection · Business Growth · Trust & Transparency · Multi-Audience

Hook: **`useExpertMarketplaceState`**

## Integration

- **`profession-brain/store.ts`** — `syncExpertMarketplaceFromProfessionBrain()` on upsert
- **`boundary-sync.ts`** + **`workspaces/index.ts`** — bootstrap per org
- **`command-dock/store.ts`** — `resolveExpertMarketplaceAdvice()` + route context
- Legacy marketplace remains at **`/admin/studio/marketplace`** (M49 ecosystem) — Expert Marketplace is a separate public-expertise channel (M92)
