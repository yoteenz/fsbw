# Compiler Overview — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.overview`  
**Status:** Manufacturing engine purpose and boundaries

---

## Definition

Studio Asset Compiler™ is the **manufacturing layer** of Studio OS — equivalent to Unreal Engine's asset cooking pipeline, a AAA procedural art pipeline, and a premium creative production house combined.

It receives **structured intelligence** (Department Definition + Genomes) and outputs **structured generation packages** (DepartmentPackage.zip) that AI providers execute.

---

## The Four-Engine Foundation

| Engine | Role | Output |
|--------|------|--------|
| **Studio Department Generator™** | Creates departments | Department Definition |
| **Studio Asset Compiler™** | Manufactures departments | DepartmentPackage.zip |
| **Studio Asset Registry™** | Remembers everything | Permanent creative library |
| **Studio Department Runtime™** | Operates departments | Living interactive room |

Together these power every immersive Studio OS experience. See [`../studio-asset-registry/`](../studio-asset-registry/README.md).

---

## Manufacturing Philosophy

1. **Definition in, package out** — no hand-authored prompt folders
2. **Dozens of prompts, never one** — every object is independently expandable
3. **Genome-native manufacturing** — same compile profile · different company soul
4. **Ordered stages** — environment before furniture before interactions
5. **Quality before zip** — Build Health gate blocks broken packages
6. **Provider-agnostic** — compiler expands prompts; providers execute them

---

## Automatic Compiler Chain

```
Read Department DNA (from department.json)
         ↓
Read Company Genome™
         ↓
Read Brand Genome™ (subset of Company Genome)
         ↓
Read Founder Journey™ (maturity · tone · ritual weight)
         ↓
Read Project Genome™ (when project-scoped compile)
         ↓
Read Design Language™ + Design Registry™
         ↓
Adapt department personality (Room DNA™ + Genome clamps)
         ↓
Organize every asset (asset-manifest.json → package folders)
         ↓
Write optimized expanded prompts (prompt-expansion-engine)
         ↓
Assign generation order (12 stages)
         ↓
Generate runtime manifest (15_runtime/)
         ↓
Generate dependency graph (14_metadata/)
         ↓
Run Quality Engine (Build Health score)
         ↓
Generate DepartmentPackage.zip + build-report.md
```

**No manual intervention** at any step.

---

## Boundary Law

```
Department Generator™          Asset Compiler™              AI Providers
─────────────────────────────────────────────────────────────────────────
WHAT to generate                 HOW to package + expand        EXECUTE prompts
Department Definition            DepartmentPackage.zip          Cooked GLB · audio
fal-prompt-package/ (source)     13_prompts/ (expanded)         Final assets
GenerationInstructionSet         package-manifest.json          ——
```

**Generator never calls FAL.**  
**Compiler never designs departments** — it manufactures definitions.  
**Providers never resolve DNA** — they receive expanded prompt stacks.

---

## Integrations

| System | Relationship |
|--------|--------------|
| [Department Generator](../../department-generator/README.md) | Primary input: Department Definition |
| [Department SDK](../../sdk/README.md) | Object classes · verb registry law |
| [Company Genome™](../../company-genome.md) | Material · lighting · voice injection |
| [Founder Journey™](../../engine/founder-journey/README.md) | Maturity · ceremony weight |
| [Validation Loop™](../../engine/validation-loop/README.md) | Package must pass before Runtime install |
| [Department Runtime™](../../engine/department-runtime/README.md) | Consumes `15_runtime/` manifest |
| [engine/asset-compiler/](../../engine/asset-compiler/README.md) | Deep technical companion spec (15 docs) |

---

## Anti-Patterns

| Forbidden | Canonical |
|-----------|-----------|
| Founder types FAL prompts | Compiler expands from Definition |
| One prompt per department | Per-asset expanded prompt stacks |
| Flattened room PNG in package | Modular folders 01–16 |
| Skip Quality Engine | Build Health ≥ threshold required |
| Hardcode Frontal Slayer colors | Genome injection at compile |
