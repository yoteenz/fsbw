# Frontal Slayer Transition Library

**Document:** TRANSITION_LIBRARY  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-016

---

## 1. Purpose

Defines **how audio moves between states** — scenes, themes, UI modes, and campaign beats. Transitions are **invisible craftsmanship**: no flashy whooshes, no trailer risers.

Aligned with **FSCS transition presets** and **FSMS motion presets**.

---

## 2. Transition types

| Type | Layer | Description |
| --- | --- | --- |
| **Score transition** | L1 | Crossfade / motif handoff between themes |
| **Sonic transition** | L2 | UI + Chime events at state change |
| **Environmental transition** | L3 | Bed swap or filter change |
| **Silence bridge** | All | Structured pause — preferred for emotional beats |

---

## 3. Score transition catalog

| Transition ID | Name | Duration | FSMS preset | FSCS preset | Use |
| --- | --- | --- | --- | --- | --- |
| `TX-CRYSTAL-FADE` | Crystal Fade | 1200ms | crystal-fade | crystal-fade | Theme exit, logo |
| `TX-LUXURY-DISSOLVE` | Luxury Dissolve | 1400ms | elegant-dissolve | elegant-dissolve | Emotional handoff |
| `TX-ARCH-REVEAL` | Architectural Reveal | 1600ms | luxury-reveal | architectural-reveal | Flagship entry |
| `TX-LIGHT-SWEEP` | Light Sweep | 1100ms | sunlight-sweep | sunlight-sweep | Product hero |
| `TX-GLASS-REFLECT` | Glass Reflection | 900ms | morning-reveal | glass-reflection | Interior reveal |
| `TX-SOFT-BLUR` | Soft Blur | 800ms | — | soft-blur | Lifestyle cut |
| `TX-MORNING-GLOW` | Morning Glow | 1300ms | morning-reveal | morning-glow | Arrival → Discovery |
| `TX-ELEGANT-CUT` | Elegant Cut | 0ms | — | elegant-cut | Match cut — sound optional |
| `TX-MATCH-CUT` | Invisible Match Cut | 0ms | — | invisible-match-cut | Walking sequences |

---

## 4. Theme transition matrix (audio behavior)

### Arrival → Discovery

1. Environmental holds  
2. **Silence bridge** 800ms (score at 0%)  
3. **Discovery Chime** Full or Half  
4. Discovery Theme intro crossfade 600ms  
5. Nia's music out (film)

### Discovery → Flagship

1. Discovery hold 2s minimum  
2. TX-ARCH-REVEAL or TX-LIGHT-SWEEP  
3. Flagship exterior stem enters  
4. Environmental door layer under threshold  
5. Chime Full at entry (may repeat if new session context)

### Flagship → Mansion

1. TX-LUXURY-DISSOLVE 1400ms  
2. Flagship score −6dB / 800ms fade  
3. Mansion intro enters under dissolve  
4. UI sounds disabled during first 2s of Mansion  

### Mansion → UI focus

1. Score duck −8dB (not mute)  
2. SF-SILENCE 200ms  
3. UI interactions enabled at normal hierarchy  

### Any → Logo end

1. TX-CRYSTAL-FADE  
2. All environmental −6dB  
3. Chime tail or Full under logo (FSMS LogoReveal sync)  
4. Score outro 2s tail  

---

## 5. UI transition sounds

| Transition | Sonic | Notes |
| --- | --- | --- |
| Route change | `UI-TRANSITION` (SF-AIR) | Skip if reduced-motion/sound |
| Drawer | OPEN / CLOSE pair | Never stack |
| Modal | OPEN soft / CLOSE lighter | |
| Elevator | TRAVEL loop + ARRIVE chime | Score: `fs-score-mansion-elevator-v1` |
| Tab nav | `UI-NAV` | Debounced |

---

## 6. Silence specifications

| Bridge | Duration | When |
| --- | --- | --- |
| Pre-Chime | 600–1200ms | Before Discovery |
| Pre-reveal | 400–800ms | Product hero |
| Post-error | 300ms | After UI-ERROR |
| Post-Full-Chime | 500ms | No UI sounds |
| Arrival open | 5–10s optional | Environment-only district |

---

## 7. Forbidden transitions

- Reverse cymbal swell  
- Sub drop  
- Record scratch  
- Laser / swipe clichés  
- Hard silence cut (digital zero) without narrative reason  
- Overlapping two Full Chimes  

---

## 8. Campaign beat transitions

Maps to FSCS `FSCS_CAMPAIGN_BEATS`:

| Beat | Recommended transition in | Recommended transition out |
| --- | --- | --- |
| opening-atmosphere | TX-MORNING-GLOW | Silence |
| discovery | Chime + TX-LIGHT-SWEEP | TX-CRYSTAL-FADE |
| emotional-peak | TX-LUXURY-DISSOLVE | Hold + silence |
| brand-reveal | TX-ARCH-REVEAL | TX-GLASS-REFLECT |
| logo | TX-CRYSTAL-FADE | End |

---

## 9. QA checklist

- [ ] Duration matches FSCS preset ±100ms  
- [ ] No environmental mistaken as brand transition  
- [ ] Silence honored where specified  
- [ ] Chime not doubled  
- [ ] Mobile audibility on crossfade  
