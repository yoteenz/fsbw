# NDXbook Legacy Intelligence — SITE 00 EVOLVE Handoff

**Package ID:** `ndxbook-legacy-intelligence-v1`  
**Source repository:** `yoteenz/fsbw` (Studio World legacy source)  
**Target EVOLVE slug:** `ndxbook`  
**Target EVOLVE organization UUID:** `7681ab75-bddc-43e5-b594-79fcf8168205`  
**Boundary:** Read-only recovery — **no runtime coupling** to fsbw. Portable JSON companion: `NDXBOOK_SITE00_HANDOFF.json`.

> **Existence ≠ canon.** Items below are classified by provenance. Only `CANONICAL` + `HIGH` confidence fields are recommended for direct EVOLVE import after founder review.

---

## I. Original Purpose (Studio World)

| Field | Value |
|-------|-------|
| **Classification** | Experimental / pilot brand inside Studio World |
| **Created** | Milestone 29.5 (2026-07-05) — `motherboard/MEMORY.md` |
| **Why** | Guinea-pig brand to test Studio World capabilities: AI Media workspace, Master Content Pipeline™, Mission Control, Newsroom, Page 001 pilot, social OAuth wiring, Creative Direction Studio, Studio Production Engine departments |
| **Internal workspace** | `ai-media` (AI Media) |
| **Public brand** | `ndxbook` (index book) |
| **Experimentation layer** | Studio OS Labs |
| **Founder-approved vs experimental** | Brand constants + taxonomy + voice = structured canon in code; Creative DNA = **placeholder**; Mission Control demo pages 019–042 = **obsolete demo**; Founder Pilot Mode = **zero demo history**, start at Page 001 |

**Studio World capabilities tested:** organization routing (`ndxbook` tenant), distribution network, content pipeline gates, founder notes on production departments, Instagram OAuth connector, governed production infrastructure (no ndxbook org row in production `studio_world_organizations`).

---

## II. Brand Intelligence

### Identity (CANONICAL — HIGH)

| Item | Value | Provenance |
|------|-------|------------|
| Public name | `ndxbook` (lowercase in code) | `src/studio-os-core/ndxbook/constants.ts` |
| Internal name | index book | same |
| Positioning | the index for everyday knowledge. | same |
| Promise | every page makes you smarter. | same |
| Description | Educational media brand — money, health, psychology, AI, technology, consumer intelligence, modern life | same |

### Taxonomy (CANONICAL — HIGH)

- **Video term:** pages  
- **Pillar term:** volumes  
- **Category term:** chapters  
- **Series term:** collections  
- **Audience term:** readers  

### Voice (CANONICAL — HIGH)

- **Voice:** clear, curious, sharp, useful, slightly mysterious  
- **Avoid:** preachy, childish, overly academic, fearmongering  
- **Copy style:** short hooks, fast explanations, simple language, specific examples, no filler  
- **Page questions:** what is this? · why does it matter? · what should the reader do or remember?

### Visual Identity (OWNER_CONFIRMATION_REQUIRED / REFERENCE)

| Item | Status | Notes |
|------|--------|-------|
| Creative DNA | `placeholder` — **not approved** | `constants.ts` DEFAULT_CREATIVE_DNA |
| Style direction | editorial, minimal, clean, high contrast, modern, slightly futuristic, trustworthy | REFERENCE |
| Accent color | `#6366F1` (indigo) | `adminStudioDistributionNetworkOrgDefaults.ts` |
| Thumbnail palette | slate `#0F172A` + indigo `#6366F1` | Page 001 SVG generator in `pagePipeline.ts` |
| Design Genome hero | Editorial benchmark — **CONFLICT** | Capture route `/ndxbook/lace-mastery/...` may mis-attribute vs money/credit Page 001 |

### Conflicts

1. **Demo history vs Founder Pilot:** Mission Control M37 seeded pages 019–042; Founder Pilot Mode clears to `pages: []`. Do not import demo metrics as live truth.  
2. **Design Genome route vs Page 001 focus:** Lace mastery capture vs credit education pilot — founder review required.

