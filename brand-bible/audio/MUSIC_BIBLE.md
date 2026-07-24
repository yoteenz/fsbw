# Frontal Slayer Music Bible

**Document:** MUSIC_BIBLE  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-010  
**Parent:** [FSMSS README](./README.md)

---

## 1. Purpose

This Music Bible is the **permanent score constitution** for the Frontal Slayer cinematic universe. It governs how music behaves across film, digital product, retail, and campaigns — not as background decoration, but as **narrative infrastructure**.

Music answers: *What does this moment feel like?* and *Does the guest still believe they are inside one world?*

---

## 2. Supreme audio law (inherits North Star)

1. **Luxury is restraint** — if music competes with wonder, turn it down or remove it.  
2. **Curiosity outranks explanation** — score suggests; it does not announce.  
3. **Never interrupt emotion with promotion** — no stinger over transformation.  
4. **Silence is a instrument** — hold before reveal; breathe before transition.  
5. **One universe, many rooms** — themes vary; tonal DNA does not.  
6. **Nia's music is not Frontal Slayer's music** until Discovery (see §8).

When two musical choices compete, the one that **deepens the world without explaining it** wins.

---

## 3. Instrumentation palette

### 3.1 Core palette (Frontal Slayer score)

| Family | Role | Character |
| --- | --- | --- |
| **Crystal strings** | Emotional spine | Warm, close-mic, no harsh bow scrape |
| **Soft piano / felt keys** | Intimacy, discovery | Single-note clarity; no virtuosic runs |
| **Glass harmonics / bowed metal** | Architectural luxury | Tied to visual glass language |
| **Muted brass breath** | Aspiration, flagship moments | Never fanfare; distant warmth |
| **Subtle synth pad (organic)** | Mansion futurism | Analog warmth; no EDM supersaws |
| **Hand percussion (brush, soft mallet)** | Rhythm without pulse | Never four-on-the-floor |

### 3.2 Forbidden instrumentation

