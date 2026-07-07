# 02 — Presentation Mode

**Engine Module:** `studio.walk-the-room.v1.presentation-mode`  
**Status:** Environment transition for immersive critique  
**Philosophy:** The room knows you are reviewing.

---

## Design Principle

> When Walk the Room™ begins, the department **transitions into Presentation Mode** — not a different app, not a overlay dashboard. The same place, recalibrated for review.

---

## The Arrival Sequence

```
1. Founder initiates Walk the Room (Orb command · department verb · critique session start)
2. Runtime flags: presentationMode = ACTIVE
3. Experience Engine transitions: Presentation Mode
4. Lighting subtly shifts (warmer key · softer fill · reduced contrast spikes)
5. Ambient audio ducks (-12dB · retain spatial identity)
6. Non-essential UI chrome fades (panels · notifications · dock minimized)
7. Camera gentle entry (if mid-session) OR holds arrival position (if fresh entry)
8. Studio Orb activates welcome state
9. Orb delivers welcome · scope prompt
10. Walkthrough path resolves · first stop queued
```

**Duration:** 3–5 seconds transition. Never jarring. Never loading screen.

---

## Orb Welcome Protocol

Example canonical welcome:

> "Welcome back.
>
> Today we'll review **Creative Direction Studio** for **Project 001**.
>
> We've identified **five opportunities** that may strengthen the experience.
>
> Would you like the **complete walkthrough** or only **critical observations**?"

| Scope Option | Behavior |
|--------------|----------|
| **Complete walkthrough** | Full path profile (07) — all stops |
| **Critical observations** | Filtered stops — scorecard failures · Braintrust concerns · open Room Memory issues |
| **Custom agenda** | Founder names topics · path resolver adapts |

Founder responds naturally via voice · Orb ring · or verbal selection.

---

## Presentation Mode Configuration

```yaml
PresentationModeConfig:
  mode: presentation-review           # distinct from conference · executive-review
  lighting:
    keyIntensity: 0.85              # relative to normal
    fillSoftness: 1.2
    accentSuppression: true         # reduce competing highlights during critique
  audio:
    ambientGain: -12dB
    conciergeVoicePriority: high    # AI voices clear over ambient
    spatialAudio: true              # concierges positioned in space
  ui:
    panelDensity: minimal
    notifications: suppressed
    critiqueAnnotations: spatial-only # no sidebar comment panel
  camera:
    defaultBehavior: follow-walkthrough
    founderControl: full            # founder may override at any time
    transitionEasing: editorial-slow
  objects:
    critiqueHighlightEnabled: true
    inactiveZoneDimming: 0.3        # focus current stop
```

---

## Experience Engine Integration

Walk the Room triggers **Experience Engine™** Presentation Mode with walk-specific overrides:

| Experience Engine Control | Walk the Room Override |
|---------------------------|------------------------|
| Lighting | Warmer · review-focused |
| Sound | Ducked ambient · clear concierge |
| Panel Density | Minimal |
| Motion | Subdued idle · ceremony preserved |
| Notification Behavior | Suppressed |
| Background Atmosphere | Retained — room stays alive |

**Rule:** Presentation Mode is **atmospheric recalibration** — not a sterile conference room.

---

## Runtime State

```yaml
RuntimePresentationState:
  sessionId: string
  walkId: string
  priorMode: enum                   # normal | founder | creative | etc.
  presentationActive: boolean
  currentStop: WalkthroughStop | null
  activeConcierges: ConciergePresence[]
  spatialCritiquesVisible: SpatialCritique[]
  livePreviewLayer: PreviewLayerState | null
```

Exit Presentation Mode only when walk completes or founder explicitly exits.

---

## Camera Behavior

| Moment | Camera |
|--------|--------|
| Arrival | Gentle dolly to first stop OR hold if founder already positioned |
| Stop transition | Orb-guided · concierge may lead |
| Founder interrupt | Camera yields to founder control immediately |
| Live preview | Camera frames affected object/zone |
| Debate | Camera holds neutral group framing |
| Summary | Slow pull to room overview |

**Anti-pattern:** Cut-scene jumps. **Canonical:** Editorial camera movement.

---

## Multi-Environment Support

Walk the Room is not department-only:

| Environment Type | Presentation Mode Host |
|------------------|------------------------|
| Department workspace | Department Runtime |
| Project Mission Control | Project runtime view (future spatial) |
| Campaign preview | Marketing department · landing preview zone |
| Marketplace listing | Marketplace demonstration environment |
| Headquarters tour | Multi-department path |
| Expansion preview | Staged expansion environment |

Each host implements `PresentationModeCapable` contract (12).

---

## Exit Presentation Mode

```
Walk completes OR founder says "exit review"
    ↓
Orb confirms action items captured
    ↓
Presentation Mode fades (3s)
    ↓
Prior Experience Mode restored
    ↓
Room Memory persisted
    ↓
Normal department operation resumes
```

Incomplete walks may resume — Room Memory restores stop position.

---

_Next: [03 — Spatial Critiques](./03_SPATIAL_CRITIQUES.md)_
