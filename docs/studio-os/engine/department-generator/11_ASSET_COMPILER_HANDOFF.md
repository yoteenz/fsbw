# 11 — Asset Compiler Handoff

**Engine Module:** `studio.department-generator.v1.asset-compiler-handoff`  
**Status:** Generation instruction contract  
**Philosophy:** The Generator creates generation instructions. The Asset Compiler creates final assets.

---

## Boundary Law

```
Studio Department Generator™     →    Studio Asset Compiler™
─────────────────────────────────────────────────────────────
WHAT to generate                      HOW to generate
Prompt stacks + metadata              Provider routing + execution
Dependency graph                      Ordered pipeline stages
Genome slot bindings                  Shader assembly
Interaction maps (data)               GLB · audio · texture output
Package manifest (blueprint)          DepartmentPackage.zip (cooked)
```

**The Generator never calls FAL.**  
**The Compiler never resolves Department DNA.**

---

## Handoff Artifact

```yaml
GenerationInstructionSet:
  schema: studio.generation-instruction-set.v1
  generatorVersion: semver
  departmentId: DepartmentTypeId
  packageId: string
  compiledAt: ISO8601
  genomeSnapshot: CompanyGenomeSnapshot
  tasks: GenerationTask[]
  dependencyGraph: AssetDependencyGraph
  stageOrder: GenerationStage[]
  regenerationScope: RegenerationScope | null
```

---

## Generation Task Schema

```yaml
GenerationTask:
  id: string
  sourceCompiler: enum            # environment | object | audio | animation
  assetId: string
  promptStack: PromptStack        # per Asset Compiler 03
  outputSpec:
    path: string
    format: string
    genomeSlots: string[]
  metadata:
    objectClass: string | null
    zoneId: string | null
    replaceable: true
    departmentId: string
  providerHint:
    preferred: string[]           # fal | openai | runway | luma
    assetType: enum               # mesh | texture | audio | data
  dependencies: string[]          # task IDs that must complete first
```

---

## Stage Order (Compiler Executes)

| Stage | Generator Task Sources | Asset Compiler Stage |
|-------|------------------------|---------------------|
| 1 | env-architecture · env-interior | Environment shell |
| 2 | env-ceiling · env-floor | Floor + ceiling |
| 3 | env-windows · env-view-plate | Windows + exterior |
| 4 | env-lighting-rig | Lighting |
| 5 | object furniture + tables | Zone furniture |
| 6 | object intelligence (orb, screens) | Intelligence objects |
| 7 | env-atmosphere · particles | Particles |
| 8 | env-portals | Portals |
| 9 | interaction-map · ai-triggers | Data manifests |
| 10 | audio stems | Audio |
| 11 | camera-paths · animation-manifest | Camera + animation data |
| 12 | content seeds | Optional seeds |
| 13 | — | Assembly (Compiler 09) |
| 14 | — | QA (Compiler 12) |

Generator compiles tasks 1–12. Compiler executes 1–14.

---

## Prompt Stack Handoff Format

Compatible with `studio.asset-compiler.v1` Prompt Compiler (03):

```yaml
PromptStack:
  id: string
  base: string
  modifiers:
    - source: genome
      field: materialLanguage
      template: "{{value}}"
    - source: industry
      template: "{{industryModifier}}"
    - source: dna
      field: atmosphereCharacter
  negativePrompt: string
  outputConstraints:
    aspectRatio: string | null
    polyBudget: number | null
```

---

## Data-Only Tasks (No AI Generation)

| Task | Output | Compiler Action |
|------|--------|-----------------|
| interaction-map.json | Interaction Compiler | Copy to package |
| ai-team-manifest.json | AI Team Compiler | Copy to package |
| ai-triggers.json | AI Team Compiler | Copy to package |
| camera-paths.json | Animation Compiler | Copy to package |
| animation-manifest.json | Animation Compiler | Copy to package |
| spatial-manifest.json | Environment Compiler | Copy to package |

---

## Regeneration Handoff

When `regenerationScope` is set:

```yaml
RegenerationScope:
  scopeType: enum                 # lighting | mood-wall | orb | materials | audio | single-asset
  assetIds: string[]
  preserveManifest: true          # merge into existing package
  versionBump: patch
```

Generator emits **subset** of `GenerationInstructionSet`. Compiler executes surgical regen per rules (14).

---

## Error Contract

| Generator Error | Compiler Response |
|-----------------|-------------------|
| Invalid task dependency | Reject instruction set |
| Missing Genome slot | Warn · use fallback |
| Unknown asset ID in regen | Hard fail |
| QA fail on prior package | Include retry tasks only |

---

## Creative Direction Validation Handoff

First pipeline validation:

| Generator Output | Must Match |
|------------------|------------|
| ~45 generation tasks | `pkg-creative-direction-golden-v1` inventory |
| 35–50 prompt stacks | Golden Department 11_COMPILER_AND_RUNTIME |
| 7 zones in spatial manifest | Golden Department 01_THE_ROOM |
| creative-approval ceremony | Golden Department 08_INTERACTION_MAP |

---

_Next: [12 — Runtime Handoff](./12_RUNTIME_HANDOFF.md)_
