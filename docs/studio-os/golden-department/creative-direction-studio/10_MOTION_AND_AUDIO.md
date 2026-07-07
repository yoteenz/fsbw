# 10 — Motion & Audio

**Golden Department:** Creative Direction Studio™  
**Section:** Cinematic & Sonic Philosophy — Nothing Static

---

## Motion Philosophy

> Motion communicates **life**, **material honesty**, and **creative energy** — never loading, never gimmick.

Creative Direction Studio™ breathes continuously. Stillness is **curated**, not **default**.

---

## Motion Principles

| Principle | Application |
|-----------|-------------|
| **Editorial pace** | Slow, confident — no snappy SaaS transitions |
| **Physical metaphor** | Pins stick · ribbons rise · glass refracts |
| **Ambient always-on** | Parallax, breathe, particles — sub-perceptual |
| **Ceremony weight** | Approval slower and louder than daily verbs |
| **Genome pacing** | `experienceDNA` multiplies base durations 0.8–1.2× |
| **Reduced motion respect** | Static beauty — all verbs functional |

---

## Continuous Environmental Motion

| Element | Animation | Rate | Zone |
|---------|-----------|------|------|
| Mood Wall parallax | Depth plane drift | 0.5px/s | Hero |
| Mood Wall breathe | Color temperature oscillation | 8s cycle | Hero |
| Floor reflection | Shimmer on light movement | Synced to key | Global |
| Particles | Ambient dust in hero key | Slow rise + fade | Hero |
| Window exterior | Cloud/sky shift | 120s cycle | Right flank |
| Observatory data | Ring node orbit | 20s per ring | Alcove |
| Glass table | Reflection shimmer on item place | 400ms trigger | Timeline |
| Brief Wall pins | Gentle sway (air current) | 0.5px amplitude | Brief |
| Orb idle | Glow breathe | 4s cycle | Orb |
| Library spines | Subtle highlight on browse | Inertia follow | Library |

**Reduced motion:** All continuous motion off · pin land instant · ceremony static seal.

---

## Event Motion Catalog

### Arrival Sequence

| Phase | Motion | Duration |
|-------|--------|----------|
| Materialize | Floor reflection fade in | 0.5s |
| Reveal | Camera dolly forward + rise | 1.5s |
| Identity | Mood Wall crossfade · Brief pins illuminate sequential | 1.0s |
| Orb greeting | Pedestal rotate 15° · Orb pulse | 1.0s |
| Settle | Camera descend to primary | 1.0s |

Total: 5s (7s first visit with zone reveal).

### Pin Land

| Step | Motion |
|------|--------|
| Approach | Asset flies from cursor to wall plane |
| Contact | Stick-bounce — 8px overshoot, settle |
| Settle | Shadow deepens · tag shimmer |
| Duration | 400ms ease-out |

### Branch Spawn

| Step | Motion |
|------|--------|
| Initiate | Timeline node glow |
| Rise | Glass ribbon extrudes upward 40mm |
| Label | Etched text fades in |
| Duration | 600ms |

### Approve Ceremony

| Step | Motion |
|------|--------|
| Camera | `ceremony` preset — elevated wide |
| Stamp | Seal presses into glass — 200ms weight |
| Glow | Radial bloom from node — 1.5s |
| Ribbon | Main path brightens |
| Duration | 3.5s total |

### Reject Dissolve

| Step | Motion |
|------|--------|
| Desaturate | 600ms |
| Scale down | 80% · drift to archive direction |
| Fade | 400ms |
| Library | Spine appears on shelf |

### Mood Crossfade

| Trigger | Motion |
|---------|--------|
| Project mood change | Hero wall palette crossfade 1.2s |
| Sandbox preview | Isolated — no hero affect |

### Departure

| Step | Motion |
|------|--------|
| Camera | `departure` path to Exit Portal |
| Audio | Ambient fade 2s |
| Duration | 2.5s |

---

## Camera Motion