---

## III. Business Intelligence

| Domain | Recovered value | Classification |
|--------|-----------------|----------------|
| Business concept | Indexed educational short-form media | CANONICAL |
| Product/service | Short-form “pages” in volumes/chapters; multi-platform | CANONICAL (MEDIUM) |
| Value proposition | the index for everyday knowledge. | CANONICAL |
| Monetization | sponsorship · affiliate · premium (strategy demo seed) | OWNER_CONFIRMATION_REQUIRED |
| Business model | Media publishing pilot in Studio World | REFERENCE |

---

## IV. Audience Intelligence

| Item | Value | Classification |
|------|-------|----------------|
| Target audience (demo seed) | Curious adults 25–45 seeking practical knowledge | OWNER_CONFIRMATION_REQUIRED |
| Topic communities | money, body, mind, tech, consumer (via volumes) | REFERENCE |

---

## V. Strategy & Marketing

### Content pillars — 5 launch volumes (CANONICAL)

1. **MONEY** — budgeting, credit, banking, investing, taxes, retirement, side hustles, passive income, financial scams  
2. **BODY** — health myths, nutrition, fitness, sleep, mental wellness, supplements, habits, medical misconceptions  
3. **MIND** — habits, psychology, body language, relationships, communication, decision making, productivity, cognitive biases  
4. **TECH** — AI tools, automation, software, cybersecurity, gadgets, digital productivity, future technology  
5. **CONSUMER** — consumer rights, shopping, travel, subscriptions, insurance, warranties, hidden fees, online safety  

### Programming cadence (CANONICAL)

| Day | Series | Volume |
|-----|--------|--------|
| Monday | Money Monday | money |
| Tuesday | Truth Tuesday | body / mind |
| Wednesday | Workflow Wednesday | tech |
| Thursday | Smart Living Thursday | consumer |
| Friday | Future Friday | tech / innovation |

### Channel strategy

- **Platform registry:** Instagram, TikTok, YouTube Shorts, Facebook, Threads, X, Pinterest  
- **Pilot priority:** Instagram-first (Founder Pilot locks other platforms)  
- **CTA (distribution defaults):** INDIGO CTA · READ PAGE · SUBSCRIBE  
- **Launch state:** Pre-launch — Page 001 pipeline built, not mass-published  

### Demo marketing data (OBSOLETE — do not import)

Distribution demo packs: `dist-ndx-page-042`, `dist-ndx-money-monday-12`, `dist-ndx-social-cuts`, Mission Control revenue/reader metrics — all superseded by Founder Pilot zero-history mode.

---

## VI. Content — Page 001 Pilot (REFERENCE)

**Not published canon** — pipeline test asset.

| Field | Value |
|-------|-------|
| Title | Truth Tuesday · Credit Education |
| Hook | Why paying off debt can still affect your credit score |
| Volume / chapter | money / credit |
| Platform | Instagram only |
| Hashtags | #ndxbook #creditscore #personalfinance #money #financialeducation |

Runbook: `docs/NDXBOOK_PAGE_001_PIPELINE.md`

---

## VII. Channels & Social

| Source | Status | Classification |
|--------|--------|----------------|
| Code defaults (`DEFAULT_SOCIAL_ACCOUNTS`) | All `not-connected` / `pending` handles | REFERENCE |
| Founder Pilot | Instagram active target; others locked | CANONICAL (pilot intent) |
| Production Supabase `studio_social_accounts` | Instagram **connected**, Meta page name **Ndxbook** | OWNER_CONFIRMATION_REQUIRED |

**No OAuth tokens or encrypted credentials are included in this handoff.**

---

## VIII. Asset Inventory

| Asset ID | Type | Status | Notes |
|----------|------|--------|-------|
| ndxbook-page-001-thumbnail | SVG (inline generated) | EXPERIMENTAL | Page 001 pilot visual |
| dist-ndx-page-001 | Distribution pack | STUDIO_WORLD_ONLY | Pipeline routing |
| Demo pages 019–042 | Demo registry entries | OBSOLETE | Founder Pilot clears these |
| Talent hosts | Placeholder profiles | UNKNOWN | All “Pending — Host” |

