# Asset Graph™

**Step 07 — Every object becomes an editable node**

---

## Purpose

Transform the deconstructed room into an **Asset Graph™** — a living graph of every object in the approved vision, each node editable through the Refinement Pipeline™.

---

## Core Law

**Everything becomes a node. Nothing is invisible.**

---

## Node Categories

| Category | Examples |
|----------|----------|
| **Architecture** | Floor · walls · ceiling · windows |
| **Lighting** | Key · fill · rim · practicals · rig |
| **Furniture** | Desk · Story Table™ · seating · shelving |
| **Hero objects** | Mood Wall™ · Orb™ · Brief Wall™ |
| **Displays** | Screens · projections · compare screen |
| **Plants** | Living decor · atmosphere |
| **Packaging** | Brand artifacts |
| **Books** | Reference · storytelling |
| **Decor** | Objects · art · trophies |
| **Ambient objects** | Particles · dust · atmosphere |
| **Particles** | VFX · light shafts |
| **Reflections** | Floor · glass · mirror |
| **Materials** | Surface definitions |
| **Interactive objects** | Tappable · draggable |
| **Camera anchors** | Arrival · inspect · walk |
| **Audio sources** | Ambient · ceremony · Orb |
| **Navigation nodes** | Zone entry · transitions |

---

## Graph Schema

```typescript
interface AssetGraph {
  id: string;
  visionId: string;
  sceneBlueprintId: string;
  version: number;

  nodes: AssetGraphNode[];
  edges: AssetGraphEdge[];
  zones: ZoneNode[];
}

interface AssetGraphNode {
  id: string;
  category: AssetNodeCategory;
  label: string;                    // "Mood Wall™" · "Studio Orb™"
  sceneBlueprintRef: string;

  // State
  status: 'approved-vision' | 'refining' | 'braintrust-review' | 'founder-review' | 'approved' | 'locked';
  generationArtifact?: ArtifactRef;

  // Production
  promptStack?: ExpandedPromptStack;
  genomeSlots: GenomeSlotMap;

  // Graph
  parentZoneId: string;
  dependencies: string[];           // nodes this affects
  dependents: string[];             // nodes affected by this

  // Interaction
  tappable: boolean;
  inspectable: boolean;
  refinementEnabled: boolean;
}

interface AssetGraphEdge {
  from: string;
  to: string;
  relationship: 'depends-on' | 'adjacent-to' | 'parent-of' | 'lights' | 'reflects' | 'audio-coupled';
}
```

---

## Graph Visualization (Founder Mental Model)

Founders never see a technical graph UI. They **tap objects in the room**.

The graph exists as production infrastructure:

```
                    [Zone: Creative Atelier™]
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   [Architecture]        [Hero: Mood Wall™]    [Orb™]
        │                     │                     │
   [Windows]──depends──►[Lighting]◄──affects──[Reflections]
        │                     │
   [Particles]            [Displays]
```

---

## Node Lifecycle

```
approved-vision (from Reverse Engineering™)
        ↓
refining (founder tapped · Director Feedback™)
        ↓
braintrust-review (Creative Review™)
        ↓
founder-review
        ↓
approved (node locked in Golden Build path)
        ↓
locked (Golden Build™ certified)
```

---

## Tap-to-Refine Mapping

| Founder taps | Graph action |
|--------------|--------------|
| Orb™ | Select `object-orb-cds` node → Refine Orb™ |
| Mood Wall™ | Select hero node → Refine Mood Wall™ |
| Lighting (area) | Select lighting rig node → Refine Lighting™ |
| Story Table™ | Select furniture node → Refine Story Table™ |
| Windows | Select architecture node → Refine Windows™ |

**Everything else remains untouched.**

---

## Dependency Edges

Asset Graph™ encodes [Dependency Awareness™](./production-intelligence.md):

```
ceiling-height (architecture)
    ├── lighting-rig
    ├── camera-arrival
    ├── reflections-floor
    ├── ambient-audio
    ├── particles-shaft
    ├── navigation-clearance
    └── orb-pedestal-scale
```

Changing `ceiling-height` triggers dependency warning before refinement executes.

---

## Relationship to Asset Manifest

[asset-manifest.json](../departments/creative-direction-studio/asset-manifest.json) (35 assets) becomes **derived output** of Asset Graph™ — not the planning source.

| Old flow | New flow |
|----------|----------|
| Plan 35 assets → generate each | Approve vision → graph extracts nodes → refine as needed |
| Manifest is source of truth | **Scene Blueprint™ + Asset Graph™** are truth |
| Manifest drives queue | Graph drives refinement |

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Flat asset list without graph | No dependency awareness |
| Nodes without blueprint ref | Orphan production |
| Regenerate all nodes on one change | Violates surgical refinement |
| Hidden nodes | Founder can't tap to refine |

---

## Cross-References

- [refinement-pipeline.md](./refinement-pipeline.md)
- [production-intelligence.md](./production-intelligence.md)
- [scene-blueprint.md](./scene-blueprint.md)
