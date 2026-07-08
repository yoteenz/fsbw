# Scene Assembly Blueprint — Creative Direction Studio™

**Schema ID:** `studio.department-generator.v1.assembly-blueprint`  
**Department ID:** `creative-direction`  
**Package ID:** `pkg-creative-direction-golden-v1`  
**Assembly Mode:** zone-anchor-procedural

---

## Purpose

Describe how **Department Runtime™** and **Cursor** assemble FAL-cooked assets into a living Creative Direction Studio™ — without a designer manually positioning every object.

---

## Inputs

| Artifact | Path |
|----------|------|
| Department Manifest | [department.json](./department.json) |
| Environment Blueprint | [environment-blueprint.md](./environment-blueprint.md) |
| Asset Manifest | [asset-manifest.json](./asset-manifest.json) |
| Interaction Manifest | [interaction-manifest.json](./interaction-manifest.json) |
| Room DNA | [room-dna.json](./room-dna.json) |
| Prompt Package | [fal-prompt-package/](./fal-prompt-package/) |
| Cooked Package | `DepartmentPackage.zip` (post Asset Compiler) |

---

## World Assembly Order

| Order | Subsystem | Assets |
|-------|-----------|--------|
| 1 | Shell | env-shell-cds |
| 2 | Surfaces | env-floor-cds, env-ceiling-cds, env-alcove-cds |
| 3 | Windows + glass | env-window-cds, glass-panels-cds |
| 4 | Lighting | lighting-rig-cds (+ Genome injection) |
| 5 | Furniture | table-timeline-cds, table-sandbox-cds, shelf-library-cds |
| 6 | Intelligence zones | wall-mood-cds, wall-brief-cds, observatory-cds, screen-compare-cds, pedestal-orb-cds, orb-cds |
| 7 | Atmosphere + navigation | particles-ambient-cds, portal-entry-cds, portal-exit-cds, camera-paths-cds |
| 8 | AI + audio + ceremony | ai-*, audio-*, ceremony-approval-cds |
| 9 | Content seeds (optional) | seed-mood-cds, seed-brief-cds, seed-library-cds |

---

## Placement Rules

### Strategy: `zone-anchor`

| Zone | Anchor | Assets | Mode |
|------|--------|--------|------|
| mood-wall | Z=0.95, full width, elevated | wall-mood-cds | wall-flush-center · floor-to-ceiling-hero |
| brief-wall | X=-0.85, left wall | wall-brief-cds | wall-flush-left |
| observatory | X=-0.55, Z=0.2, alcove | observatory-cds | alcove-pedestal-center |
| timeline-table | X=0, Z=0.35, center | table-timeline-cds | floor-centered · clearance 1.2m |
| sandbox | X=0.2, Z=0.15, behind table | table-sandbox-cds, screen-compare-cds | floor-centered · lower elevation |
| reference-library | X=0.75, Z=0.25 | shelf-library-cds | wall-adjacent-right |
| orb-command | X=0.35, Y=0.55, Z=0.4 | pedestal-orb-cds → orb-cds | pedestal-elevated · stack order |
| arrival-threshold | Z=-0.9, center-left | portal-entry-cds | portal-threshold |
| departure-threshold | Z=-0.9, center-right | portal-exit-cds | portal-threshold |

### Auto-Distribute

| Category | Method | Density | Exclude Zones |
|----------|--------|---------|---------------|
| decor (future) | perimeter-scatter | 0.3 | arrival, orb-command |

---

## Scene Graph Layers

```yaml
root: department-root-cds
layers:
  - id: environment
    renderOrder: 0
    children: [env-shell-cds, env-floor-cds, env-ceiling-cds, env-window-cds, env-alcove-cds]
  - id: furniture
    renderOrder: 1
    children: [table-timeline-cds, table-sandbox-cds, shelf-library-cds]
  - id: intelligence
    renderOrder: 2
    children: [wall-mood-cds, wall-brief-cds, observatory-cds, screen-compare-cds, orb-cds]
  - id: orb-pedestal
    renderOrder: 2
    children: [pedestal-orb-cds]
  - id: vfx
    renderOrder: 3
    children: [particles-ambient-cds]
  - id: navigation
    renderOrder: 4
    children: [portal-entry-cds, portal-exit-cds]
  - id: interaction-colliders
    renderOrder: 5
    invisible: true
    source: interaction-manifest.json
```

