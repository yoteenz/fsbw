# Frontal Slayer Audio — Implementation Strategy

**Document:** IMPLEMENTATION_STRATEGY  
**Version:** 1.0  
**Status:** Canonical — **planning only, no code in this phase**  
**Registry:** DOC-AUD-020

---

## 1. Scope boundary (v1.0)

This phase delivers **architecture and documentation only**:

- ✅ Music Bible, sonic guides, libraries, naming, mixing rules  
- ⬜ Audio asset production (WAV/AAC files)  
- ⬜ Application runtime (`src/audio/`)  
- ⬜ Page-level integration  

**Do not implement code until Discovery Chime master (v1) is approved.**

---

## 2. Relationship to existing code systems

| System | Status | Audio relationship |
| --- | --- | --- |
| **FSMS** | Shipped `src/motion/` | Motion timing drives Chime/sweep sync |
| **FDS** | Shipped `src/design-system/` | Component → UI sonic mapping defined |
| **FSCS** | Shipped `src/cinematic/` | Cue IDs, beats, markers — align registry |
| **VisionEngineLuxuryAudio** | Legacy component | Audit before reuse — may not match FSMSS |
| **Studio OS audio docs** | Separate universe | Do not merge — link for Studio World bridge only |

---

## 3. Phased rollout

### Phase A — Canon & commission (current → next)

| Step | Deliverable | Owner |
| --- | --- | --- |
| A1 | Architecture docs (this folder) | Audio Direction |
| A2 | Discovery Chime commission brief | Executive Creative |
| A3 | Founder approval — Chime master v1 | Founder |
| A4 | UI pilot pack (5 sounds) | Sound designer |
| A5 | Arrival + Discovery score stems (30s each) | Composer |

**Exit gate:** Approved masters in `/audio-assets/masters/` (external storage)

### Phase B — Registry & derivatives

| Step | Deliverable |
| --- | --- |
| B1 | Populate `audio-asset-registry.yaml` |
| B2 | Export web/mobile/film derivatives per MIXING_GUIDELINES |
| B3 | FSCS + UI manifest YAML maps |
| B4 | QA pass — Music Bible checklist all assets |

### Phase C — Runtime engine (future code)

Planned location: `src/audio/` (not created in v1.0)

```
src/audio/                           # FUTURE — do not create yet
├── engine/
│   ├── mixer.ts                     # Volume Hierarchy
│   ├── themeController.ts           # Theme crossfade
│   └── cueScheduler.ts              # FSCS sync
├── hooks/
│   ├── useFsTheme.ts
│   ├── useUiSound.ts
│   └── usePrefersReducedSound.ts
├── registry/                        # Generated from YAML
└── index.ts
```

**Dependencies:** Web Audio API or Howler-style wrapper; respects autoplay policies.

### Phase D — Experience integration

| Surface | Theme | Priority |
| --- | --- | --- |
| Mobile Mansion entry | Mansion + UI | P0 |
| Discovery / first FS moment | Discovery Chime | P0 |
| Lobby / lounge | Arrival + environmental | P1 |
| Checkout confirm | UI confirm + micro chime | P1 |
| Campaign landing (FSCS) | Full timeline | P2 |
| SET-001 retail sync | Physical Chime match | P3 |
| Admin | UI off by default | P4 |

### Phase E — Studio World & AI pipeline

| Step | Deliverable |
| --- | --- |
| E1 | Export FSMSS metadata for experience compiler |
| E2 | AI video gen — camera + audio cue JSON sidecar |
| E3 | Automated mix validation (LUFS lint) |

---

## 4. Technical constraints (when coding begins)

| Constraint | Rule |
| --- | --- |
| Autoplay | No sound until guest gesture or narrative trigger |
| Bundle size | UI sounds < 500KB total AAC initial load |
| Latency | UI feedback < 50ms from trigger |
| Offline | Mansion core sounds cached |
| SSR | No audio on server |
| iOS silent switch | Respect hardware mute |

---

## 5. Integration hooks (spec only)

### 5.1 FSMS sync

```typescript
// FUTURE — illustrative only
onFsmsPhase('sparkle', () => playUi('UI-TONE-SPARKLE', { gain: -34 }));
onFsmsPhase('sweep', () => duckScore(-3));
```

### 5.2 FSCS sync

Map `FSCS_AUDIO_CUES` → registry asset IDs via `fscs-audio-map.yaml`.

### 5.3 FDS sync

Button mount → register `UI-BTN-TAP` on press; DrawerPanel → OPEN/CLOSE pair.

---

## 6. Testing strategy (future)

| Test | Method |
| --- | --- |
| Volume Hierarchy | Automated gain snapshot |
| Fatigue | 20-repeat script |
| Device matrix | iPhone, Android, desktop |
| Reduced sound | Preference disables P4–P7 |
| Chime cap | Session counter — max 1 Full |

---

## 7. Team roles

| Role | Responsibility |
| --- | --- |
| Founder | Chime approval, final theme listen |
| Executive Creative | Canon, campaign alignment |
| Audio Direction | Mix, registry, QA |
| Composer | Score stems |
| Sound designer | UI + environmental |
| Engineering | Phase C runtime |
| Product | Integration priority, UX caps |

---

## 8. Success metrics

| Metric | Target |
| --- | --- |
| Brand recognition (internal blind test) | ≥ 80% identify FS |
| UI fatigue score (1–5) | ≤ 2 after 10 min session |
| Chime approval | Founder "ship it" |
| LUFS compliance | 100% assets within spec |
| Environmental bleed | 0 brand violations in QA |

---

## 9. Explicit non-goals (v1.0)

- Spotify/Apple Music release of score  
- User-customizable UI sounds  
- Generative infinite score engine  
- Voice assistant sonic personality (PSA separate)  
- Studio OS default UI sounds  

---

## 10. Next action

**Commission Discovery Chime v1** using [DISCOVERY_CHIME_SPEC.md](./DISCOVERY_CHIME_SPEC.md) — this unblocks all derivative UI design and score motif work.
