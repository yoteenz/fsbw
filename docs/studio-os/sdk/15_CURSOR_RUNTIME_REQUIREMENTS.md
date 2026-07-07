# 15 — Cursor Runtime Requirements

**SDK Module:** `studio.department.sdk.v1.cursor-runtime`  
**Status:** Assembly contract for Cursor  
**Philosophy:** Cursor assembles generated asset packages — Cursor is NOT responsible for creative direction

---

## Definition

This document defines the **runtime contract** between the Studio Department SDK and Cursor (the implementation environment). Cursor's role is **assembly, loading, and operation** — never creative direction, branding, or asset generation.

> Cursor builds the engine that runs departments. FAL builds the parts. Genome brands the parts. Blueprints define the plan.

---

## Cursor Responsibilities

| Cursor DOES | Cursor DOES NOT |
|-------------|-----------------|
| Load asset modules per runtime sequence | Generate 3D assets |
| Assemble spatial layout from metadata | Decide brand colors |
| Inject Company Genome values into slots | Write creative direction |
| Route interaction verbs to handlers | Design department layouts |
| Initialize AI employees from config | Generate AI personalities |
| Manage camera positions and transitions | Create motion choreography |
| Play audio assets | Compose music |
| Cache and lazy-load assets | Produce flattened scenes |
| Enforce permissions | Bypass permission checks |
| Emit events to Event Bus™ | Make business decisions |
| Provide fallback on load failure | Leave broken states visible |

---

## Folder Structure

Cursor implementations must organize department runtime code following this structure:

```
src/studio-os-core/department-runtime/
├── index.ts                          # Public API
├── types.ts                          # Runtime types (from SDK schemas)
├── loader/
│   ├── asset-loader.ts               # Module fetching + validation
│   ├── cache-manager.ts              # Session + persistent cache
│   └── fallback-resolver.ts          # Fallback asset chain
├── assembler/
│   ├── spatial-assembler.ts          # Object placement in envelope
│   ├── attachment-binder.ts          # Furniture node attachments
│   └── zone-computer.ts              # Zone bounds from clusters
├── genome/
│   ├── genome-resolver.ts            # Fetch + cache Genome snapshot
│   ├── material-injector.ts          # Shader slot injection
│   ├── typography-injector.ts        # Panel text styling
│   ├── lighting-injector.ts          # Light parameter injection
│   ├── audio-selector.ts             # Genome-driven audio selection
│   ├── terminology-override.ts       # Label/command overrides
│   └── injection-audit.ts            # Log all injections
├── operator/
│   ├── interaction-router.ts         # Verb → handler dispatch
│   ├── ai-orchestrator.ts            # AI employee coordination
│   ├── state-persister.ts            # Work state save/restore
│   ├── output-monitor.ts             # Exit criteria checking
│   └── event-emitter.ts              # Event Bus integration
├── camera/
│   ├── camera-controller.ts          # Position presets + travel
│   └── orbit-handler.ts              # User orbit override
├── audio/
│   ├── audio-mixer.ts                # Layer mixing + ducking
│   └── spatial-audio.ts                # 3D positioned audio
├── motion/
│   ├── motion-player.ts              # Profile execution
│   └── reduced-motion.ts             # Accessibility fallback
├── routing/
│   ├── travel-controller.ts          # Inter-department travel
│   └── world-map.ts                  # HQ overview data
├── state-machine.ts                  # Runtime state transitions
└── config.ts                         # Runtime configuration

src/studio-os-core/department-runtime/assets/
├── fallbacks/                        # SDK default fallback assets
│   ├── environment-default.gltf
│   ├── materials-default/
│   ├── audio-default/
│   └── ...
└── schemas/                          # JSON schemas for validation
    ├── anatomy.schema.json
    ├── asset-module.schema.json
    ├── interaction-map.schema.json
    └── genome-rules.schema.json
```

### Per-Department Data (Not Code)

```
data/departments/{departmentId}/
├── anatomy.json
├── spatial-layout.json
├── objects.json
├── interaction-maps.json
├── ai-employees.json
├── genome-rules.json
└── assets/                           # Compiled asset modules from FAL
    ├── environment/
    ├── furniture/
    ├── glass/
    ├── lighting/
    ├── materials/
    ├── particles/
    ├── audio/
    ├── animations/
    └── camera/
```

