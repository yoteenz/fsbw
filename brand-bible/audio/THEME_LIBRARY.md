# Frontal Slayer Theme Library

**Document:** THEME_LIBRARY  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-012

---

## Overview

Five **score themes** define the musical identity of distinct domains within the Frontal Slayer universe. Each theme is a **stem family** (not a single loop) with intro, hold, outro, and transition variants.

Themes share **MOTIF-DISCOVERY-01** DNA but express different emotional territories.

---

## Theme 01 — Arrival Theme

**ID:** `THEME-ARRIVAL`  
**Domain:** Entering the luxury shopping district (pre-brand)  
**FSCS scene templates:** Opening Establishing, Shopping District (first act)

### Emotion

Peace · curiosity · anticipation · possibility

### Musical direction

- **Lead:** Environmental ambience (L3) — birds, distant city, soft wind  
- **Score (L1):** Optional single MOTIF-ARRIVAL-01 fragment; piano or distant strings  
- **Dynamic ceiling:** −28 LUFS integrated — **score must not lead**  
- **Tempo:** 58–68 BPM if pulse present; often **no pulse**  
- **Duration typical:** 15–45s continuous; loop only for interactive exploration  

### Placement map

| Experience | Theme behavior |
| --- | --- |
| Website district approach | Ambience 100%, score 0–15% |
| Mobile map / browse entry | Ambience 90%, score 10% |
| Campaign opening atmosphere beat | Ambience 85%, score 15% |
| Film Act I — walking to district | Ambience leads; score enters last 8s |

### Transition out

→ **Discovery Theme** via Morning Glow or silence bridge (800–1200ms)

### Planned stems

`fs-score-arrival-ambience-bed-v1` · `fs-score-arrival-motif-intro-v1` · `fs-score-arrival-hold-v1` · `fs-score-arrival-outro-v1`

---

## Theme 02 — Discovery Theme

**ID:** `THEME-DISCOVERY`  
**Domain:** Moment Nia notices Frontal Slayer  
**FSCS beat:** Discovery · **Chime:** Full or Half Discovery Chime **required**

### Emotion

Curiosity · intrigue · emotional shift

### Musical direction

- **Trigger:** Discovery Chime **always** precedes or coincides with score entrance  
- **Lead:** Chime (L2) → score (L1) crossfade 400–600ms  
- **Nia's music:** Ducks and exits (film law)  
- **Dynamic:** −24 LUFS integrated  
- **Tempo:** 66–76 BPM  
- **Motif:** MOTIF-DISCOVERY-01 full statement (once)  

### Placement map

| Experience | Theme behavior |
| --- | --- |
| First storefront recognition | Chime Full + Discovery stem |
| App first FS-branded screen | Chime Half + motif fragment |
| Campaign "discovery" beat | Chime + score swell |
| Film — boutique notice | Chime on cut or slow push |

### Transition out

→ **Flagship Theme** (storefront approach) or **Mansion Theme** (digital pivot)

### Planned stems

`fs-score-discovery-chime-layer-v1` · `fs-score-discovery-intro-v1` · `fs-score-discovery-hold-v1` · `fs-score-discovery-outro-v1`

---

## Theme 03 — Flagship Theme

**ID:** `THEME-FLAGSHIP`  
**Domain:** Exterior reveal + entry into SET-001 flagship  
**FSCS scenes:** Storefront Reveal, Interior Reveal, Luxury Arrival

### Emotion

Wonder · elegance · aspiration · luxury

### Musical direction

- **Lead:** Score — strings + glass harmonics + muted brass breath  
- **Environmental:** Door, room tone — supports, does not lead  
- **Physical bell:** Discovery Chime Full at threshold  
- **Dynamic:** −22 LUFS integrated  
- **Tempo:** 60–72 BPM  
- **Motif:** MOTIF-FLAGSHIP-01  

### Placement map

| Experience | Theme behavior |
| --- | --- |
| SET-001 exterior drone / push | Score builds 8–12s |
| Entry airlock | Chime + score hold |
| Showroom walkthrough | Flagship hold stem, minimal development |
| Campaign brand reveal beat | Flagship + MOTIF-DISCOVERY fragment |

### Transition out

→ **Mansion Theme** (digital handoff) via Luxury Dissolve  
→ **Arrival Theme** (exit to district) via long fade

