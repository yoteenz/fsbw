# Frontal Slayer Volume Hierarchy

**Document:** VOLUME_HIERARCHY  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-018

---

## 1. Purpose

When multiple audio layers compete, **Volume Hierarchy** resolves conflicts deterministically. Every implementer and mixer uses the same priority stack.

---

## 2. Priority stack (highest wins)

| Priority | Layer | Examples | Notes |
| --- | --- | --- | --- |
| **P0** | Dialogue (film) | Nia, concierge VO | Always intelligible |
| **P1** | Discovery Chime (Full) | Sonic logo | Never duck below audibility |
| **P2** | Discovery Chime (Half/Micro) | UI major confirm | |
| **P3** | Critical UI | Membership unlock, achievement | |
| **P4** | Standard UI | Tap, drawer, nav | |
| **P5** | Score (lead moment) | Flagship reveal, emotional peak | |
| **P6** | Score (bed) | Mansion hold, arrival fragment | |
| **P7** | Environmental | Birds, city, room tone | |
| **P8** | Structured silence | Mix gain reduction | Still "active" priority |

**Rule:** Higher priority **ducks** lower — lower never swells over higher without transition.

---

## 3. Ducking amounts (default)

| Higher → Lower | Duck amount |
| --- | --- |
| P0 → P5, P6, P7 | −12dB |
| P0 → P3, P4 | −6dB |
| P1 → all except P0 | −6dB (Chime stays) |
| P2 → P5, P6, P7 | −4dB |
| P3 → P5, P6, P7 | −3dB |
| P5 → P7 | −6dB |
| P6 → P7 | −3dB |

---

## 4. Absolute level ceilings

| Layer | Peak ceiling | Integrated (if loop) |
| --- | --- | --- |
| P0 Dialogue | −12 LUFS peak | −18 LUFS |
| P1 Full Chime | −20 LUFS | — |
| P2 Half/Micro Chime | −26 LUFS | — |
| P3 Critical UI | −22 LUFS | — |
| P4 Standard UI | −28 LUFS | — |
| P5 Score lead | −18 LUFS | −20 LUFS |
| P6 Score bed | −22 LUFS | −24 LUFS |
| P7 Environmental | −24 LUFS | −32 LUFS |

---

## 5. Simultaneous layer limits

| Context | Max active layers |
| --- | --- |
| Arrival district | P7 + optional P6 (one) |
| Discovery moment | P1 + P7 + P5 (intro) |
| Mansion explore | P6 + P7 + P4 (sparse) |
| UI form focus | P4 only; P6 ducked −8dB |
| Film dialogue scene | P0 + P7 only |
| Logo end card | P1 + P5 outro |

**Never:** P1 + P1 (double Full Chime)  
**Never:** P4 × 3 within 500ms  

---

## 6. User system volume

| Setting | Behavior |
| --- | --- |
| Media volume 0 | All silent |
| Media volume low | Scale P4–P7; P0–P3 minimum audibility for accessibility optional |
| Silent mode (hardware) | All silent |
| `prefers-reduced-sound` (future) | P4–P7 off; P1–P3 off except critical confirm optional |

---

## 7. Conflict resolution examples

### Example A — Discovery on film

- P0 dialogue + P7 city + Nia's music (diegetic, treated as P7)  
- Chime triggers → Nia's music fades out; Chime P1; score P5 enters  
- City ducks −3dB under Chime  

### Example B — Mansion + button tap

- P6 mansion hold −24 LUFS  
- User taps → P4 tap at −28 LUFS; P6 ducks −3dB for 200ms  
- No Chime unless major confirm  

### Example C — Arrival district

- P7 birds + wind at −32 LUFS  
- P6 optional motif at −30 LUFS — **must not exceed P7 perceptually**  

---

## 8. Implementation note (future code)

Volume Hierarchy will map to runtime mixer in planned `src/audio/engine/volumeHierarchy.ts` — **not implemented in v1.0 architecture phase**.

FSCS `FSCS_AUDIO_CUES` default volumes should align with this document when implementation begins.

---

## 9. QA test

Play **worst case stack** (Discovery + Mansion + UI spam + environment):

- [ ] Chime still clear  
- [ ] No clipping  
- [ ] No layer feels "wrongly loud"  
- [ ] Fatigue test 5 min — guest not exhausted  
