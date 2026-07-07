# 05 — Object Compiler

**Engine Module:** `studio.department-generator.v1.object-compiler`  
**Status:** Modular object generation task compiler  
**Philosophy:** Nothing baked into the room. Everything is modular.

---

## Design Principle

> Every interactive surface, furniture piece, display, console, and intelligence anchor is an **independently generatable object** with its own prompt stack, metadata, Genome slots, and regeneration scope.

---

## Object Class Registry

Objects derive from SDK 03 Object Library. Generator assigns per Department DNA.

### Universal Objects (All Departments)

| Object Class | Asset ID Pattern | Required |
|--------------|------------------|----------|
| `orb-pedestal` | `pedestal-orb-{dept}` | Yes |
| `orb` | `orb-{dept}` | Yes |
| `portal-entry` | `portal-entry-{dept}` | Yes |
| `portal-exit` | `portal-exit-{dept}` | Yes |
| `lighting-rig` | `lighting-rig-{dept}` | Yes |
| `particles-ambient` | `particles-ambient-{dept}` | Yes |

### Creative Pipeline Objects

| Object Class | Example Asset ID | Departments |
|--------------|------------------|-------------|
| `mood-wall` | `wall-mood-cds` | creative-direction, marketing |
| `interactive-wall` | `wall-brief-cds` | creative-direction, story |
| `timeline-table` | `table-timeline-cds` | creative-direction, production, publishing |
| `glass-table` | `table-sandbox-cds` | creative-direction, review |
| `asset-shelf` | `shelf-library-cds` | creative-direction, discovery |
| `preview-screen` | `screen-compare-cds` | creative-direction, review |
| `observatory` | `observatory-cds` | creative-direction, executive-hq |
| `project-board` | `board-project-{dept}` | story, production |
| `media-display` | `display-media-{dept}` | discovery, photography |
| `approval-station` | `station-approval-{dept}` | review, publishing |
| `command-console` | `console-command-{dept}` | production, executive-hq |
| `founder-desk` | `desk-founder-{dept}` | executive-hq (optional) |
| `reference-wall` | `wall-reference-{dept}` | discovery, education |

### Industry Objects

| Object Class | Departments |
|--------------|-------------|
| `light-table` | photography |
| `recording-console` | podcast |
| `learning-wall` | education |
| `styling-mirror` | salon |
| `precedent-library` | law-firm |
| `patient-journey-table` | medical |
| `menu-innovation-table` | restaurant |
| `site-command-table` | construction |

---

## Compiler Output

```yaml
ObjectCompileResult:
  departmentId: DepartmentTypeId
  tasks: ObjectTask[]               # 15–50 tasks
  inventory: ObjectInventoryManifest
  zoneBindings: ZoneObjectBinding[]
  dependencyGraph: AssetDependencyGraph
```

---

## Object Task Schema

```yaml
ObjectTask:
  id: string
  objectClass: ObjectClassId
  zoneId: string
  promptStack:
    base: string
    physicalForm: string            # dimensions · material · placement
    interactionAffordances: string  # visual hints for verbs
    genomeModifiers: GenomeModifier[]
    negativePrompt: string
  outputSpec:
    assetId: string
    format: glb | json | shader
    genomeSlots: string[]
    replaceable: true               # always true
  sdkBinding:
    objectClass: ObjectClassId
    allowedVerbs: VerbId[]
    states: ObjectStateId[]
  providerHint: ProviderHint
```

---

## Compilation Rules

| Rule | Specification |
|------|---------------|
| One prompt per object | Never combine Mood Wall + Timeline in one task |
| Zone binding required | Every object maps to spatial zone |
| SDK class required | Every object inherits SDK object class |
| Genome slots minimum 1 | Every object has ≥1 Genome binding |
| Replaceable always true | Marketplace swap supported |
| Dependency declared | Objects depending on shell declare parent |

---

## Creative Direction Studio™ Object Inventory (Validation)

Reference package `pkg-creative-direction-golden-v1`:

| Asset ID | Object Class | Zone |
|----------|--------------|------|
| `wall-mood-cds` | mood-wall | hero |
| `wall-brief-cds` | interactive-wall | brief |
| `table-timeline-cds` | timeline-table | primary |
| `table-sandbox-cds` | glass-table | sandbox |
| `shelf-library-cds` | asset-shelf | library |
| `observatory-cds` | observatory | observatory |
| `pedestal-orb-cds` | orb-pedestal | orb |
| `orb-cds` | orb | orb |
| `screen-compare-cds` | preview-screen | sandbox |

First Generator run must produce equivalent inventory.

---

## Object States (Compiled Metadata)

Interaction Compiler (06) binds states. Object Compiler declares them:

| State | Typical Objects |
|-------|-----------------|
| `idle` | All |
| `active` | Timeline, Mood Wall, Sandbox |
| `listening` | Orb |
| `frosted` | Sandbox (inactive) |
| `ceremony` | Timeline, Approval Station |
| `inspect` | Observatory, Media Display |

---

## Regeneration Granularity

| Change | Regenerates |
|--------|-------------|
| Mood Wall variant | `wall-mood-{dept}` only |
| Timeline table material | `table-timeline-{dept}` only |
| Orb glow shader | `orb-{dept}` only |
| Full furniture pass | All `furniture/*` + `table-*` |

See [14 — Regeneration System](./14_REGENERATION_SYSTEM.md).

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| Monolithic room with embedded UI | Separate object per surface |
| Text baked into textures | Content planes at runtime |
| Object without zone binding | Orphan objects rejected at QA |
| Duplicate object class in zone | One primary object per zone hero |

---

_Next: [06 — Interaction Compiler](./06_INTERACTION_COMPILER.md)_
