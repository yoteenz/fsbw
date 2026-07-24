# Discovery Chime — Official Sonic Logo Specification

**Document:** DISCOVERY_CHIME_SPEC  
**Version:** 1.0  
**Status:** Canonical — **awaiting first master recording**  
**Registry:** DOC-AUD-022  
**Classification:** Founder approval required for any change

---

## 1. Role

The **Discovery Chime** is the **official Frontal Slayer sonic logo** — the audio equivalent of the wordmark. It marks the moment the universe acknowledges the guest:

> Nia notices Frontal Slayer. The world shifts. The guest feels it before they understand it.

It defines the **tonal language** for all future UI sounds, brand stings, and score motifs.

---

## 2. Narrative placement

| Context | Trigger | Variant |
| --- | --- | --- |
| **Film — Discovery beat** | Nia sees boutique / storefront | Full Chime |
| **Digital — first brand touch** | First intentional FS interaction post-arrival | Half Chime |
| **Flagship SET-001 entry** | Threshold crossing | Physical bell = Full Chime |
| **Campaign end card** | Logo resolve | Full Chime + tail |
| **Membership unlock** | Tier achievement | Half Chime |
| **Major confirmation** | Order complete, booking confirmed | Micro Chime (3-note max) |

**Frequency cap:** Full Chime **≤ 1× per session** unless Founder exception (e.g. film replay).

---

## 3. Sound design brief (commission target)

### 3.1 Character

- **Material:** Cast optical glass struck once — not metal doorbell, not digital beep  
- **Emotion:** Curiosity, intrigue, emotional shift — never celebration confetti  
- **Length (full):** 1.2–1.8 seconds total; meaningful energy in first 400ms  
- **Length (half):** 0.5–0.9 seconds  
- **Length (micro):** 0.15–0.35 seconds  

### 3.2 Technical targets

| Parameter | Full | Half | Micro |
| --- | --- | --- | --- |
| Peak | −22 LUFS | −26 LUFS | −28 LUFS |
| Fundamental | ~587 Hz (D5 region) | Same | Same |
| Partials | Glass series 1:2.4:3.8 (approx) | Reduced | Fundamental + one partial |
| Attack | 8–12ms | 6–10ms | 4–8ms |
| Decay tail | 800–1200ms | 300–500ms | 80–150ms |
| Stereo width | 40% (intimate) | 30% | Mono-safe |

### 3.3 Forbidden

- Major triad fanfare  
- Reverb drowning tail (> 1.5s RT60 perceived)  
- Pitch bend / slide  
- Multiple strikes in sequence (except micro variant explicit design)  
- Any resemblance to iOS default sounds, hotel desk bell clichés, or church bells  

---

## 4. Variants registry (planned assets)

| Asset ID | Name | Duration | Use |
| --- | --- | --- | --- |
| `fs-brand-chime-full-v1` | Discovery Chime Full | ~1.5s | Film, flagship, logo |
| `fs-brand-chime-half-v1` | Discovery Chime Half | ~0.7s | Digital first touch |
| `fs-brand-chime-micro-v1` | Discovery Chime Micro | ~0.25s | UI major confirm |
| `fs-brand-chime-tail-v1` | Discovery Chime Tail Only | ~1.0s | Transitions under score |

---

## 5. Relationship to score

When Chime plays:

1. **Nia's diegetic music** ducks −12dB over 200ms, fades out over 800ms (film)  
2. **Environmental** holds or ducks −3dB — never mute completely  
3. **Score** may enter **Discovery Theme** from Chime tail overlap (crossfade 600ms)  
4. **UI** remains silent for 500ms after Full Chime  

---

## 6. Physical retail lock (SET-001)

From Flagship Production Bible — bell in frame 001 must match app/Mansion arrival.

| Field | Requirement |
| --- | --- |
| Physical bell timbre | Matches `fs-brand-chime-full-v1` spectral centroid ±5% |
| Trigger | Automatic door or host-open at entry airlock |
| Visual | Bell visible or implied in architectural language |
| Digital sync | Guest app within geofence may trigger Half Chime on entry (future) |

---

## 7. QA listening test

Before any variant ships:

1. A/B against 5 reference luxury brands — FS must feel **quieter and more intentional**  
2. 20-repeat fatigue test — no annoyance  
3. Mobile speaker test — fundamental still perceptible on phone speaker  
4. Film mix test — intelligible under dialogue ducking  
5. Founder final listen — mandatory for Full variant  

---

## 8. Version control

| Version | Status | Notes |
| --- | --- | --- |
| v1.0 | **Spec only** | No master recording yet |
| v1.1+ | Future | Requires Founder sign-off |

**Do not implement in product until v1 master exists.**