---

## IX. Studio World Production History (STUDIO_WORLD_ONLY)

**Do not import into EVOLVE marketing canon.**

| Area | Summary |
|------|---------|
| Admin routes | `/admin/studio/ndxbook`, mission-control, newsroom, creative-direction, company routes |
| Pipeline | Master Content Pipeline gates: Production → Review → Approval → Publish → Learning |
| Founder Notes | `studioOsNdxbook_founderNotes_v1` — production department feedback |
| Storage | Browser localStorage/session (`studioOsNdxbook_v1`, mission control, newsroom stores) |
| Production DB | No `ndxbook` row in `studio_world_organizations`; social account exists separately |
| Git history | Milestones 29.5, 37, 86, 87, Page 001 pipeline commits |

---

## X. EVOLVE Gap Analysis Summary

| Status | Count | Examples |
|--------|-------|----------|
| RECOVERED_CANONICAL | 10 | business description, value prop, voice, content pillars, Instagram role, launch state, publishing cadence |
| RECOVERED_NEEDS_CONFIRMATION | 7 | target audience, objectives, visual identity, monetization, CTA, measurement, channel priorities |
| CONFLICT | 2 | demo history vs pilot; design genome route |
| NOT_FOUND | 1 | current offers |
| NOT_APPLICABLE | 2 | org identity (SITE 00 duplicate), automation preference |

---

## XI. Founder Question Reduction

| Category | Count |
|----------|-------|
| Original EVOLVE assessment domains | 20 |
| Answered from canon (high confidence) | 10 |
| Requiring confirmation | 7 |
| Unknown / not found | 1 |
| Conflicts requiring resolution | 2 |
| **Minimum founder questionnaire** | **8 questions** (see JSON `founderQuestions`) |

**Do not ask the founder what we already know with high confidence** (positioning, promise, taxonomy, voice rules, volume structure, programming cadence, Instagram-first pilot intent, pre-launch state).

---

## XII. Import Contract — `NdxbookLegacyIntelligencePackage`

**Stages:** DISCOVERED → REVIEWED → OWNER_CONFIRMED (where required) → IMPORT_APPROVED → IMPORTED

| Classification | EVOLVE mapping |
|----------------|----------------|
| CANONICAL + HIGH | Content Brain + marketing profile — direct import candidate after REVIEWED |
| OWNER_CONFIRMATION_REQUIRED | Assessment prompts — block auto-canon |
| REFERENCE | Reference layer / campaign archives |
| STUDIO_WORLD_ONLY | Never copy to EVOLVE brand canon |
| CONFLICT | Founder resolution queue |
| OBSOLETE | Archive metadata only |
| DUPLICATE | Skip (SITE 00 org UUID already exists) |

**Not implemented in SITE 00** — subsequent SITE 00 import sprint.

---

## XIII. Source Inventory (368 files reference NDXbook)

**Primary canon files:**

- `src/studio-os-core/ndxbook/` — types, constants, store, page pipeline, newsroom, mission control, distribution bridge  
- `src/workspaces/ai-media/ndxbook/` — bootstrap  
- `docs/NDXBOOK_PAGE_001_PIPELINE.md`  
- `src/utils/adminStudioDistributionNetworkOrgDefaults.ts`  
- `src/studio-os-core/strategy-engine/bootstrap.ts` (demo strategy — confirm before canon)  
- `motherboard/MEMORY.md` — milestone decisions  

**Recovery tooling:** `src/studio-os-core/ndxbook-recovery/` (classification + portable JSON builder + secret exclusion tests)

**Methodology:** `docs/studio-world/LEGACY_BRAND_INTELLIGENCE_RECOVERY.md`

---

## XIV. Safety Attestation

- SITE 00 modified: **NO**  
- Production DB mutated: **NO** (read-only inspection of social accounts)  
- Publishing performed: **NO**  
- Secrets in handoff: **NO** (verified by recovery tests)  
- Runtime coupling: **NO**
