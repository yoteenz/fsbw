# Frontal Slayer Music & Sonic System (FSMSS)

**System ID:** FSMSS  
**Version:** 1.0  
**Status:** Canonical — architecture & planning (no production assets yet)  
**Owner:** Executive Creative + Audio Direction  
**Classification:** Internal — governs all Frontal Slayer score, sonic identity, and UI audio  
**Registry:** DOC-AUD-SYSTEM-001

---

## Executive summary

Frontal Slayer is a **cinematic universe**, not a traditional e-commerce website. Audio must function like a **professional film score** — intentional, restrained, emotionally literate, and instantly recognizable.

The **Frontal Slayer Music & Sonic System (FSMSS)** is the permanent audio constitution for every experience across:

- Website & mobile app  
- Studio World & immersive productions  
- Film trilogy & Lounge  
- Campaigns, teasers, and launch films  
- Flagship retail (SET-001)  
- Future products and partnerships  

**This folder is the single source of truth for audio architecture.** It does not contain application code, audio files, or implementation. Those live in future `src/audio/` (planned) and production asset storage (planned).

---

## Relationship to other systems

| System | Location | Relationship |
| --- | --- | --- |
| **North Star Manifesto** | `brand-bible/frontal-slayer-north-star-manifesto.md` | Supreme law — restraint, curiosity, no interruption |
| **Visual Language** | `brand-bible/visual-language/visual-language.md` | Material/light parity for sonic glass and space |
| **FSMS** (Motion) | `src/motion/` | Motion timing drives sonic cue placement |
| **FDS** (Design) | `src/design-system/` | UI interaction taxonomy maps to UI sonic families |
| **FSCS** (Cinematic) | `src/cinematic/` | Timeline beats, audio cue markers, story rhythm |
| **Film Trilogy Bibles** | `brand-bible/production/` | Nia's world vs Frontal Slayer score rules |
| **Flagship Production Bible** | `brand-bible/environments/flagship-production-bible.md` | Environmental bell registry, arrival continuity |

---

## Three-layer audio model (mandatory)

Every Frontal Slayer experience separates audio into **three layers**. Mixing them incorrectly breaks the cinematic universe.

| Layer | Name | Brand identity? | Purpose |
| --- | --- | --- | --- |
| **L1** | **Score** | Yes — Frontal Slayer themes | Emotional film score; area/scene identity |
| **L2** | **Brand Sonic** | Yes — original FS sounds | Discovery Chime (sonic logo), UI families, transitions |
| **L3** | **Environmental** | **No** | Diegetic realism — birds, wind, cafés, footsteps |

**Rule:** Environmental audio supports realism but **never** becomes part of the Frontal Slayer brand identity. Brand sounds are **original and reusable**.

---

## Documentation index

| Doc ID | Document | Purpose |
| --- | --- | --- |
| DOC-AUD-010 | [MUSIC_BIBLE.md](./MUSIC_BIBLE.md) | Master constitution — instrumentation, motifs, emotional law |
| DOC-AUD-011 | [SONIC_IDENTITY_GUIDE.md](./SONIC_IDENTITY_GUIDE.md) | Brand sonic DNA — Discovery Chime, families, forbidden sounds |
| DOC-AUD-012 | [THEME_LIBRARY.md](./THEME_LIBRARY.md) | Five score themes + emotional placement |
| DOC-AUD-013 | [UI_SONIC_LANGUAGE.md](./UI_SONIC_LANGUAGE.md) | Complete UI interaction sound taxonomy |
| DOC-AUD-014 | [ENVIRONMENTAL_AUDIO_LIBRARY.md](./ENVIRONMENTAL_AUDIO_LIBRARY.md) | Diegetic audio registry (non-brand) |
| DOC-AUD-015 | [AUDIO_ASSET_LIBRARY.md](./AUDIO_ASSET_LIBRARY.md) | Master asset registry structure & metadata |
| DOC-AUD-016 | [TRANSITION_LIBRARY.md](./TRANSITION_LIBRARY.md) | Score + sonic transitions between states |
| DOC-AUD-017 | [MIXING_GUIDELINES.md](./MIXING_GUIDELINES.md) | Mix philosophy, stems, platform targets |
| DOC-AUD-018 | [VOLUME_HIERARCHY.md](./VOLUME_HIERARCHY.md) | Priority stack — what wins in conflict |
| DOC-AUD-019 | [AUDIO_NAMING_CONVENTION.md](./AUDIO_NAMING_CONVENTION.md) | File, ID, and registry naming |
| DOC-AUD-020 | [IMPLEMENTATION_STRATEGY.md](./IMPLEMENTATION_STRATEGY.md) | Phased rollout — no code in v1.0 |
| DOC-AUD-021 | [FUTURE_EXPANSION_STRATEGY.md](./FUTURE_EXPANSION_STRATEGY.md) | Long-term vision — AI, retail, partnerships |
| DOC-AUD-022 | [DISCOVERY_CHIME_SPEC.md](./DISCOVERY_CHIME_SPEC.md) | Official sonic logo — tonal language lock |

**Legacy roadmap slots (superseded by this system):**

- DOC-AUD-001 `sound-design-direction.md` → absorbed into SONIC_IDENTITY + UI_SONIC  
- DOC-AUD-002 `music-direction.md` → absorbed into MUSIC_BIBLE + THEME_LIBRARY  

---

## Quick reference — five score themes

| Theme | Domain | Primary emotion |
| --- | --- | --- |
| **Arrival** | Luxury shopping district approach | Peace, curiosity, anticipation |
| **Discovery** | Nia notices Frontal Slayer | Curiosity, intrigue, emotional shift |
| **Flagship** | Exterior reveal + entry | Wonder, elegance, aspiration |
| **Mansion** | Digital mansion immersion | Innovation, exclusivity, sophistication |
| **UI** | Interface sonic language | Precision, confidence, glass |

---

## Governance

- **Version bumps** require Executive Creative approval.  
- **Discovery Chime** changes require Founder approval (sonic logo).  
- **New themes** require Music Bible amendment + Theme Library entry.  
- **Environmental assets** never use `fs-brand-*` naming prefix.  
- All production assets must register in AUDIO_ASSET_LIBRARY before ship.

---

## Approval gate (planning complete → production)

Before first asset commission:

1. Founder sign-off on Discovery Chime brief (DISCOVERY_CHIME_SPEC)  
2. Reference palette session — 3–5 sonic references (Apple, Disney, A24-class restraint)  
3. Theme stem mockups — 30s Arrival + Discovery only  
4. UI family pilot — 5 core interactions (tap, confirm, error, drawer, chime)  
5. Mix test on mobile + film + Mansion simultaneously  

**Status:** Architecture v1.0 complete — **awaiting asset production phase.**