**Law:** No `background-plate` layer.

---

## Lighting Assembly

| Property | Value |
|----------|-------|
| Rig source | lighting-rig-cds → `lighting/rig.json` |
| Genome slots | lightingStyle |
| Room DNA | warmth slider modulates key temperature |
| Shadows | soft-editorial |
| Ambient occlusion | true |
| Accent | Orb uplight · Brief pin spots · Observatory internal glow |

Injection phase: **post-shell, pre-furniture**

---

## Camera Assembly

| Position ID | Focal | Purpose |
|-------------|-------|---------|
| `arrival-exterior` | 24mm | Pre-entry |
| `arrival-threshold` | 35mm | Entry ceremony end |
| `hero-mood-wall` | 50mm | Mood Wall hero framing |
| `primary-work` | 40mm | Timeline Table default |
| `orb-conversation` | 50mm | Orb speak mode |
| `observatory-inspect` | 85mm | Domain zoom |
| `ceremony-approve` | 35mm | Approval camera travel |
| `departure` | 28mm | Exit path |

### Transitions

| Transition | Duration | Easing |
|------------|----------|--------|
| arrival | 5000ms (7000ms first visit) | ceremony-dolly |
| focus-object | 1200ms | inspect-orbit |
| orb-conversation | 800ms | smooth-shift |
| creative-approval | 3000ms | ceremony-weight |

Source: `fal-prompt-package/camera.md`

---

## Animation Assembly

| Profile | ID |
|---------|-----|
| Department animation | continuous-ambient-ceremony-weight |

### Ambient Loops (Always On)

| Asset | Animation |
|-------|-----------|
| wall-mood-cds | Parallax 0.5px/s · color breathe 8s |
| env-floor-cds | Reflection shimmer |
| particles-ambient-cds | Gold dust rise + fade |
| env-window-cds | Exterior breathe 120s |
| observatory-cds | Ring orbit 20s |
| orb-cds | Idle glow breathe 4s |
| wall-brief-cds | Pin sway 0.5px |

### Ceremony Bindings

| Ceremony | Animation Sequence |
|----------|-------------------|
| creative-direction-arrival | floor-fade → dolly → mood-reveal → brief-illuminate → orb-greet |
| creative-approval | camera-travel → seal-glow → production-signal |
| branch-promotion | ribbon-merge → sandbox-frost |
| direction-reject | dissolve → library-shelf |

Source: `fal-prompt-package/animation.md`

---

## Physics Assembly

| Property | Value |
|----------|-------|
| Physics enabled | false |
| Navigation only | true |
| Walk mesh | navigation graph from environment-blueprint |
| Collision groups | shell, furniture, intelligence |

---

## Navigation Assembly

| Property | Value |
|----------|-------|
| Graph | environment-blueprint.md#navigation |
| Avatar mode | ghost-walk |
| Zone triggers | true |
| Arrival | creative-direction-arrival ceremony |
| Orb routing | orb.voice-triage → zone camera shift |

---

## Genome Injection

| Phase | Timing |
|-------|--------|
| Injection point | post-shell-pre-furniture |
| Slots | materialLanguage, lightingStyle, editorialDirection, photographyDirection, voice, sonicIdentity |
| Shader targets | env-floor-cds, env-shell-cds, wall-brief-cds, lighting-rig-cds, orb-cds |

Observatory reads live Genome — domains pulse on update.

---

## Cursor Handoff

### Behavior Contracts

| Contract ID | Handler | Zone |
|-------------|---------|------|
| `brief-wall.pin-to-section` | `creativeDirection.pinToBrief` | brief-wall |
| `mood-wall.pin-reference` | `creativeDirection.pinToMoodWall` | mood-wall |
| `mood-wall.promote-direction` | `creativeDirection.promoteReference` | mood-wall |
| `timeline.scrub-sequence` | `creativeDirection.scrubTimeline` | timeline-table |
| `timeline.spawn-ribbon` | `creativeDirection.branchTimeline` | timeline-table |
| `creative-approval.ceremony` | `project.commitCreativeApproval` | timeline-table |
| `sandbox.promote-to-timeline` | `creativeDirection.promoteSandboxBranch` | sandbox |
| `sandbox.spawn-experiment` | `creativeDirection.spawnSandbox` | sandbox |
| `orb.voice-triage` | `orb.routeVoiceCommand` | orb-command |
| `orb.generate-three-alternates` | `creativeDirection.generateAlternates` | sandbox |
| `observatory.zoom-domain` | `genome.inspectDomain` | observatory |
| `library.drag-to-mood-or-table` | `creativeDirection.transferReference` | reference-library |
| `arrival.creative-direction` | `runtime.playArrivalCeremony` | arrival-threshold |
| `navigation.departure` | `runtime.navigateToDepartment` | departure-threshold |

