# 06 — Interaction Compiler

**Engine Module:** `studio.department-generator.v1.interaction-compiler`  
**Status:** Interaction map generation system  
**Philosophy:** Interaction metadata is separate from visual assets. Verbs are law, not UI events.

---

## Design Principle

> Every object receives **states · permissions · events · hover · click · drag · voice · annotation · comparison · approval · branching · inspection** — compiled as data, not embedded in meshes.

---

## Compiler Output

```yaml
InteractionCompileResult:
  departmentId: DepartmentTypeId
  interactionMap: InteractionMapManifest
  ceremonyBindings: CeremonyBinding[]
  permissionGates: PermissionGate[]
  gestureBindings: GestureBinding[]
  stateMutations: StateMutationMap
```

Exported as `interactions/interaction-map.json` in Department Package (13).

---

## Interaction Map Schema

```yaml
InteractionMapManifest:
  version: semver
  departmentId: string
  primaryVerbs: VerbId[]
  zones:
    - zoneId: string
      objects:
        - objectId: string
          allowedVerbs: VerbId[]
          states: ObjectStateBinding[]
          events:
            - verb: VerbId
              trigger: enum          # tap | long-press | drag | drop | hold | speak | pinch
              behavior: string       # runtime behavior contract ID
              audioCue: string | null
              animationCue: string | null
              stateMutation: string | null
              permission: string | null
```

---

## Verb Compilation by Department DNA

| DNA interactionStyle | Primary Verbs |
|---------------------|---------------|
| editorial | pin · annotate · compare · reference-drop · approve · reject |
| command | scrub · branch · approve · drag · click |
| gallery | browse · filter · inspect · preview · pin |
| workshop | drag · branch · preview · compare · annotate |
| executive | inspect · speak · approve · compare |

All verbs must exist in SDK verb registry (04_INTERACTION_ENGINE).

---

## Creative Direction Interaction Map (Reference)

Canonical binding from Golden Department `08_INTERACTION_MAP.md`:

| Zone | Primary Verbs |
|------|---------------|
| Mood Wall | pin · drag · cluster · compare · annotate · reject · approve · reference-drop · scrub |
| Timeline Table | scrub · drag · click · compare · branch · approve · reject |
| Sandbox | branch · compare · preview · approve · reject · speak |
| Orb Command Center | speak · touch |
| Observatory | inspect · compare · speak · pin |
| Reference Library | browse · filter · drag · preview · search · pin |
| Brief Wall | pin · annotate · drag · compare · speak |

Generator compiles this automatically for `creative-direction` DNA — not hand-authored per company.

---

## Ceremony Bindings

```yaml
CeremonyBinding:
  id: CeremonyId                  # creative-approval | story-approval | launch-ceremony
  triggerVerb: approve
  triggerObject: string
  cameraPreset: ceremony
  audioCue: audio-ceremony-{dept}
  animationProfile: ceremony-stamp
  durationMs: number
  sideEffects:
    - lockDirectionNode
    - signalProductionEngine
    - updateBriefSummary
  permission: string
```

DNA `ceremonies[]` drives which ceremonies compile.

---

## Permission Gates

```yaml
PermissionGate:
  permission: string              # creative-direction.approve
  verbs: VerbId[]
  roles: enum[]                   # founder | admin-collaborator | ai-ambient
  aiMayExecute: false             # always false for approve
```

---

## State Mutations

| Verb | Project State | Visual | Audio |
|------|---------------|--------|-------|
| pin | +reference | stick-bounce | soft-land |
| approve | lock-node | seal-glow | ceremony-stem |
| branch | +parallel-branch | ribbon-rise | branch-tone |
| reject | archive | dissolve | fade-tone |
| reference-drop | +pending-ingest | shimmer-land | fetch-tone |

Compiled per department — Runtime executes via Interaction Engine (05).

---

## AI-Triggered Interactions

```yaml
AIInteractionBinding:
  role: AIRoleId
  ambientVerb: VerbId
  zone: string
  maxFrequency: string          # e.g., 1 per 5 minutes
  mayApprove: false
```

AI never receives `approve` without founder permission gate.

---

## Reduced Motion Fallback

Interaction Compiler emits parallel `reducedMotionFallback` per verb:

| Verb | Fallback |
|------|----------|
| scrub | discrete-step |
| parallax | static-depth |
| ceremony | static-seal |
| stick-bounce | instant-land |

---

## Separation from Visual Assets

| Layer | Owner | Format |
|-------|-------|--------|
| Visual mesh | Object Compiler → Asset Compiler | `.glb` |
| Interaction behavior | Interaction Compiler | `.json` |
| Runtime wiring | Cursor | handler contracts |

**Rule:** Changing interaction map never requires regenerating visual assets unless affordance geometry changes.

---

_Next: [07 — AI Team Compiler](./07_AI_TEAM_COMPILER.md)_
