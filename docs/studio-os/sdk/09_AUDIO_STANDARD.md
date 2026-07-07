# 09 — Audio Standard

**SDK Module:** `studio.department.sdk.v1.audio`  
**Status:** Environmental and ceremonial audio law  
**Philosophy:** Departments have soundscapes — silence is also a designed choice

---

## Definition

The Audio Standard governs **all sound** inside a department — ambient environments, Orb voice, interaction feedback, ceremonies, celebrations, and the intentional absence of sound. Audio is Genome-adapted; SDK defines categories and rules.

---

## Audio Categories

| Category | ID | Description | Loop | Genome Hook |
|----------|----|-------------|------|-------------|
| **Ambient Environment** | `ambient` | Room tone — continuous atmospheric soundscape | Yes | `musicStyle` |
| **Department Ambience** | `ambience` | Department-specific atmospheric layer | Yes | `soundDesign` |
| **Orb Voice** | `orb-voice` | Orb and AI employee speech output | No | `voice` |
| **Interaction Feedback** | `feedback` | Verb confirmation sounds | No | `soundDesign` |
| **Notification** | `notification` | Alerts, arrivals, AI messages | No | `soundDesign` |
| **Approval Sound** | `approval` | Ceremonial approve seal | No | `signatureMoments` |
| **Celebration Sound** | `celebration` | Launch and milestone sounds | No | `signatureMoments` |
| **Environmental Audio** | `environmental` | Object-specific sounds (glass, footsteps, pages) | No | `materialLanguage` |
| **Silence** | `silence` | Intentional absence — designed quiet | — | `brandEmotions` |

---

## Audio Schema

```yaml
AudioAsset:
  id: string
  category: AudioCategory
  departmentId: string | "platform"
  format: enum                # ogg-ambient | wav-sfx | tts-voice
  duration: number            # seconds; 0 = loop
  volume: float               # 0.0–1.0 base; Genome may scale
  genomeAdaptable: boolean
  spatial: boolean            # 3D positioned or global
  trigger: string             # event that plays this sound
  cooldown: number            # minimum seconds between replays
  fallbackId: string | null
```

---

## Ambient Environment

The continuous soundscape that makes a department feel like a **place**.

| Rule | Specification |
|------|---------------|
| Presence | Every department has ambient audio — or intentional silence |
| Volume | 15–25% of max — never competes with interaction sounds |
| Crossfade | 2s crossfade when entering/exiting department |
| Genome | `musicStyle` domain provides genre, tempo, instrumentation character |
| Spatial | Global (not positioned) — fills the room |
| Loop | Seamless loop — no audible seam |
| Size budget | ≤ 2 MB per ambient track |

### Ambient Character by Style Register

| Register | Ambient Character |
|----------|-------------------|
| Luxury | Soft piano, strings, room tone with warmth |
| Editorial | Minimal — room tone, distant city, subtle texture |
| Minimal | Near-silence — room tone only, ≤ 10% volume |
| Industrial | Low machinery hum, ventilation, concrete resonance |
| Organic | Nature sounds filtered through windows, wood creaks |

---

## Orb Voice

Orb and AI employee speech output.

| Rule | Specification |
|------|---------------|
| Source | TTS engine with Genome `voice` domain parameters |
| Personality | Rate, pitch, warmth from Genome `personality` |
| Spatial | Positioned at Orb location — 3D audio |
| Interruption | New speech cancels previous — no overlap |
| Fallback | Text panel always available when audio unavailable |
| Languages | Genome `terminology` + user preference |

### AI Employee Voice Differentiation

Each AI role has a voice profile slot — Genome fills values:

| Role | Voice Character |
|------|-----------------|
| Creative Director | Confident, measured pace |
| Research Concierge | Curious, slightly faster |
| Production Manager | Direct, efficient |
| Quality Concierge | Precise, calm |
| Brand Concierge | Authoritative, warm |
| Legal Concierge | Formal, deliberate |
| Orb | Genome personality — warm default |

---

## Notifications

| Event | Sound Character | Duration | Cooldown |
|-------|-----------------|----------|----------|
| Department arrival | Soft chime + ambient fade in | 1s | — |
| AI message | Gentle tap | 0.3s | 5s |
| Task assigned | Soft bell | 0.5s | 10s |
| Blocker detected | Low tone | 0.5s | 30s |
| Genome update | Subtle shimmer | 0.8s | 60s |
| Approval pending | Single note | 0.4s | 30s |

Notifications are **subtle** — never startling. Volume: 30–40% of max.

---

## Department Ambience

Department-specific atmospheric layer beneath ambient.

