# Creative Blueprint Engine™ — Master Specification

**Engine ID:** `studio.creative-blueprint.v1`  
**Status:** Design intelligence above Asset Registry™

---

## The Problem

Traditional AI tools think in **assets**:

- Generate a chair
- Generate a light
- Generate a floor
- Hope they match

Studio OS companies fail visually when rooms share random reused objects but **lack a shared design language**.

---

## The Solution

Studio OS thinks in **Blueprints™**:

- Editorial Luxury Blueprint™
- Luxury Material System™
- Editorial Lighting System™
- Bronze Details Language™

Assets are **instances**. Blueprints are **systems**.

---

## Core Laws

### Law 1 — Design Language First

> Every future decision references the company's **Visual DNA™** first.

Before asset search · before generation · before department layout — resolve Blueprint context.

### Law 2 — Systems Travel Together

> The founder never manages sub-systems individually.

Indirect lighting · accent pools · volumetrics · shadow profiles · bloom — they are one **Editorial Lighting System™**, not seven separate founder decisions.

### Law 3 — Inheritance Default

> New departments should never begin empty.

They inherit Visual DNA™ → Blueprint™ → Systems™ → Assets™ → Interactions™.

### Law 4 — Evolution Is Collective

> If the founder upgrades lighting, every department using that Blueprint can inherit the improvement.

The company evolves together — not room by room.

### Law 5 — Generation Is Last

> When generating a new department, generation is the final option.

Apply Existing™ · Duplicate Blueprint™ · Create Variant™ precede Generate Completely New™.

### Law 6 — Recognizable Language

> A founder walks into any department and recognizes their company — not because rooms are identical, but because they speak the same architectural language.

---

## Hierarchy Detail

```
Company (org)
│
├── Visual DNA™                    "Editorial Luxury™"
│   │
│   ├── Creative Blueprint™        "Editorial Luxury Blueprint™"
│   │   │
│   │   ├── Systems™
│   │   │   ├── Luxury Material System™
│   │   │   ├── Editorial Lighting System™
│   │   │   ├── Architectural Language™
│   │   │   ├── Glass Language™
│   │   │   ├── Atmospheric Language™
│   │   │   ├── Motion Language™
│   │   │   ├── Audio Language™
│   │   │   ├── Transition Language™
│   │   │   ├── Color Language™
│   │   │   ├── Typography Language™
│   │   │   ├── Orb Interaction System™
│   │   │   └── Environmental FX™
│   │   │
│   │   └── Assets™ (Registry links)
│   │       ├── registry:dark-marble-executive
│   │       ├── registry:editorial-lighting-pack
│   │       └── registry:bronze-trim-system
│   │
│   └── Creative Blueprint™ (variant) "Editorial Luxury — Marketing Accent"
│
└── Visual DNA™ (future evolution chapter)
```

---

## CDS + Marketing Example

**Creative Direction Studio™** uses **Editorial Luxury Blueprint™**, which automatically applies:

| System | Expression |
|--------|------------|
| Luxury Materials™ | Dark stone · brushed metal |
| Editorial Lighting™ | Warm pools · volumetric haze |
| Bronze Details™ | Trim · hardware · accents |
| Smoked Glass™ | Partitions · displays |
| Warm Reflections™ | Reflection profiles |
| Executive Furniture™ | Desks · shelving language |
| Soft Atmosphere™ | Low-density haze |
| Orb Lighting™ | Host illumination rules |

**Marketing™** inherits the same Blueprint.

Rooms feel related **without regenerating everything** — Systems™ coordinate · Asset Intelligence links existing assets · partial gaps generate only where needed.

---

## Input Contract

```yaml
BlueprintContextRequest:
  orgId: string
  departmentId: string | null
  sceneId: string | null
  intent: new-department | new-scene | upgrade-system | audit-coherence
  hints:
    industry: string | null
    mode: entrepreneur | enterprise | creator | agency | franchise
    visualDnaPreference: string | null
```

---

## Output Contract

```yaml
BlueprintContextResponse:
  visualDna: VisualDNARef
  activeBlueprint: BlueprintRef
  systems: SystemRef[]              # bundled for this context
  assetBindings: AssetBinding[]     # Registry links per system
  inheritanceChain: InheritanceRecord[]
  coherenceScore: number            # 0-100
  gaps: SystemGap[]                 # missing assets · needs generation
  founderChoices: FounderBlueprintChoice[]
```

---

## Integration with Asset Intelligence

Order of operations:

```
1. Creative Blueprint Engine™ — resolve Visual DNA™ + Blueprint™ + Systems™
2. Asset Intelligence Engine™ — search Registry for blueprint-bound assets
3. Gap analysis — which Systems™ lack approved assets
4. Founder gates — blueprint choice + asset reuse choice
5. Generation Manager™ — fill gaps only
```

Asset Intelligence **Company DNA™** becomes the **measurement** of how well assets express active Blueprint™.

---

## Integration with Scene Stack™

Scene Stack layers map to Blueprint Systems™:

| Layer | Blueprint System |
|-------|------------------|
| Environment Shell™ | Architectural Language™ |
| Signature Landmark™ | Architectural Language™ + department landmark rules |
| Furniture | Executive Furniture System™ (or blueprint variant) |
| Lighting | Editorial Lighting System™ |
| Atmosphere | Atmospheric Language™ |
| Surface Materials | Luxury Material System™ · Color Language™ |
| Ambient Motion | Motion Language™ |
| Interaction | Orb Interaction System™ |
| Runtime FX | Environmental FX™ |
| Personalization | Visual DNA™ genome slots |

Regenerating one layer still respects Blueprint System boundaries.

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Department starts with blank visual context | Breaks HQ coherence |
| Founder picks individual light temperature per room | Violates Systems Travel Together |
| Asset reuse without Blueprint context | Objects match · world doesn't |
| New department full regen when Blueprint exists | Wastes language already built |
| Confuse Business Discovery Blueprint™ with Creative Blueprint™ | Different domains |

---

## Final Philosophy

The greatest creative directors don't remember every object they've ever used.

They develop a **visual language** that becomes instantly recognizable.

Studio OS should do the same.

Every generation should **strengthen** a company's identity rather than reinvent it.

---

_See also: [visual-dna.md](./visual-dna.md) · [creative-blueprints.md](./creative-blueprints.md) · [inheritance-model.md](./inheritance-model.md)_
