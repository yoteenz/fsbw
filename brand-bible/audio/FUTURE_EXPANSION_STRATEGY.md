# Frontal Slayer Audio — Future Expansion Strategy

**Document:** FUTURE_EXPANSION_STRATEGY  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-021

---

## 1. Vision

Frontal Slayer audio should evolve into an ecosystem comparable to **Apple**, **Disney**, **Pixar**, and major cinematic franchises — where **three seconds of sound** identifies the universe.

FSMSS v1.0 establishes constitution. This document defines **long-term expansion** without breaking canon.

---

## 2. Expansion pillars

| Pillar | Horizon | Description |
| --- | --- | --- |
| **Territory** | 0–12 mo | New themes for new spaces (Penthouse, Salon, Institute) |
| **Platform** | 0–18 mo | Retail speakers, event installations, spatial audio |
| **Pipeline** | 6–24 mo | AI-assisted score stems + automated mix QA |
| **Franchise** | 12+ mo | Sequels, spin-offs, partnerships — motif inheritance |
| **Archive** | Ongoing | Seasonal variants, campaign limited stings |

---

## 3. New theme protocol

When a new **place** needs identity (e.g. Salon Suite, Knowledge Vault):

1. Propose in Theme Library amendment  
2. Define emotion, instrumentation, motif relationship to MOTIF-DISCOVERY-01  
3. Compose 30s proof  
4. Founder / Executive Creative approval  
5. Register stems — **never** ad-hoc page sounds  

**Max active themes in one session:** 2 (crossfade, not stack)

---

## 4. Seasonal & campaign variants

| Type | Allowed | Rules |
| --- | --- | --- |
| **Seasonal stem** | Yes | Motif intact; arrangement only (e.g. holidays — subtle) |
| **Campaign sting** | Yes | ≤ 3s; must include Chime fragment |
| **Collaboration remix** | Founder approval | Partner cannot alter Chime |
| **Limited drop** | Yes | Deprecate after campaign — registry archive |

---

## 5. Physical retail expansion (SET-001+)

| Capability | Future |
| --- | --- |
| Threshold Chime sync | App geofence + physical bell |
| Zone-based ambience | Showroom vs salon vs consult — different ENV beds |
| Private suite | Reduced ENV; score bed only |
| Event mode | Temporary mix profile — still Volume Hierarchy |

Reference: `brand-bible/environments/flagship-production-bible.md`

---

## 6. Studio World integration

Studio World experiences **inherit Mansion Theme DNA** with department variants:

| Department | Audio direction |
| --- | --- |
| Creative Direction Studio | Mansion + glass UI |
| Experience Lab | FSCS timeline-driven |
| Headquarters | Reduced UI; ambient score optional |
| Institute | Quiet — SF-TONE only |

**Do not** import Studio OS generic audio into Frontal Slayer guest surfaces.

Bridge document (future): `brand-bible/audio/studio-world-audio-bridge.md`

---

## 7. AI generation pipeline

### 7.1 Goals

- Export **FSMSS metadata JSON** alongside video generation prompts  
- Auto-suggest camera (FSCS) + audio cue placement  
- Validate generated audio against Music Bible rules (LUFS, instrumentation lint)  

### 7.2 Sidecar format (planned)

```json
{
  "fsmss_version": "1.0",
  "theme": "THEME-FLAGSHIP",
  "cues": [
    { "at_ms": 0, "asset": "env-city-distant-v1", "layer": "environmental" },
    { "at_ms": 4200, "asset": "fs-brand-chime-half-v1", "layer": "brand" }
  ],
  "transitions": ["TX-ARCH-REVEAL"]
}
```

### 7.3 Non-goals

- AI replacing Discovery Chime master  
- Fully generative infinite score without human approval  
- Environmental sounds as "generated brand"  

---

## 8. Spatial & immersive audio

| Technology | Use case | Priority |
| --- | --- | --- |
| Stereo | Default all surfaces | Now |
| Binaural | Mansion headphone mode | Future |
| Ambisonic | Studio World VR | Future |
| 5.1 / Atmos | Lounge / flagship film | Selective |
| Haptic sync | Mobile tap confirm | Optional |

All spatial formats **must collapse** to stereo for mobile fallback.

---

## 9. Partnership & licensing

| Scenario | Rule |
| --- | --- |
| Co-brand campaign | Partner music stays separate; FS Chime on FS moments only |
| Influencer content | Provide "FS Audio Pack" — approved stems only |
| Stock licensing | Never license Chime or score stems externally |
| Cover versions | Forbidden without Founder deal |

---

## 10. Accessibility expansion

| Feature | Future |
| --- | --- |
| `prefers-reduced-sound` | First-class media query |
| Captions for meaningful sounds | "[Discovery chime]" in transcript |
| Haptic substitution | Optional for critical confirms |
| Visual Chime | FSMS sparkle sync when sound off |

---

## 11. Metrics & evolution

Review FSMSS annually:

| Review | Question |
| --- | --- |
| Recognition | Do guests associate sound with FS? |
| Fatigue | UX session sound count trending? |
| Canon drift | Any page using off-brand audio? |
| Motif strength | Is Discovery DNA still coherent? |

Version bump to FSMSS 2.0 only with Executive Creative + Founder sign-off.

---

## 12. Document roadmap (audio folder)

| Future doc | Purpose |
| --- | --- |
| `studio-world-audio-bridge.md` | Department audio mapping |
| `retail-speaker-calibration.md` | SET-001 physical install |
| `spatial-audio-spec.md` | Binaural/Atmos rules |
| `partnership-audio-pack.md` | External creator guidelines |
| `seasonal-variant-registry.md` | Limited campaign audio |

---

## 13. North Star alignment

Every expansion must pass:

> *Does this deepen the world without explaining it?*

If audio **announces** instead of **invites**, it does not expand — it violates canon.

---

## 14. Summary

FSMSS v1.0 is the **constitution**. Future work builds **rooms in the same house** — new themes, platforms, and pipelines — always orbiting the **Discovery Chime** as sonic sun.

**Next milestone:** Discovery Chime master recording → UI pilot → Mansion integration → Studio World bridge → AI sidecar export.