| Preset | Path Character | Use |
|--------|----------------|-----|
| `arrival` | Slow dolly forward, slight rise | Entry |
| `hero` | Hold — Mood Wall dominant | Mood immersion |
| `primary` | Gentle descend — table focus | Default work |
| `orb` | Shift right — Orb center | Conversation |
| `ceremony` | Elevated wide — table center | Approval |
| `departure` | Reverse dolly to portal | Exit |

**Easing:** `cubic-bezier(0.4, 0.0, 0.2, 1.0)` — editorial.

**Rule:** No hard cuts except ceremony stamp frame.

---

## Zone Reveal (First Visit)

Sequential edge glow — not tutorial modal:

| Order | Zone | Glow Duration |
|-------|------|---------------|
| 1 | Brief Wall | 1s |
| 2 | Timeline Table | 1s |
| 3 | Reference Library | 1s |
| 4 | Sandbox | 1s (frost clears) |
| 5 | Observatory | 1s |

---

## Audio Philosophy

> Sound is **atmosphere**, not **notification**. The room has a sonic identity that Genome shapes.

---

## Audio Layers

| Layer | Character | Volume Range |
|-------|-----------|--------------|
| **Room tone** | Gallery air — faint HVAC, space | 0–20% |
| **Material bed** | Floor/wall resonance — sub-bass warmth | 0–8% |
| **Zone accent** | Library page · glass tap · pin land | Event-triggered |
| **Orb voice** | Primary intelligence channel | 60–80% when speaking |
| **Ceremony** | Stamp · bloom · unlock tone | 40% peak |
| **Ambient duck** | -50% room tone during Orb speak | Auto |

---

## Genome Audio Adaptation

| Company | Room Tone | Accent Character |
|---------|-----------|------------------|
| Luxury beauty | Warm salon air | Soft fabric · pin as jewelry clink |
| NDX finance | Cool quiet room | Precise glass tap |
| Restaurant | Kitchen muffled distance | Wood shelf creak |
| Law firm | Library hush | Brass rail soft tap |

Stems swap via `audio-ambient-cds` Genome slot `customerEmotions`.

---

## Event Audio Catalog

| Event | Sound | Duration |
|-------|-------|----------|
| Arrival begin | Room tone fade in | 2s |
| Pin land | Soft tactile tap | 80ms |
| Reference drop | Shimmer + fetch complete chime | 600ms |
| Branch spawn | Glass rise tone | 400ms |
| Approve stamp | Ceremonial press + bloom | 1.2s |
| Reject dissolve | Gentle fade tone | 500ms |
| Orb listen activate | Ring brighten tone | 200ms |
| Orb think | Soft processing | loop 1.2s |
| Genome pulse | Observatory chime | 800ms |
| Departure | Ambient fade out | 2s |

---

## Spatial Audio

| Source | Position |
|--------|----------|
| Orb voice | Orb pedestal — slight right bias |
| Brief Wall playback | Left wall direction |
| Library preview | Right flank |
| Ceremony | Overhead — ceiling grid |
| Timeline detail | Table surface — close |

Supports stereo/binaural where runtime allows — mono fallback always.

---

## Silence Rules

| Moment | Audio |
|--------|-------|
| Founder annotating | Room tone only — no voice interrupt |
| Ceremony stamp | All layers duck — stamp isolated |
| Reduced motion + audio off | Mute all — visual-only |

---

## SDK Alignment

| Standard | Document |
|----------|----------|
| Motion | `sdk/08_MOTION_STANDARD.md` |
| Audio | `sdk/09_AUDIO_STANDARD.md` |
| Runtime | `engine/department-runtime/` Animation + Audio subsystems |

---

## Quality Bar

| Test | Pass |
|------|------|
| 30-second idle | Room feels alive — not frozen screensaver |
| Pin test | Sound + motion feel physical |
| Ceremony test | Emotionally weighted — not checkbox |
| Genome swap | Audio stem crossfade seamless |
| Reduced motion | No jarring pops — static elegance |

---

_Next: [11 — Compiler & Runtime](./11_COMPILER_AND_RUNTIME.md)_
