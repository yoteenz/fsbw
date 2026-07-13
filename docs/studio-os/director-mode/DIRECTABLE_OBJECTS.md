# Directable Objects

Every creative artifact in Studio World becomes **addressable**. Nothing exists as anonymous pixels.

## Object categories

| Domain | Examples |
|--------|----------|
| Brand | Logo, letter, wordmark, icon, typography, color system |
| Packaging | Package, ribbon, foil, bottle, label |
| Environment | Desk, wall, floor, chair, lighting, room, building |
| People & product | Model, hairstyle, product, character |
| Campaign | Campaign, headline, CTA, poster, scene |
| Motion | Animation, camera, transition |
| Media | Audio, illustration, photography, video |
| Materials | Marble, glass, chrome, fabric, texture |

## Required object metadata

Every directable object receives:

| Field | Purpose |
|-------|---------|
| `objectId` | Stable address |
| `version` | Object-local revision |
| `objectFamily` | Category (brand, environment, campaign, …) |
| `dependencies` | Upstream objects and materials |
| `blueprintRef` | Construction Plan or sub-plan reference |
| `owner` | Organization / department / project |
| `materialRefs` | Library material IDs only |
| `approvalStatus` | Draft → Accepted pipeline stage |
| `manufacturingHistory` | Worker, model, timestamps |
| `revisionHistory` | v4 → v5 → v6 lineage |
| `relationshipGraph` | Parent, child, sibling links |

## Contract schema (documentation only)

```typescript
// Conceptual — not implemented this sprint
type DirectableObject = {
  objectId: string;
  version: string;
  objectFamily: string;
  dependencies: string[];
  blueprintRef: string;
  owner: { organizationId: string; departmentId: string };
  materialRefs: string[];
  approvalStatus: ApprovalStage;
  manufacturingHistory: ManufacturingRecord[];
  revisionHistory: RevisionRecord[];
  relationshipGraph: { parents: string[]; children: string[] };
};
```

## Relationship to Asset DNA

Environment objects (desk, landmark, furniture) map to **Asset DNA** in the Manufacturing Engine. Brand and campaign objects will receive parallel DNA schemas in future Director Studios.

## Cross-references

- Asset DNA: `docs/studio-os/manufacturing-engine/ASSET_DNA.md`
- Construction Plan assets: `docs/studio-os/blueprint-author/CONSTRUCTION_PLAN_SCHEMA.md`
- Object Lifecycle: [OBJECT_LIFECYCLE.md](./OBJECT_LIFECYCLE.md)
