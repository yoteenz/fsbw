# 08 — Audio Compiler

**Engine Module:** `studio.department-generator.v1.audio-compiler`  
**Status:** Sonic identity compilation system  
**Philosophy:** Every department should sound different. Sound is atmosphere, not notification.

---

## Design Principle

> The Generator compiles **Ambient Sound · Music Profile · Orb Audio · Department Effects · Notifications · Approval Sounds · Celebrations · Silence Rules** — Genome-transformed, DNA-personality-driven.

---

## Compiler Output

```yaml
AudioCompileResult:
  departmentId: DepartmentTypeId
  audioManifest: AudioManifest
  stemTasks: AudioStemTask[]        # → Asset Compiler generation
  spatialMap: SpatialAudioMap
  duckingRules: DuckingRule[]
  silenceRules: SilenceRule[]
```

---

## Audio Manifest Schema

```yaml
AudioManifest:
  version: semver
  departmentId: string
  layers:
    - id: room-tone
      type: ambient
      volumeRange: [0, 0.20]
      genomeSlot: customerEmotions
      loop: true
    - id: material-bed
      type: ambient
      volumeRange: [0, 0.08]
      genomeSlot: materialLanguage
      loop: true
    - id: zone-accent
      type: event
      triggers: VerbId[]
    - id: orb-voice
      type: voice
      volumeRange: [0.60, 0.80]
      genomeSlot: voice
    - id: ceremony
      type: ceremony
      ceremonies: CeremonyId[]
  effects:
    - id: pin-land
      trigger: pin
      durationMs: 80
    - id: branch-spawn
      trigger: branch
      durationMs: 400
    - id: approve-stamp
      trigger: approve
      durationMs: 1200
```

---

## Department Sonic Profiles

| Department | Room Tone Character | Accent Character |
|------------|--------------------|--------------------|
| creative-direction | Gallery air · faint warmth | Pin tactile · glass rise |
| discovery | Library hush · curious | Page turn · shelf slide |
| production | Floor activity muffled | Console tap · stamp |
| review | Cinema dim · quiet | Comparison sweep |
| publishing | Anticipation · open space | Launch bloom |
| executive-hq | Executive suite · measured | Briefing chime |
| law-firm | Library quiet · respectful | Brass rail tap |
| restaurant | Kitchen muffled · golden | Wood creak · sizzle metaphor |
| podcast | Studio booth · intimate | Mic warm · tape hiss subtle |
| medical | Clinical calm · soft HVAC | Gentle confirm tone |

---

## Genome Audio Adaptation

| Genome Field | Audio Expression |
|--------------|------------------|
| customerEmotions | Room tone stem selection |
| materialLanguage | Material bed resonance |
| voice | Orb + Concierge voice stems |
| experienceDNA | Layer density · ducking aggression |

### Company Examples

| Company | Sonic Identity |
|---------|----------------|
| Frontal Slayer | Warm salon air · soft fabric metaphor · jewelry-clink pin |
| NDX | Cool quiet room · precise glass tap · minimal bed |
| Restaurant | Golden hour warmth · muffled kitchen · wood shelf |

---

## Spatial Audio Map

```yaml
SpatialAudioMap:
  sources:
    - id: orb-voice
      position: orb-pedestal
      bias: right
    - id: brief-playback
      position: brief-wall
      bias: left
    - id: ceremony
      position: ceiling-grid
      bias: overhead
```

Runtime Audio Engine (12) executes spatial mix.

---

## Ducking Rules

| Event | Duck Target | Amount |
|-------|-------------|--------|
| Orb speaking | room-tone + material-bed | -50% |
| Ceremony stamp | all layers | -80% except ceremony |
| Voice note record | room-tone | -30% |

---

## Silence Rules

| Moment | Audio |
|--------|-------|
| Founder annotating | Room tone only |
| Ceremony stamp frame | All ducked — stamp isolated |
| `prefers-reduced-audio` | Mute all — visual-only |
| Reduced motion + audio off | Full mute |

---

## Audio Stem Generation Tasks

Each stem → one Asset Compiler task:

| Stem ID | Generation Type |
|---------|-----------------|
| `audio-ambient-{dept}` | Ambient loop generation |
| `audio-ceremony-{dept}` | Ceremonial one-shot |
| `audio-orb-{dept}` | Orb pulse bed |
| `audio-effects-{dept}` | Event effect pack |

Provider routing via Asset Compiler (14).

---

_Next: [09 — Animation Compiler](./09_ANIMATION_COMPILER.md)_
