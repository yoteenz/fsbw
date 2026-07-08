# Studio Asset Compiler™ — The Manufacturing Engine (v1)

**Version:** 1.0.0  
**Status:** Canonical manufacturing engine specification  
**Type:** Core Studio OS Engine — not a feature, not a department  
**Engine ID:** `studio.asset-compiler.v1`  
**Canonical engine (deep spec):** [`../../engine/asset-compiler/`](../../engine/asset-compiler/README.md)  
**Living Library (reuse + prompts):** [`../studio-asset-registry/`](../studio-asset-registry/README.md)  
**Production coordinator:** [`../generation-manager/`](../generation-manager/README.md)  
**Department Definition input:** [`../../departments/creative-direction-studio/`](../../departments/creative-direction-studio/README.md)

---

> **Department Generator™ creates departments. Studio Asset Compiler™ manufactures them. Studio Asset Registry™ remembers everything. Department Runtime™ brings them to life.**

Studio Asset Compiler™ converts an official **Department Definition** into a complete **DepartmentPackage.zip** ready for AI asset generation — without a human writing dozens of FAL prompts.

---

## Mission

The compiler is the **bridge between Studio OS intelligence and visual generation**.

| Human Does | Compiler Does |
|------------|---------------|
| Defines intent via Genome + Department Definition | Reads every input automatically |
| Approves direction in the room | Expands every asset into premium prompts |
| — | Assigns generation order + dependencies |
| — | Produces `DepartmentPackage.zip` + `build-report.md` |

**No manual prompt writing. No flattened mockups. No implementation in this sprint.**

---

## What This Engine Does

| Does | Does Not |
|------|----------|
| Accept official Department Definition | Accept ad-hoc FAL strings from founders |
| Expand prompts (material · scale · negative · Genome) | Send simplistic one-line prompts |
| Organize assets into 16 package folders | Output single background image |
| Generate `package-manifest.json` + runtime manifest | Build React · Three.js · UI |
| Run Quality Engine before packaging | Execute providers (Generation Manager™ downstream) |
| Adapt per Company Genome + Room DNA™ | Hardcode brand visuals |
| Remain provider-agnostic (FAL today) | Lock to one model forever |

---

## Engine Position

```
Company Genome™ + Project Genome™ + Brand Genome™ + Founder Journey™
         +
Department Definition (Generator output)
         +
Studio Asset Registry™ (Smart Reuse · Prompt Library · Pack entitlements)
         ↓
STUDIO ASSET COMPILER™ (this engine)
  Reuse lookup → Adapt → Organize → Expand Prompts → Resolve Dependencies
  → Quality Engine → Package → DepartmentPackage.zip
         ↓
Studio Generation Manager™ (queue · schedule · retry · validate handoff)
         ↓
AI Providers (FAL · OpenAI · Runway · future) — generation is last resort
         ↓
Studio Validation Loop™
         ↓
Department Runtime™ + Cursor
```

---

## Document Index

| Document | Contents |
|----------|----------|
| [compiler-overview.md](./compiler-overview.md) | Purpose · philosophy · integrations |
| [compiler-flow.md](./compiler-flow.md) | End-to-end manufacturing flow |
| [input-spec.md](./input-spec.md) | Department Definition + Genome inputs |
| [output-spec.md](./output-spec.md) | `DepartmentPackage.zip` deliverable |
| [prompt-expansion-engine.md](./prompt-expansion-engine.md) | Glass Panel → full prompt stack |
| [generation-pipeline.md](./generation-pipeline.md) | 12-stage generation order |
| [dependency-resolution.md](./dependency-resolution.md) | Graph · queue · stage gates |
| [quality-engine.md](./quality-engine.md) | Build Health · pre-package checks |
| [package-schema.md](./package-schema.md) | `package-manifest.json` schema |
| [runtime-manifest.md](./runtime-manifest.md) | `15_runtime/` assembly contract |
| [provider-abstraction.md](./provider-abstraction.md) | FAL today · swappable tomorrow |
| [build-report-schema.md](./build-report-schema.md) | `build-report.md` format |
| [future-roadmap.md](./future-roadmap.md) | v2+ manufacturing evolution |

---

## Reference Compile Target

**Creative Direction Studio™** — first Golden Department through the manufacturing pipeline:

| Input | Path |
|-------|------|
| Department Definition | `docs/studio-os/departments/creative-direction-studio/` |
| Expected output | `CreativeDirectionStudio_Package.zip` |
| Package ID | `pkg-creative-direction-golden-v1` |

---

## Success Criteria (v1)

- [ ] Department Definition compiles **without manual prompt writing**
- [ ] Output adapts via **Company Genome™** and **Room DNA™**
- [ ] Output is **generator-agnostic**
- [ ] Produces complete **DepartmentPackage.zip** ready for AI generation
- [ ] Establishes **manufacturing layer** for all future Studio OS departments

---

_Studio Asset Compiler™ — The Manufacturing Engine._
