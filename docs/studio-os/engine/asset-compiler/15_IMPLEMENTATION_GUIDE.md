# 15 — Implementation Guide

**Engine Module:** `studio.asset-compiler.v1.implementation`  
**Status:** Engineering build roadmap  
**Philosophy:** Architecture is complete — implementation follows this guide, not the reverse

---

## Scope Boundary

This document describes **how engineering should eventually build** Studio Asset Compiler™. It is a roadmap — not production code.

| In This Guide | Not In This Guide |
|---------------|-------------------|
| Module structure | React components |
| Service boundaries | UI pages |
| API contracts | CSS/styling |
| Build phases | Deployment scripts |
| Testing strategy | Generated assets |
| Integration points | Provider API keys |

---

## Recommended Module Structure

```
src/studio-os-core/asset-compiler/
├── index.ts                           # Public API
├── types.ts                           # All compiler types
│
├── input/
│   ├── input-resolver.ts              # Collect + validate inputs (02)
│   ├── genome-resolver.ts             # Company Genome snapshot
│   ├── department-dna-loader.ts       # SDK anatomy + layout
│   ├── project-intent-loader.ts       # Project Model overlay
│   └── input-manifest-builder.ts    # Merge into InputManifest
│
├── prompt/
│   ├── prompt-compiler.ts             # Core prompt generation (03)
│   ├── template-registry.ts           # Prompt templates from Registry
│   ├── genome-layer-builder.ts        # Auto-inject Genome into prompts
│   ├── negative-prompt-builder.ts     # Universal + category negatives
│   └── prompt-hash.ts                 # Deterministic hash for regen
│
├── pipeline/
│   ├── pipeline-orchestrator.ts       # Stage execution (04)
│   ├── stage-runner.ts                # Individual stage execution
│   ├── dependency-resolver.ts         # Topological sort
│   ├── parallelism-controller.ts      # Max 6 concurrent
│   └── pipeline-state.ts              # Execution state machine
│
├── providers/
│   ├── provider-router.ts             # Route to providers (14)
│   ├── provider-registry.ts           # Registered adapters
│   ├── adapters/
│   │   ├── fal-adapter.ts
│   │   ├── openai-adapter.ts
│   │   ├── bfl-adapter.ts
│   │   ├── runway-adapter.ts
│   │   ├── luma-adapter.ts
│   │   └── deterministic-adapter.ts
│   ├── fallback-chain.ts
│   ├── cost-manager.ts
│   └── health-monitor.ts
│
├── assembly/
│   ├── package-assembler.ts           # Build package structure (05)
│   ├── metadata-stamper.ts            # Attach metadata (06)
│   ├── version-manager.ts             # Version tracking (10)
│   ├── integrity-computer.ts            # Checksum generation
│   └── preview-generator.ts           # Virtual composite renders
│
├── profiles/
│   ├── department-profiles.ts         # Compile profiles (07)
│   └── profile-registry.ts
│
├── regeneration/
│   ├── regeneration-engine.ts         # Surgical regen (11)
│   ├── trigger-map.ts                 # Change → asset mapping
│   └── hot-swap-coordinator.ts        # Live department updates
│
├── validation/
│   ├── qa-validator.ts                # Full validation (12)
│   ├── genome-scanner.ts              # Branding detection
│   ├── scale-checker.ts               # Proportion validation
│   └── performance-budget.ts          # Size/memory checks
│
├── export/
│   ├── asset-registry-exporter.ts     # Register in Asset Registry™
│   ├── marketplace-exporter.ts        # Marketplace packaging (13)
│   └── marketplace-neutralizer.ts     # Strip org-specific data
│
├── genome/
│   ├── genome-injector.ts             # Compile-time injection (08)
│   ├── natural-language-translator.ts # Principles → prompt language
│   └── transform-preview-generator.ts # Multi-Genome previews
│
└── config.ts                          # Compiler configuration
```

---

## Public API (Conceptual)

