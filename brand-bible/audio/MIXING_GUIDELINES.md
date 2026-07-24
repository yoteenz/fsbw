# Frontal Slayer Mixing Guidelines

**Document:** MIXING_GUIDELINES  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-017

---

## 1. Mix philosophy

Frontal Slayer mixes should feel like **feature film premix** meets **Apple product film clarity** — wide, breathable, never crowded. The guest should feel space, not stimulation.

**Mantra:** *Leave headroom for wonder.*

---

## 2. Stem architecture

### 2.1 Standard stem bus (all productions)

| Bus | Contents | Default level (relative) |
| --- | --- | --- |
| **MASTER** | Final output | −14 LUFS (streaming) / −24 LUFS (film premix) |
| **SCORE** | L1 themes | −6dB bus fader from MASTER target |
| **BRAND** | L2 UI + Chime | Peak-managed, no bus compression |
| **ENV** | L3 environmental | −12dB bus fader |
| **DX** | Dialogue (film) | −18 LUFS integrated target |
| **FX** | Foley one-shots | −15dB bus fader |

### 2.2 Score sub-stems (per theme)

- `{theme}-strings`  
- `{theme}-keys`  
- `{theme}-pad`  
- `{theme}-perc`  

**Max simultaneous sub-stems:** 3

---

## 3. Platform delivery targets

| Platform | Integrated LUFS | True peak | Format |
| --- | --- | --- | --- |
| Mobile app (score bed) | −18 to −16 | −1 dBTP | AAC 256kbps |
| Web | −16 to −14 | −1 dBTP | AAC / Opus |
| Social reel | −14 | −1 dBTP | AAC |
| Film / Lounge | −24 (premix) | −3 dBTP | 48kHz/24 WAV |
| UI sounds (single) | −26 peak typical | −1 dBTP | WAV → AAC |

---

## 4. Dynamic processing rules

| Processing | Allowed | Settings guidance |
| --- | --- | --- |
| **EQ** | Yes | Gentle high-pass on ENV < 100Hz; score warmth 200–400Hz |
| **Compression on SCORE bus** | Light | Ratio ≤ 2:1, slow attack |
| **Compression on BRAND** | **No** | Preserve transient glass |
| **Limiting on MASTER** | Yes | Transparent; film premix minimal |
| **Reverb on UI** | **No** | Pre-baked only in asset |
| **Reverb on SCORE** | Yes | Plate/hall, 1.2–2.0s, ≤ 15% wet |

---

## 5. Ducking rules (automated future)

| Trigger | Duck target | Amount | Release |
| --- | --- | --- | --- |
| Dialogue present | SCORE + ENV | −12dB / −6dB | 300ms |
| Discovery Chime | SCORE + ENV + DX | −6dB / −3dB / −3dB | 500ms |
| UI-CONFIRM (micro) | SCORE | −3dB | 150ms |
| Full Chime | All except Chime | See DISCOVERY_CHIME_SPEC | |

---

## 6. Stereo & spatial

| Content | Width |
| --- | --- |
| UI sounds | Mono or 30% stereo — mobile-safe |
| Discovery Chime Full | 40% |
| Score | 70–100% |
| Environmental beds | 100% |
| Film 5.1 (optional) | L/C/R/Ls/Rs — no LFE hype |

**Mansion / spatial audio (future):** Ambisonic beds optional — must collapse cleanly to stereo.

---

## 7. Headphone vs speaker

All mixes **must** pass:

1. iPhone speaker (mono downmix)  
2. AirPods / earbuds  
3. Laptop speakers  
4. Reference monitors (optional approval)  

UI sounds **must** be intelligible on iPhone speaker at 50% media volume.

---

## 8. Mix review checklist

- [ ] Integrated LUFS within platform target  
- [ ] True peak ≤ −1 dBTP (streaming)  
- [ ] Environmental not mistaken as muddy low-end  
- [ ] Chime not harsh on earbuds  
- [ ] Score leaves 3dB headroom for UI peaks  
- [ ] Silence bridges are true silence (−60 LUFS or below)  
- [ ] No audible pumping from ducking  

---

## 9. Tools & session template (production)

Recommended DAW session template:

- Markers for FSCS beats  
- Color-coded stems per layer (L1/L2/L3)  
- Reference track slot (Apple/A24 class — not for copy, for level)  
- Export preset per AUDIO_ASSET_LIBRARY derivatives  

**Not specified in v1.0:** Plugin list — composer discretion within Music Bible instrumentation rules.