### Planned stems

`fs-score-flagship-exterior-v1` · `fs-score-flagship-entry-v1` · `fs-score-flagship-interior-v1` · `fs-score-flagship-hold-v1`

---

## Theme 04 — Mansion Theme

**ID:** `THEME-MANSION`  
**Domain:** Entering the immersive digital mansion (mobile app core)  
**FSCS scenes:** Showroom Walkthrough, Membership Reveal (partial)

### Emotion

Innovation · exclusivity · sophistication · futuristic luxury

### Musical direction

- **Lead:** Score — subtle synth pad (organic) + MOTIF-MANSION-01 pulse  
- **Not cyberpunk:** Warm analog; glass over neon  
- **Dynamic:** −22 LUFS integrated  
- **Tempo:** 72–84 BPM (highest approved — still restrained)  
- **UI layer:** SF-GLASS / SF-AIR on interaction; never competes with score hold  

### Placement map

| Experience | Theme behavior |
| --- | --- |
| App mansion entry | Mansion intro 4–8s |
| Lobby / concierge zone | Mansion hold + reduced pulse |
| Penthouse / rewards | Mansion hold + SF-CHIME unlocks |
| Studio World HQ (future) | Mansion variant stem — shared DNA |
| Elevator travel | Mansion pulse + SF-AIR |

### Transition out

→ **UI-only** (score ducks −8dB) for focused tasks  
→ **Discovery Theme** on exit to commerce district

### Planned stems

`fs-score-mansion-intro-v1` · `fs-score-mansion-hold-v1` · `fs-score-mansion-pulse-v1` · `fs-score-mansion-outro-v1` · `fs-score-mansion-elevator-v1`

---

## Theme 05 — UI Theme

**ID:** `THEME-UI`  
**Domain:** Interface sonic language (Brand Sonic L2 — not continuous score)  
**Note:** UI Theme is **event-based**, not a looping score. See [UI_SONIC_LANGUAGE.md](./UI_SONIC_LANGUAGE.md)

### Emotion

Precision · confidence · glass · hospitality

### Musical direction

- **No continuous loop** — only interaction-triggered events  
- **All sounds derive from Discovery Chime** (sonic families SF-GLASS, SF-CHIME, SF-TONE, SF-AIR)  
- **Dynamic:** −28 to −22 LUFS per event  
- **Motif:** MOTIF-UI-01 (single pitch class from Chime)  

### Scope

Defines sonic grammar for every interface interaction across web, mobile, admin (Frontal Slayer surfaces only — not Studio OS governance UI unless white-label exception).

---

## Theme interaction matrix

| From ↓ / To → | Arrival | Discovery | Flagship | Mansion | UI |
| --- | --- | --- | --- | --- | --- |
| **Arrival** | — | Silence + Chime | Flagship fade | Mansion dissolve | UI duck |
| **Discovery** | Long fade | — | Crossfade 600ms | Crossfade 800ms | Chime priority |
| **Flagship** | Fade 2s | Reverse chime | — | Luxury Dissolve | Duck score |
| **Mansion** | Fade 3s | Half chime | Architectural reveal | — | Coexist duck |
| **UI** | N/A | Chime only | Events only | Events duck | — |

---

## FSCS timeline alignment

| Timeline preset | Primary themes (in order) |
| --- | --- |
| commercial-30 | Arrival → Discovery → Flagship → Logo |
| commercial-60 | Arrival → Discovery → Flagship → Mansion hold → Logo |
| brand-film-90 | Full arc all five |
| social-reel | Discovery → Flagship snippet |
| product-reveal | Discovery → Flagship → UI confirm |
| founder-story | Arrival → Discovery → Mansion |

---

## Production status

| Theme | Spec | Stems | Implementation |
| --- | --- | --- | --- |
| Arrival | ✅ v1.0 | ⬜ Planned | ⬜ Future `src/audio/` |
| Discovery | ✅ v1.0 | ⬜ Planned | ⬜ |
| Flagship | ✅ v1.0 | ⬜ Planned | ⬜ |
| Mansion | ✅ v1.0 | ⬜ Planned | ⬜ |
| UI | ✅ v1.0 | ⬜ Planned | ⬜ |
