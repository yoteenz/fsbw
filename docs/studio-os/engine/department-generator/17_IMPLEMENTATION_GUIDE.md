# 17 — Implementation Guide

**Engine Module:** `studio.department-generator.v1.implementation`  
**Status:** Abstract engineering roadmap  
**Philosophy:** Architecture only. No production code in this sprint.

---

## Implementation Scope

This guide describes **how engineering should eventually build** Studio Department Generator™ — without prescribing framework, language, or deployment targets.

---

## Recommended Subsystems

| Subsystem | Responsibility |
|-----------|----------------|
| `InputResolver` | Validate · normalize · merge 13 input domains |
| `DNACatalog` | Store · version Department DNA templates |
| `EnvironmentCompiler` | Emit environment tasks |
| `ObjectCompiler` | Emit object tasks |
| `InteractionCompiler` | Emit interaction maps |
| `AITeamCompiler` | Emit AI manifests |
| `AudioCompiler` | Emit audio manifests |
| `AnimationCompiler` | Emit animation + camera manifests |
| `GenomeInjector` | Bind slots across all compile outputs |
| `PackageAssembler` | Build manifest + dependency graph |
| `HandoffOrchestrator` | Emit instruction set + runtime manifest |
| `RegenerationResolver` | Map change requests → scopes |
| `QAValidator` | Nine-questions + static checks |
| `MarketplaceExporter` | Listing draft compiler |

---

## Suggested Build Phases

### Phase 1 — Foundation

| Deliverable | Validates Against |
|-------------|-------------------|
| Input Resolver + schema validation | 02 |
| DNA Catalog with `creative-direction` | 03 |
| Static QA validator | 16 (static only) |
| Package manifest schema | 13 |

**Milestone:** Resolve inputs → emit empty package manifest with DNA.

### Phase 2 — Compilers

| Deliverable | Validates Against |
|-------------|-------------------|
| Environment Compiler | 04 |
| Object Compiler | 05 |
| Interaction Compiler | 06 |
| AI Team Compiler | 07 |
| Audio + Animation Compilers | 08–09 |
| Genome Injector | 10 |

**Milestone:** Full `GenerationInstructionSet` for `creative-direction` without AI execution.

### Phase 3 — Handoffs

| Deliverable | Validates Against |
|-------------|-------------------|
| Asset Compiler adapter | 11 |
| Runtime manifest emitter | 12 |
| Regeneration resolver | 14 |

**Milestone:** Instruction set accepted by Asset Compiler mock.

### Phase 4 — Validation Pipeline

| Deliverable | Validates Against |
|-------------|-------------------|
| End-to-end Creative Direction generate | Golden Department |
| Genome two-company transform test | 10 |
| Surgical regeneration tests | 14 |
| QA nine-questions automation | 16 |

**Milestone:** `pkg-creative-direction-golden-v1` equivalent produced by Generator.

### Phase 5 — Scale

| Deliverable | Validates Against |
|-------------|-------------------|
| Full DNA catalog (all department types) | 03 |
| Marketplace exporter | 15 |
| Industry department templates | 03 |
| Founder natural-language department creation API | 02 |

**Milestone:** Founder says *"Create a Publishing department"* → package queued.

---

## API Surface (Abstract)

```yaml
# Generate new department
POST /generator/departments
  body: GeneratorInput
  returns: GeneratorOutput + QAReport

# Surgical regeneration
POST /generator/departments/{id}/regenerate
  body: RegenerationScope
  returns: PartialGeneratorOutput

# Preview compile (no Compiler handoff)
POST /generator/departments/preview
  body: GeneratorInput
  returns: CompilePreview + QAReport

# DNA catalog
GET /generator/dna
GET /generator/dna/{departmentTypeId}
```

---

## Storage Model (Abstract)

| Store | Contents |
|-------|----------|
| DNA Catalog | Department DNA templates · versioned |
| Compile Cache | Resolved GeneratorContext per org+dept |
| Package Registry | Generated package manifests |
| Regeneration Log | Scope history · rollback pointers |

---

## Integration Points

| System | Integration |
|--------|-------------|
| Company Genome™ service | Read snapshot · subscribe to changes |
| Creative Direction Studio™ | Read mood board · references · direction |
| Studio Asset Compiler™ | POST GenerationInstructionSet |
| Studio Department Runtime™ | POST RuntimeAssemblyManifest |
| Headquarters Marketplace™ | POST MarketplaceListingDraft |
| Studio Orb™ | Natural-language department creation routing |
| Cursor | Consume CursorHandlerBinding contracts |

---

## Testing Strategy (Abstract)

| Test Type | Coverage |
|-----------|----------|
| Schema validation | All input/output schemas |
| Compiler unit tests | Each compiler in isolation |
| Golden Department parity | creative-direction output ≡ golden spec |
| Genome transform | 4 company profiles × 1 department |
| Regeneration surgical | 10 scope types |
| Anti-SaaS regression | Prompt scan corpus |
| E2E dry-run | Generator → Compiler mock → Runtime mock |

---

## Performance Targets

| Operation | Target |
|-----------|--------|
| Input resolve | < 2s |
| Full compile (no AI) | < 5s |
| QA static | < 1s |
| Regeneration resolve | < 500ms |
| Handoff emit | < 200ms |

AI generation time is Asset Compiler concern — async.

---

## Security & Permissions

| Gate | Rule |
|------|------|
| Department creation | Founder · HQ admin |
| Full regeneration | Founder confirm |
| Marketplace publish | Entitlement + QA pass |
| DNA catalog edit | Platform admin only |
| Genome read | Org-scoped |

---

## What Not to Build

| Forbidden | Reason |
|-----------|--------|
| React department UI | Runtime + Cursor responsibility |
| FAL call direct from Generator | Asset Compiler boundary |
| Flattened scene exporter | Violates modularity law |
| Manual prompt UI for founders | Violates input pipeline philosophy |
| Per-company DNA forks | Genome handles differentiation |

---

## Success Criteria

Studio Department Generator™ v1 is complete when:

1. `creative-direction` generates end-to-end through Compiler + Runtime
2. Output passes all nine QA questions (16)
3. Frontal Slayer and NDX Genomes produce visibly different rooms from same DNA
4. Surgical regeneration works for lighting · mood-wall · orb
5. Marketplace listing exports for generated package
6. Second department type (e.g., `discovery`) generates without Generator code fork — DNA catalog only

---

## Canonical Statement

> The founder says *"I want to create a new department."* Studio Department Generator™ understands the company, brand, industry, project, emotional goal, and desired experience — and delivers a complete Department Package™ ready for Runtime. No dashboards. No prompting. Worlds.

---

_Studio Department Generator™ v1.0.0 — Implementation Guide — Architecture only._