- EDM drops, trap hi-hats, dubstep bass  
- Generic corporate ukulele / clap stock  
- Overtly sci-fi bleeps (Mansion is **futuristic luxury**, not cyberpunk)  
- Horror stingers, jump-scare chords  
- Aggressive trailer percussion  
- Lo-fi vinyl crackle as aesthetic shortcut  
- Recognizable licensed pop hooks in brand score (Nia's diegetic music excepted in film)

### 3.3 Tonal center

- **Primary key family:** D major / B minor axis (warm, open, aspirational)  
- **Discovery Chime anchor:** Defines partials for all brand sonic design (see DISCOVERY_CHIME_SPEC)  
- **Modulation rule:** One semitone lift maximum per scene; no chaotic key hopping  

---

## 4. Emotional progression architecture

Every score cue follows the **FSMSS Arc**:

```
Silence / ambience lead
    ↓
Introduction (single element)
    ↓
Development (layer 2–3 max)
    ↓
Hold (emotional landing)
    ↓
Release (fade or transition)
```

| Phase | Duration guidance | Dynamic |
| --- | --- | --- |
| Silence lead | 400–1200ms before first note | −∞ → −36 LUFS perceptual |
| Introduction | 2–6s | Soft attack |
| Development | 8–20s | Never exceed −20 LUFS integrated |
| Hold | 2–8s | Stable; no new motifs |
| Release | 1.5–4s | Long tail; no hard cut except Elegant Cut |

Align timing with **FSCS story rhythm** (`FSCS_STORY_RHYTHM` in `src/cinematic/`).

---

## 5. Dynamics & tempo

| Context | Tempo (BPM) | Dynamic ceiling |
| --- | --- | --- |
| Arrival / district | 58–72 | −26 LUFS (perceived quiet) |
| Discovery | 66–80 | −24 LUFS |
| Flagship reveal | 60–76 | −22 LUFS |
| Mansion | 70–88 | −22 LUFS |
| UI sonic (Brand layer) | N/A (event) | −18 LUFS peak (short) |
| Film emotional peak | 56–84 | −20 LUFS |

**Rule:** Tempo **never** rushes emotional moments. If the guest should feel pause, the score pauses.

---

## 6. Recurring musical motifs

| Motif ID | Description | First appearance | Recurrence |
| --- | --- | --- | --- |
| **MOTIF-ARRIVAL-01** | Two-note ascending fifth, soft glass overtone | Arrival Theme | District, morning scenes |
| **MOTIF-DISCOVERY-01** | Discovery Chime harmonic reduction | Discovery Theme | All brand sonic |
| **MOTIF-FLAGSHIP-01** | Wide string cluster + held breath | Flagship Theme | Retail, SET-001 |
| **MOTIF-MANSION-01** | Subtle pulse + harmonic shimmer | Mansion Theme | Digital product, Studio World |
| **MOTIF-UI-01** | Single glass tap pitch class | UI Theme | All interface sounds |

Motifs may appear **partially** (fragment) or **fully** (statement). Never stack more than **two motifs** simultaneously.

---

## 7. Signature sonic logo usage

The **Discovery Chime** is the official Frontal Slayer sonic logo.

| Usage | Allowed | Notes |
| --- | --- | --- |
| First brand recognition moment | Yes | Once per session preferred |
| UI confirmation (major) | Yes | Short variant only |
| Logo end card | Yes | Full or half statement |
| Error states | No | |
| Loading loops | No | |
| Notification spam | No | |
| Retail door (SET-001) | Yes | Physical + digital must match |

Full specification: [DISCOVERY_CHIME_SPEC.md](./DISCOVERY_CHIME_SPEC.md)

---

## 8. Nia's world vs Frontal Slayer score (film law)

From the Film Trilogy Visual Story Bible:

> Music represents **Nia's world**. Frontal Slayer **never** interrupts the music. **Nia chooses** to leave it behind.

| Phase | Score source | Mix priority |
| --- | --- | --- |
| Pre-Discovery | Nia's diegetic music (external / licensed placeholder in production) | Nia's music leads |
| Discovery moment | Discovery Chime enters; Nia's music **ducks then fades** | Chime + score |
| Post-Discovery | Frontal Slayer themes | FS score leads |

**Earbud grammar (film):** Earbud one = subconscious reaction; Earbud two = conscious decision to enter the world.

---

## 9. Ambience vs score separation

| Layer | Mix bus | Ducking behavior |
| --- | --- | --- |
| Environmental (L3) | `ENV` | Ducks under score −6dB |
| Score (L1) | `SCORE` | Ducks under dialogue −12dB; never under chime |
| Brand Sonic (L2) | `BRAND` | Priority over score for UI events |

Environmental audio is **never** composed into score stems. See ENVIRONMENTAL_AUDIO_LIBRARY.

---

## 10. Transition philosophy

Transitions are **invisible craftsmanship** — aligned with FSCS transition presets (Crystal Fade, Luxury Dissolve, Morning Glow). No whooshes, no risers unless organic and barely perceptible.

See [TRANSITION_LIBRARY.md](./TRANSITION_LIBRARY.md).

---

## 11. Platform targets (reference)

| Platform | Delivery | Notes |
| --- | --- | --- |
| Mobile app | AAC / Opus, stereo | UI sounds mono-compatible |
| Web | AAC / MP3 fallback | Respect autoplay policies |
| Film / Lounge | 48kHz / 24-bit WAV stems | 5.1 optional for flagship content |
| Retail SET-001 | Physical speaker calibration doc (future) | Bell = Discovery Chime variant |

---

## 12. Review checklist (score cue approval)

- [ ] Does it feel quiet, elegant, architectural, natural, premium, intentional, human?  
- [ ] Is environmental audio leading where Arrival requires it?  
- [ ] Are dynamics below ceiling for context?  
- [ ] Is silence honored before reveal?  
- [ ] Does it use only approved instrumentation?  
- [ ] Are motifs registered and not overused?  
- [ ] Does it violate Nia's music rule (if film)?  
- [ ] Is Discovery Chime used per spec (if applicable)?  

---

## 13. Cross-references

- Themes: [THEME_LIBRARY.md](./THEME_LIBRARY.md)  
- UI: [UI_SONIC_LANGUAGE.md](./UI_SONIC_LANGUAGE.md)  
- Mix: [MIXING_GUIDELINES.md](./MIXING_GUIDELINES.md)  
- Volume: [VOLUME_HIERARCHY.md](./VOLUME_HIERARCHY.md)  
- Cinematic beats: `src/cinematic/story/campaignStructure.ts` (implementation reference)
