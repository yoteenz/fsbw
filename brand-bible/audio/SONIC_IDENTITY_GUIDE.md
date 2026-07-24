# Frontal Slayer Sonic Identity Guide

**Document:** SONIC_IDENTITY_GUIDE  
**Version:** 1.0  
**Status:** Canonical  
**Registry:** DOC-AUD-011

---

## 1. What Frontal Slayer sounds like

Frontal Slayer audio should feel comparable in intention to **Apple product films**, **Disney/Pixar score restraint**, and **A24 atmospheric precision** — never like a gaming UI, never like a Shopify notification pack, never like a hype reel.

**Three words:** Quiet. Glass. Human.

---

## 2. Sonic DNA pillars

| Pillar | Meaning | Anti-pattern |
| --- | --- | --- |
| **Architectural** | Space defines sound — reverb tails suggest marble, glass, height | Flat, dry click packs |
| **Crystal** | Bright partials, soft attack, no harsh transients | Metallic ping spam |
| **Breathing** | Silence between events; never wall-of-sound | Continuous UI chatter |
| **Motivic** | Short recognizable cells derived from Discovery Chime | Random SFX library |
| **Diegetic respect** | World sounds real before score enters | Score over birds/city |

---

## 3. Discovery Chime — sonic logo

The **Discovery Chime** is the **official Frontal Slayer sonic logo**. It defines the tonal language for:

- All UI sonic families  
- Score motif DNA (MOTIF-DISCOVERY-01)  
- Flagship entry bell (SET-001 continuity)  
- Campaign brand stings ( restrained )  

**Full spec:** [DISCOVERY_CHIME_SPEC.md](./DISCOVERY_CHIME_SPEC.md)

### Derivative rule

Every brand sonic (L2) must be traceable to the Chime's:

1. **Fundamental pitch class**  
2. **Overtone ratio** (glass partial series)  
3. **Attack envelope** (< 12ms soft rise)  
4. **Decay tail** (≥ 400ms for full; ≥ 120ms for UI micro)

If a sound cannot be described as "a fragment of the Chime," it is not on-brand.

---

## 4. Reusable sonic families (L2 Brand Sonic)

All UI and transition sounds belong to one of **five families**. Each family shares envelope, partial structure, and dynamic range.

| Family ID | Name | Character | Primary use |
| --- | --- | --- | --- |
| **SF-GLASS** | Glass Tap | Crystal strike, short tail | Buttons, toggles, glass panels |
| **SF-AIR** | Air Shift | Soft whoosh-less breath | Drawers, modals, page transitions |
| **SF-CHIME** | Chime Statement | Discovery-derived | Confirmations, unlocks, arrival |
| **SF-TONE** | Warm Tone | Felt-key single note | Hover, focus, subtle feedback |
| **SF-SILENCE** | Structured Silence | Gain reduction + room | Pre-reveal, error recovery |

### Family relationship diagram

```
Discovery Chime (sonic logo)
    ├── SF-CHIME (direct derivatives)
    ├── SF-GLASS (partial + transient match)
    ├── SF-TONE (fundamental + soft harmonic)
    ├── SF-AIR (noise-shaped, no harsh HF)
    └── SF-SILENCE (mix action, not file)
```

---

## 5. Forbidden brand sounds

| Category | Examples | Why |
| --- | --- | --- |
| **Arcade** | Coin, level-up, 8-bit | Breaks luxury |
| **Aggressive** | Buzzer, alarm, klaxon | Breaks hospitality |
| **Generic SaaS** | Slack pop, default iOS tri-tone clones | Not ownable |
| **Trendy** | TikTok risers, meme stingers | Not timeless |
| **Horror / tension** | Dissonant clusters for errors | Use gentle SF-TONE downgrade |
| **Environmental as brand** | Bird chirp as logo, coffee shop bell as UI confirm | Violates L3 boundary |

---

## 6. Emotional progression (brand sonic)

UI sounds follow micro-arcs:

| Interaction weight | Sonic behavior |
| --- | --- |
| **Light** (hover, focus) | SF-TONE, −32 LUFS, no tail requirement |
| **Medium** (tap, toggle) | SF-GLASS, −28 LUFS, < 200ms tail |
| **Heavy** (confirm, unlock) | SF-CHIME fragment, −24 LUFS, 200–600ms tail |
| **Critical** (membership, achievement) | Full or half Chime, once, −22 LUFS max |

Errors **never** punish. They **clarify** with a lower, softer SF-TONE variant — never red-alert aesthetics in audio.

---

## 7. Dynamics summary

| Layer | Typical range | Peak cap |
| --- | --- | --- |
| Environmental | −40 to −28 LUFS | −24 LUFS |
| Score | −30 to −20 LUFS | −18 LUFS (peaks) |
| Brand Sonic (UI) | −32 to −22 LUFS | −18 LUFS (transient) |
| Discovery Chime (full) | −24 LUFS | −20 LUFS |

See [VOLUME_HIERARCHY.md](./VOLUME_HIERARCHY.md) for conflict resolution.

---

## 8. Tempo & rhythm (UI)

- UI sounds are **atemporal** — no rhythmic grids.  
- Never imply a BPM through repeated UI loops.  
- Loading states use **ambient score** or **silence**, not ticking clocks.  
- Elevator travel may use **SF-AIR** with **Mansion motif** undertone (score layer), not UI family alone.

---

## 9. Silence as identity

Structured silence is a **first-class design element**:

- **Pre-reveal silence:** 600–1200ms (matches FSCS)  
- **Post-error silence:** 300ms before next UI sound allowed  
- **Arrival district:** Score may be **absent** for first 5–10s — environment only  
- **Session open:** No sound on cold start until guest action or narrative trigger  

---

## 10. Brand vs environmental boundary (critical)

| Question | Brand (L1/L2) | Environmental (L3) |
| --- | --- | --- |
| Ownable by Frontal Slayer? | Yes | No |
| Reused across products? | Yes | Scene-specific |
| Named `fs-brand-*`? | Yes | **Never** |
| Can appear in logo moment? | Yes (Chime) | No |
| Source | Commissioned original | Library / field record |

Examples:

- **Brand:** Discovery Chime, glass tap confirm, Mansion theme  
- **Environmental:** Birds, wind, café espresso machine, city traffic, boutique bell *in film diegesis before brand lock*  

**Flagship exception:** Physical entry bell at SET-001 **must** match Discovery Chime — it crosses from environmental gesture to brand statement at the threshold.

---

## 11. Recognition test

A sound passes if:

1. Played in isolation, a team member says "that could only be Frontal Slayer."  
2. Played in a mix, it does not compete with environmental realism.  
3. Paired with FSMS motion, attack aligns within ±30ms of visual sparkle/sweep.  
4. It is not annoying after 20 repetitions in a UX session.

---

## 12. Approval roles

| Change | Approver |
| --- | --- |
| Discovery Chime alter | Founder |
| New sonic family | Executive Creative |
| UI sound addition | Product + Audio Direction |
| Environmental library add | Audio Direction only |
| Theme motif change | Executive Creative + Film lead |
