# 12 — Runtime Handoff

**Engine Module:** `studio.department-generator.v1.runtime-handoff`  
**Status:** Package → Runtime assembly contract  
**Philosophy:** Runtime assembles everything automatically. Cursor wires handlers.

---

## Boundary Law

```
Studio Asset Compiler™          →    Studio Department Runtime™
──────────────────────────────────────────────────────────────
Cooked assets in package              Load · assemble · operate
GLB · audio · textures                World · objects · interactions
Validated metadata                    Genome injection · state

Studio Department Generator™    →    Studio Department Runtime™
──────────────────────────────────────────────────────────────
Assembly manifest                     Boot sequence configuration
Interaction · AI · audio · animation  Subsystem initialization
Sandbox rules · ceremonies            Behavior contracts
```

---

## Handoff Artifact

```yaml
RuntimeAssemblyManifest:
  schema: studio.runtime-assembly-manifest.v1
  departmentId: DepartmentTypeId
  packageId: string
  packageVersion: semver
  bootSequence: BootPhase[]
  worldAssembly: WorldAssemblyOrder
  subsystemBindings: SubsystemBinding[]
  behaviorContracts: BehaviorContract[]
  cursorHandlers: CursorHandlerBinding[]
```

---

## Runtime Inputs (Complete)

```yaml
RuntimeInput:
  package: DepartmentAssetPackage       # from Compiler export
  runtimeManifest: RuntimeAssemblyManifest  # from Generator
  departmentDNA: ResolvedDepartmentDNA
  companyGenome: CompanyGenomeSnapshot
  projectContext: ProjectRuntimeContext | null
  headquartersContext: HeadquartersContext
  userSession: UserSession
```

---

## Boot Sequence

| Phase | Subsystem | Duration Target |
|-------|-----------|-----------------|
| 1. LOADING | Asset Loader | < 2s |
| 2. GENOME_INJECTING | Genome Injection | < 500ms |
| 3. ASSEMBLING | World Assembler | < 1s |
| 4. HYDRATING | Project Runtime | Variable |
| 5. ARRIVING | Camera + Animation + Audio | 5–7s |
| 6. ACTIVE | State Manager | — |

Compiled from Animation Compiler arrival profile + DNA entry behavior.

---

## World Assembly Order

Matches Runtime World Assembler (03) — Generator pre-declares:

```yaml
WorldAssemblyOrder:
  stages:
    - environment-shell
    - lighting-rig
    - floor-materials
    - furniture
    - glass-surfaces
    - interactive-objects
    - orb-pedestal
    - orb
    - particles
    - audio-stems
    - animation-profiles
    - zone-bindings
    - ai-triggers
    - genome-runtime-slots
    - ready
```

---

## Subsystem Bindings

| Manifest Source | Runtime Subsystem |
|-----------------|-------------------|
| interaction-map.json | Interaction Engine (05) |
| ai-team-manifest.json | Concierge Runtime (07) |
| ai-triggers.json | Concierge Runtime (07) |
| orb config | Orb Runtime (06) |
| camera-paths.json | Camera System (09) |
| animation-manifest.json | Animation Engine (10) |
| audio-manifest.json | Audio Engine (12) |
| particles config | Particle Engine (11) |
| spatial-manifest.json | Object Manager (04) zone bounds |

---

## Behavior Contracts

```yaml
BehaviorContract:
  id: string
  type: enum                      # sandbox-isolation | ceremony | genome-pulse | ai-ambient
  config: object
```

### Required Contracts

| Contract | Creative Direction Example |
|----------|---------------------------|
| `sandbox-isolation` | Approve required before main path changes |
| `creative-approval` | Ceremony on timeline direction node |
| `genome-pulse` | Observatory rings expand on Genome update |
| `orb-routing` | Voice commands route to zones |
| `production-unlock` | Approval signals Production Engine |

---

## Cursor Handler Bindings

Abstract contracts for Cursor wiring (SDK 15):

```yaml
CursorHandlerBinding:
  handler: string
  trigger: string                 # verb + object + zone
  platformService: string
  required: boolean
```

| Handler | Trigger | Purpose |
|---------|---------|---------|
| `onReferenceDrop` | reference-drop · mood-wall | Ingest pipeline |
| `onApprove` | approve · timeline | Ceremony + Production signal |
| `onBranch` | branch · sandbox | Fork experiment |
| `onGenomeUpdate` | genome-change | Shader crossfade |
| `onDepart` | exit · portal | Inter-department nav |

**No React in Generator spec** — bindings are contracts only.

---

## Project Hydration Map

| Project Data | Runtime Surface |
|--------------|-----------------|
| Brief sections | Brief Wall pins |
| References | Mood Wall + Library |
| Branches | Timeline ribbons |
| Genome snapshot | Observatory |
| Founder notes | Brief + Timeline cards |
| Sandbox experiments | Sandbox surface |

Generator declares hydration targets in manifest — Runtime Project Runtime (15) executes.

---

## Performance Budget (Declared)

| Metric | Target |
|--------|--------|
| Frame rate | 60fps desktop · 30fps mobile min |
| Draw calls | < 200 assembled |
| Texture memory | < 80 MB |
| Interaction latency | < 100ms |

From DNA `assetBudget` — Runtime Performance System (16) enforces.

---

_Next: [13 — Package Spec](./13_PACKAGE_SPEC.md)_