### Project State Bindings

| Zone | State Key |
|------|-----------|
| brief-wall | `project.creativeDirection.brief` |
| mood-wall | `project.creativeDirection.moodBoard` |
| timeline-table | `project.creativeDirection.timeline` |
| sandbox | `project.creativeDirection.sandbox` |
| observatory | `company.genome.snapshot` |
| reference-library | `project.creativeDirection.library` |

### Production Signals

| Event | Signal |
|-------|--------|
| creative-approval ceremony | `production.unlock.story` · `production.unlock.production` |
| branch-promotion | `project.creativeDirection.mainBranchUpdated` |
| direction-reject | `project.creativeDirection.archived` |

---

## Boot Sequence

| Phase | Subsystem | Target |
|-------|-----------|--------|
| 1. LOADING | Asset Loader | < 2s |
| 2. GENOME_INJECTING | Genome Injection | < 500ms |
| 3. ASSEMBLING | World Assembler | < 1s |
| 4. HYDRATING | Project Runtime | variable |
| 5. ARRIVING | Camera + Animation + Audio | 5–7s |
| 6. ACTIVE | State Manager | — |

---

## Validation Checks (Pre-ACTIVE)

| Check | Rule |
|-------|------|
| no-flattened-background | sceneGraph must not contain background-plate |
| orb-present | intelligence layer includes orb-cds |
| hero-object | wall-mood-cds placed in mood-wall zone |
| interaction-colliders | every interaction-manifest object has collider |
| sandbox-isolation | sandbox mutations do not write main project state until approve |
| genome-observatory | observatory-cds bound to live Genome feed |
| walk-the-room | markers-walk-room-cds loaded with navigation layer |
| discover-exit | portal-exit-cds routes to `discovery` department |

---

## Mobile Adaptation

| Aspect | Mobile Behavior |
|--------|-----------------|
| Camera | Single primary-work default · zone focus transitions replace walk |
| Navigation | Tap zone markers in radial menu — not ghost-walk |
| Mood Wall | Horizontal scrub primary · pinch compare |
| Timeline | Vertical stack fallback for table content planes |
| Orb | Full-width conversation mode — pedestal remains visible in mini form |
| Walk the Room™ | Guided zone sequence — auto camera path vs free walk |
| Particles | Reduced density 50% · optional off per device tier |
| Asset budget | Lazy-load decor · stage 9 seeds deferred |

**Law:** All verbs functional on mobile — beauty may simplify, never disable approve/branch.

---

## Desktop Adaptation

| Aspect | Desktop Behavior |
|--------|------------------|
| Camera | Full camera path set · mouse orbit on inspect |
| Navigation | Ghost-walk + zone triggers |
| Mood Wall | Full parallax depth planes |
| Multi-panel | Floating context panels alongside hero view |
| Walk the Room™ | Free path following floor markers |
| Keyboard | Paste link · shortcuts for approve/reject with permission gates |

---

## Fallback Behavior

| Condition | Fallback |
|-----------|----------|
| Asset load fail | Placeholder genome-tinted bounding box — zone still interactive |
| Reduced motion | Static beauty per interaction-manifest |
| Low bandwidth | Environment shell + hero mood wall priority load |
| No project context | Seed brief + mood from Company Genome only |
| Genome unavailable | Default Room DNA slider snapshot |

---

## Runtime Handoff Summary

```
assembly-blueprint (this doc)
         ↓ compile
runtime-assembly-manifest.json
         ↓
Department Runtime™ boot
         ↓
Cursor wires behaviorContracts + projectStateBindings
         ↓
ACTIVE — living Creative Direction Studio™
```

**Engine reference:** [12 Runtime Handoff](../../engine/department-generator/12_RUNTIME_HANDOFF.md)