```typescript
// Compile a full department
AssetCompiler.compile(request: CompileRequest): Promise<DepartmentAssetPackage>

// Surgical regeneration
AssetCompiler.regenerate(request: RegenerateRequest): Promise<AssetVersion[]>

// Genome refresh
AssetCompiler.genomeRefresh(departmentId: string, orgId: string): Promise<DepartmentAssetPackage>

// Export to marketplace
AssetCompiler.exportToMarketplace(packageId: string): Promise<MarketplacePackage>

// Validate existing package
AssetCompiler.validate(packagePath: string): Promise<ValidationReport>

// Estimate cost before compile
AssetCompiler.estimate(request: CompileRequest): Promise<CostEstimate>
```

---

## Build Phases

### Phase 1: Foundation (Input + Prompt)

**Goal:** Resolve inputs and compile prompts — no generation yet.

| Deliverable | Doc Reference |
|-------------|---------------|
| Input resolver with Genome/Department DNA/Project loading | 02 |
| Input manifest builder with validation | 02 |
| Prompt compiler with template registry | 03 |
| Genome layer auto-injection | 08 |
| Prompt hash for deterministic regen | 03, 10 |
| Department compile profiles (10 departments) | 07 |

**Validation:** Input manifest generates for all 10 department profiles. Prompt stacks produce 35–50 prompts per department. Genome layers present on all visual prompts.

---

### Phase 2: Pipeline + Providers

**Goal:** Execute generation pipeline with FAL provider.

| Deliverable | Doc Reference |
|-------------|---------------|
| Pipeline orchestrator with 15 stages | 04 |
| Dependency resolver (topological sort) | 04 |
| FAL provider adapter | 14 |
| Deterministic adapter (interactions, camera, lighting JSON) | 14 |
| Fallback chain | 14 |
| Cost manager | 14 |

**Validation:** Full compile of one department (Creative Direction) produces all asset categories. No out-of-order generation. Fallback works on simulated failure.

---

### Phase 3: Assembly + Metadata

**Goal:** Package outputs with full metadata.

| Deliverable | Doc Reference |
|-------------|---------------|
| Package assembler (directory structure) | 05 |
| Metadata stamper (per-asset sidecar) | 06 |
| Version manager | 10 |
| Integrity checksums | 05 |
| Package manifest generation | 05 |

**Validation:** Package matches spec (05). All assets have metadata. Checksums valid. README generated.

---

### Phase 4: Validation + Regeneration

**Goal:** QA gate and surgical regeneration.

| Deliverable | Doc Reference |
|-------------|---------------|
| QA validator (all 11 check categories) | 12 |
| Genome compliance scanner | 12.4 |
| Regeneration engine with trigger map | 11 |
| Hot-swap coordinator | 11 |

**Validation:** Invalid packages rejected. Single-asset regeneration works. Only targeted assets regenerate. Versions increment correctly.

---

### Phase 5: Multi-Provider + Genome

**Goal:** Provider abstraction and multi-Genome support.

| Deliverable | Doc Reference |
|-------------|---------------|
| OpenAI, BFL, Runway, Luma adapters | 14 |
| Provider router with health monitoring | 14 |
| Genome transform preview generator | 08 |
| Natural language Genome translator | 08 |
| Genome refresh compilation mode | 08, 11 |

**Validation:** Same department compiles with 3+ Genome profiles producing visually distinct outputs. Provider fallback chain works. Transform previews generated.

---

### Phase 6: Export + Integration

**Goal:** Marketplace export and platform integration.

| Deliverable | Doc Reference |
|-------------|---------------|
| Asset Registry™ exporter | 06, 09 |
| Marketplace exporter with neutralizer | 13 |
| Installation guide generator | 13 |
| Event Bus integration | 01 |
| Department Runtime load contract | 09 |

**Validation:** Package loads in Department Runtime. Marketplace package installs into second organization with Genome injection. Event Bus receives compile lifecycle events.

---

## Integration Checklist