**Rule:** Department data is content. Runtime code is platform. Never mix.

---

## Runtime Expectations

### Initialization

```typescript
// Conceptual API — not implementation code
DepartmentRuntime.create({
  departmentId: string,
  organizationId: string,
  userId: string,
  projectId: string | null,
  config: DepartmentRuntimeConfig,
}) → DepartmentInstance
```

### Lifecycle

```typescript
DepartmentInstance.load()      → Promise<void>    // Full load sequence (11)
DepartmentInstance.activate()  → void             // Begin arrival sequence
DepartmentInstance.background() → void            // Pause for travel away
DepartmentInstance.resume()    → void             // Resume from background
DepartmentInstance.unload()    → Promise<void>    // Departure + cleanup
```

### Interaction

```typescript
DepartmentInstance.executeVerb({
  verb: string,
  objectId: string,
  payload: any,
}) → VerbResult
```

### Travel

```typescript
DepartmentRuntime.travelTo({
  from: LocationId,
  to: LocationId,
  method: 'walk' | 'quick' | 'orb' | 'deep-link',
}) → Promise<DepartmentInstance>
```

---

## Asset Loading Requirements

| Requirement | Specification |
|-------------|---------------|
| Load order | Per 06 Asset Standard assembly order |
| Parallel loading | Max 6 concurrent module fetches |
| Timeout | 5s per module → fallback |
| Validation | JSON schema + checksum on every module |
| Format support | glTF 2.0, JSON manifests, OGG/WAV audio, shader bundles |
| Genome slots | Materials load with null slots; injection fills at Phase 3 |
| LOD | Load LOD 0 initially; swap on camera distance |
| Preload | Materials + metadata + environment blocking; rest parallel |

---

## Animation Loading

| Requirement | Specification |
|-------------|---------------|
| Clip binding | Animation clips bound to object instances by ID |
| Camera paths | JSON spline data → camera controller |
| Motion profiles | Loaded from motion/ directory; referenced by interaction maps |
| Concurrent playback | Multiple object animations + camera travel simultaneously |
| Reduced motion | All profiles check `prefers-reduced-motion` → instant fallback |
| Skip | Non-ceremony animations skippable on user input |

---

## Interaction Loading

| Requirement | Specification |
|-------------|---------------|
| Map parsing | interaction-maps.json → verb bindings |
| Zone registration | Zone bounds → allowed verbs |
| Object binding | Objects inherit zone verbs + own profile verbs |
| Permission gating | Verb execution checks user permissions before handler |
| Platform inheritance | All interactions use platform Interaction Engine™ states |
| AI triggers | Verb completion → AI orchestrator notification |
| Feedback | Verb result triggers motion profile + audio |

---

## Genome Injection Requirements

| Requirement | Specification |
|-------------|---------------|
| Snapshot | Fetch Company Genome™ at load time; cache per session |
| Project overlay | Project Genome™ merges on top if project active |
| Hook resolution | anatomy.genomeHooks → domain → target mapping |
| Material injection | Shader uniform updates — no asset reload |
| Typography | CSS/style override on panel surfaces |
| Lighting | Parameter update on light rig — no reload |
| Audio | Select Genome-matched audio from category library |
| AI config | Personality parameters → AI employee initialization |
| Terminology | String override on labels, commands, panel headers |
| Audit | Log every injection with timestamp + fallback flag |
| Live update | Genome change → `genome-refresh` motion profile |

---

## Performance Requirements

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Time to interactive | ≤ 5s | Load sequence optimization |
| First meaningful paint | ≤ 2s | Environment + materials first |
| Verb response (local) | ≤ 100ms | Handler efficiency |
| Verb response (async) | ≤ 500ms | Loading state on object |
| Frame rate (interaction) | ≥ 30fps | LOD + particle budget |
| Frame rate (ceremony) | ≥ 24fps | Reduced particles during ceremony |
| Memory per department | ≤ 150 MB | Module unload on background |
| Cache size | ≤ 50 modules LRU | Cache manager eviction |
| Bundle size (runtime code) | Separate from assets | Code is platform; assets are content |

