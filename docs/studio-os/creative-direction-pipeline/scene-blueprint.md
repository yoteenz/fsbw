# Scene Blueprint™

**Step 05 — The production truth document**

---

## Purpose

Define the **authoritative production document** for each concept — co-generated with the rendered image.

> **The rendered image is the visual reference.**  
> **The Scene Blueprint™ is the production truth.**

---

## Core Law

**Do NOT reverse engineer from pixels alone.**

When Studio OS requests concept generation, it **must simultaneously create** a structured Scene Blueprint™.

Reverse Engineering™ reads the blueprint — the image confirms it.

---

## Blueprint Schema

```typescript
interface SceneBlueprint {
  id: string;
  conceptId: string;
  version: number;

  // Spatial architecture
  architecturalZones: ArchitecturalZone[];
  roomLayout: RoomLayout;
  navigationFlow: NavigationPath[];
  roomPurpose: string;

  // Camera & composition
  cameraPosition: CameraAnchor;
  focalPoints: FocalPoint[];
  sightlines: Sightline[];

  // Objects & inventory
  heroObject: ObjectReference;
  furnitureInventory: ObjectReference[];
  interactiveZones: InteractionZone[];
  objectRelationships: ObjectRelationship[];

  // Materials & finishes
  materials: MaterialSpec[];
  finishes: FinishSpec[];
  colorPalette: ColorPaletteIntent;

  // Atmosphere
  lightingIntent: LightingIntent;
  atmosphere: AtmosphereProfile;
  audioProfile: AudioProfile;
  environmentalStorytelling: StorytellingBeat[];

  // World data
  persistentWorldData: PersistentWorldSnapshot;
  setDnaAlignment: SetDnaSnapshot;
  roomDnaAlignment: RoomDnaSnapshot;

  // Reference
  renderedImageRef: string;
  generatedAt: string;
  status: 'draft' | 'approved' | 'evolving';
}
```

---

## Required Blueprint Sections

| Section | Contents |
|---------|----------|
| **Architectural zones** | Shell · floor · ceiling · alcoves · portals · wings |
| **Room layout** | Dimensions · proportions · zone boundaries |
| **Camera position** | Default arrival · inspection · walk paths |
| **Hero object** | Primary visual anchor (Mood Wall™ · Story Table™ · Orb™) |
| **Focal points** | Where founder eye should land |
| **Furniture inventory** | Every piece with position · scale · purpose |
| **Materials** | Marble · glass · wood · metal · fabric |
| **Finishes** | Surface treatments · reflections · wear |
| **Lighting intent** | Key · fill · rim · practical · mood |
| **Color palette** | Warm/cool · accent · brand alignment |
| **Object relationships** | Parent/child · adjacency · dependency |
| **Interaction zones** | Where founder can tap · walk · inspect |
| **Environmental storytelling** | Ambient narrative · objects that tell story |
| **Audio profile** | Ambient · ceremony · Orb voice register |
| **Atmosphere** | Emotional register · time of day · energy |
| **Room purpose** | What work happens here |
| **Navigation flow** | Entry · zones · exit · transitions |
| **Persistent world data** | State that survives sessions |

---

## Blueprint ↔ Image Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                    SCENE BLUEPRINT™                         │
│              (structured production truth)                  │
│                         ↕ sync                            │
│                   RENDERED IMAGE                            │
│              (visual reference for humans)                  │
└─────────────────────────────────────────────────────────────┘
```

| Scenario | Authority |
|----------|-----------|
| Blueprint says desk left · image shows desk right | **Blueprint wins** — image regenerated or flagged |
| Founder says "move Orb closer" | Blueprint updated · targeted regen |
| Pixel inference disagrees with blueprint | **Never trust pixels alone** |

---

## Blueprint Evolution

Scene Blueprint™ is **living** — every refinement updates it:

| Event | Blueprint change |
|-------|------------------|
| Refine Orb™ | Update Orb node position · relationship |
| Refine Lighting™ | Update lightingIntent |
| Refine Mood Wall™ | Update heroObject · focalPoints |
| Dependency cascade | Update related sections automatically |

Version history preserved — never silent overwrite.

---

## CDS Pilot Blueprint Targets

| Zone | Blueprint node |
|------|----------------|
| Creative Atelier™ shell | `zone-shell-cds` |
| Mood Wall™ (hero) | `hero-mood-wall-cds` |
| Story Table™ | `object-story-table-cds` |
| Studio Orb™ | `object-orb-cds` |
| Brief Wall™ | `zone-brief-wall-cds` |
| Observatory™ | `zone-observatory-cds` |
| Lighting rig | `lighting-editorial-cds` |

---

## Generation Requirements

Concept generation API contract:

```typescript
interface ConceptGenerationResult {
  conceptId: string;
  renderedImage: ArtifactRef;
  sceneBlueprint: SceneBlueprint;  // REQUIRED — never optional
  blueprintImageConsistencyScore: number;
}
```

Reject results where `sceneBlueprint` is missing or consistency score below threshold.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Blueprint from CV/pixels only | Unreliable · loses intent |
| Image-only concepts | No production truth |
| Static blueprint post-approval | Must evolve with refinements |
| Blueprint without relationships | No dependency awareness |

---

## Cross-References

- [reverse-engineering.md](./reverse-engineering.md)
- [asset-graph.md](./asset-graph.md)
- [department-generator/scene assembly](../department-generator/assembly-pipeline.md)