| System | Integration Point | Phase |
|--------|------------------|-------|
| Company Genome™ | `input/genome-resolver.ts` | 1 |
| Department SDK™ | `input/department-dna-loader.ts` | 1 |
| Project Model | `input/project-intent-loader.ts` | 1 |
| Blueprint Manager | Compile request trigger | 2 |
| Prompt Registry™ | `prompt/template-registry.ts` | 1 |
| Golden Models | `providers/adapters/*` | 2 |
| Asset Registry™ | `export/asset-registry-exporter.ts` | 6 |
| Department Runtime | Package load contract (09) | 6 |
| Model Orchestrator™ | `providers/provider-router.ts` | 5 |
| Event Bus™ | Compile lifecycle events | 6 |
| Expansion Center | Marketplace install | 6 |
| Command Dock™ | Compile status queries | 6 |

---

## Testing Strategy

| Test Type | Scope | Phase |
|-----------|-------|-------|
| Unit: input validation | All input types resolve correctly | 1 |
| Unit: prompt compilation | 35–50 stacks per department | 1 |
| Unit: Genome injection | All domains map to prompt variables | 1 |
| Integration: full compile | One department end-to-end | 2–3 |
| Integration: regeneration | Single asset regen | 4 |
| Integration: Genome transform | 3+ profiles visually distinct | 5 |
| Integration: runtime load | Package assembles in Department Runtime | 6 |
| Integration: marketplace install | Package installs in second org | 6 |
| Performance: compile time | Full compile ≤ 5 min | 2 |
| Performance: package size | ≤ 25 MB marketplace | 3 |
| QA: validation gate | Invalid packages rejected | 4 |

---

## Configuration

```yaml
AssetCompilerConfig:
  version: "1.0.0"
  sdkVersion: "1.0.0"

  pipeline:
    maxParallelism: 6
    stageTimeout: 300             # seconds per stage
    assetTimeout: 60                # seconds per asset

  providers:
    default: fal
    healthCheckInterval: 300        # seconds
    retryMax: 2
    retryBackoff: [4, 8, 16]       # seconds

  validation:
    strictMode: true                # fail on warnings in production
    genomeScanEnabled: true
    performanceBudgetEnforced: true

  export:
    assetRegistryAutoRegister: true
    marketplaceNeutralize: true
    archiveVersions: true
    maxArchivedVersions: 10

  cost:
    budgetEnforcement: true
    estimateBeforeCompile: true
    approvalThreshold: 10.00        # USD
```

---

## What Not to Build

| Do Not Build | Why |
|-------------|-----|
| User-facing prompt editor | Founders define intent, not prompts |
| Flattened scene previewer | Packages are modular |
| In-compiler Genome value filling | Runtime injects precise values |
| In-compiler interaction handlers | Cursor Runtime connects interactions |
| In-compiler department assembly | Studio Runtime assembles |
| Provider-specific UI | Provider abstraction hides providers |
| Real-time collaborative editing | Compile is batch, not real-time |

---

## Success Criteria

The implementation is complete when:

| # | Criterion |
|---|-----------|
| 1 | All 10 department profiles compile successfully |
| 2 | 35–50 prompt stacks generated per department automatically |
| 3 | Genome injection produces visually distinct outputs for 3+ companies |
| 4 | Surgical regeneration changes only targeted assets |
| 5 | QA validation rejects invalid packages |
| 6 | Packages load and assemble in Department Runtime |
| 7 | Marketplace packages install with Genome transformation |
| 8 | Provider fallback chain works across 2+ providers |
| 9 | Full compile cost estimate accurate within 20% |
| 10 | SDK QA Checklist (17) passable for compiled departments |

---

## Document Cross-Reference

| Implementation Module | Architecture Doc |
|----------------------|------------------|
| `input/` | 02 — Input System |
| `prompt/` | 03 — Prompt Compiler |
| `pipeline/` | 04 — Asset Generation Pipeline |
| `assembly/` | 05 — Asset Package Spec, 06 — Metadata Standard |
| `profiles/` | 07 — Department Compiler |
| `genome/` | 08 — Company Genome Injection |
| `export/` + Runtime contract | 09 — World Assembly |
| `assembly/version-manager` | 10 — Versioning System |
| `regeneration/` | 11 — Regeneration Rules |
| `validation/` | 12 — QA Validation |
| `export/marketplace-exporter` | 13 — Marketplace Export |
| `providers/` | 14 — Future AI Providers |

---

_Studio Asset Compiler™ v1.0.0 — Architecture complete. Implementation follows this guide._