---

## Lazy Loading

| Asset | Strategy |
|-------|----------|
| Environment | Eager (blocking) |
| Materials | Eager (blocking) |
| Furniture | Eager (parallel) |
| Particles | Lazy (on zone entry) |
| Environmental audio | Lazy (on first interaction in zone) |
| Celebration audio | Lazy (on ceremony trigger) |
| LOD 1+ | Lazy (on camera distance threshold) |
| AI knowledge domains | Lazy (on first AI interaction) |

---

## Caching

```yaml
CachePolicy:
  session:
    scope: per-department-per-session
    contents: [loaded modules, genome snapshot, user state]
    eviction: on unload
  persistent:
    scope: cross-session
    contents: [environment, furniture, materials, audio]
    maxSize: 50 modules
    eviction: LRU
  genome:
    scope: per-organization
    contents: [genome snapshot]
    ttl: 5 minutes
    invalidation: on genome-update event
```

---

## Fallback Assets

Every asset module declares `fallbackId`. Cursor maintains SDK default fallbacks:

| Category | Fallback |
|----------|----------|
| Environment | `fallbacks/environment-default.gltf` — neutral white room |
| Furniture | `fallbacks/furniture-{type}-default.gltf` — per type |
| Materials | `fallbacks/materials-default/` — neutral shader set |
| Lighting | Default three-point rig with neutral temperatures |
| Audio | Silent ambient (room tone at 5% volume) |
| Particles | None (disabled) |
| Orb | Platform-standard Orb (always available) |

**Fallback rules:**
- Fallback loads silently — no error shown to user
- Orb notifies founder of missing assets via gentle suggestion
- Fallback assets are Genome-injectable (same slots)
- Missing fallback → skip asset; log error; continue assembly

---

## Error Boundaries

| Failure | Cursor Behavior |
|---------|-----------------|
| Single asset fail | Load fallback; continue |
| Genome service down | Use SDK defaults; all fallbacks |
| AI init fail | Orb solo mode |
| Permission service down | Read-only mode |
| Total assembly fail | Redirect to Mission Control; Orb explains |
| Mid-session crash | Restore from last saved state on reload |

**Never:** White screen, error page, infinite loading, broken interactive state.

---

## Testing Requirements

Cursor runtime must pass:

| Test | Validation |
|------|------------|
| Load test | Department loads within 5s with all modules |
| Fallback test | Remove random module → fallback loads → department functional |
| Genome test | Same department with 3+ Genome profiles → visually distinct |
| Interaction test | All declared verbs execute with feedback |
| Travel test | Depart → transit → arrive at another department |
| Background test | Leave → return → state preserved |
| Permission test | Denied verbs show disabled state |
| Reduced motion test | All animations respect preference |
| Memory test | Background unload releases ≤ 80% memory |
| QA checklist | Full 17-point checklist pass |

---

## Integration Points

| System | Integration |
|--------|-------------|
| Company Genome™ | `genome-resolver.ts` → Genome service API |
| Asset Registry™ | `asset-loader.ts` → registry lookup |
| Project Model | `state-persister.ts` → project data hydration |
| Event Bus™ | `event-emitter.ts` → event publishing |
| Command Dock™ | `operator/` → command registration |
| Interaction Engine™ M130 | `interaction-router.ts` → platform states |
| World Routing | `routing/` → travel controller |
| AI Employee System | `ai-orchestrator.ts` → concierge services |
| Organization Boundary | Tenant isolation on all data access |

---

## Version Compatibility

```yaml
CompatibilityMatrix:
  sdkVersion: "1.0.0"
  minimumPlatformVersion: string
  genomeVersion: "1.0.0"
  interactionEngineVersion: "1.0.0"
  schemaVersions:
    anatomy: "1.0.0"
    assetModule: "1.0.0"
    interactionMap: "1.0.0"
    genomeRules: "1.0.0"
```

Runtime rejects incompatible packages with clear message via Orb.

---

_Next: [16 — Department Creation Guide](./16_DEPARTMENT_CREATION_GUIDE.md)_