| Department | Ambience Character |
|------------|-------------------|
| Marketing | Creative energy — subtle rhythmic texture |
| Creative | Studio atmosphere — muffled creative activity |
| Production | Focused quiet — clock tick, paper shuffle |
| Legal | Library quiet — page turns, distant footsteps |
| Operations | Operational hum — organized activity |

Ambience is optional if ambient environment is sufficient. Never stack more than 2 continuous layers.

---

## Approval Sounds

Ceremonial audio for the `approve` verb.

| Phase | Sound | Duration |
|-------|-------|----------|
| Station illuminate | Soft rising tone | 0.3s |
| Stamp descent | Decisive seal/stamp impact | 0.5s |
| Particle burst | Shimmer/sparkle | 1.0s |
| Completion | Resolving chord | 1.5s |

Genome `signatureMoments` may override with brand-specific approval sound (e.g., luxury brand: crystal chime; law firm: gavel tap).

**Rule:** Approval sound is never generic "ding" — it is a designed ceremony.

---

## Celebration Sounds

For launch celebrations and major milestones.

| Phase | Sound | Duration |
|-------|-------|----------|
| Mood Wall shift | Rising orchestral/synth swell | 2s |
| Particle burst | Celebration impact + sparkle | 2s |
| AI acknowledgment | Warm chord resolution | 1.5s |

Genome `signatureMoments` provides brand-specific celebration audio. Celebrations are rare — sound must feel earned.

---

## Environmental Audio

Object and material-specific sounds triggered by interaction.

| Interaction | Sound | Spatial |
|-------------|-------|---------|
| Item placed on glass | Soft glass tap | At object |
| Item dragged on surface | Subtle slide texture | At object |
| Panel open | Soft whoosh | At panel |
| Panel dismiss | Soft close | At panel |
| Pin to wall | Pin stick | At wall |
| Timeline scrub | Tick per increment | At timeline |
| Footstep (zone change) | Material-appropriate step | At camera |
| Page turn (asset browse) | Paper/fabric turn | At shelf |

Environmental audio volume: 20–30%. Material character from Genome `materialLanguage`.

---

## Silence Rules

Silence is a **designed state** — not an error.

| Condition | Behavior |
|-----------|----------|
| Genome `brandEmotions` includes "contemplative" | Reduced ambient volume (50%) |
| Ceremony zone active (pre-decision) | Ambient ducks to 30% — focus silence |
| User preference: quiet mode | All ambient/ambience muted; feedback only |
| Late hours (Life & Culture Preferences™) | Ambient volume reduces 50% after configured hour |
| `prefers-reduced-motion` | Ambient muted; notification sounds only |
| Recording/voice mode active | All audio ducks to 10% except Orb voice |

**Rule:** Never fill silence with unnecessary sound. Quiet departments (Legal, Production) may run ambient at ≤ 10%.

---

## Audio Mixing

| Layer | Volume Range | Ducking |
|-------|-------------|---------|
| Ambient | 15–25% | Ducks to 30% during ceremony, voice, notification |
| Ambience | 10–20% | Ducks with ambient |
| Orb voice | 70–80% | Ducks all other layers |
| Feedback | 30–40% | No ducking |
| Notification | 30–40% | Ducks ambient briefly |
| Ceremony | 50–70% | Ducks ambient to 10% |
| Environmental | 20–30% | No ducking |
| Celebration | 60–80% | Ducks ambient to 20% |

Master volume capped at 85% — never full digital max.

---

## Genome Adaptation

| Audio Element | Genome Domain |
|---------------|---------------|
| Ambient genre/tempo | `musicStyle` |
| Feedback character | `soundDesign` |
| Approval ceremony | `signatureMoments` |
| Celebration | `signatureMoments` |
| Orb/AI voice | `voice`, `personality` |
| Environmental texture | `materialLanguage` |
| Silence tendency | `brandEmotions` |
| Notification style | `soundDesign`, `interactionStyle` |

---

## Performance

| Rule | Specification |
|------|---------------|
| Preload | Ambient + approval sounds preloaded on department entry |
| Lazy load | Environmental sounds loaded on first interaction |
| Cache | Audio cached per department per session |
| Size budget | ≤ 3 MB total audio per department |
| Format | OGG Vorbis for ambient (loop); WAV for SFX (≤ 2s) |
| Fallback | Silent fallback — never block department load on audio failure |

---

## Forbidden Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| Generic system beeps | All sounds must be designed per category |
| Auto-play speech on entry | Orb speaks only when activated |
| Competing continuous layers | Max 2 loops (ambient + ambience) |
| Hardcoded music genres | Genome `musicStyle` controls genre |
| Silent failure | Audio failure → graceful mute, not error |
| Notification spam | Cooldown enforced on all notification sounds |

---

_Next: [10 — Company Genome Integration](./10_COMPANY_GENOME_INTEGRATION.md)_
