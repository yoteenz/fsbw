# Founder Memory™

**The Building Becomes Memory**

---

## Law

Founders remember their company like memories **inside a building** — not inside software.

**Signature Landmarks™** are the anchors of Founder Memory™.

---

## The Shift

| Software memory | Spatial memory |
|-----------------|----------------|
| "I clicked Approve" | "I approved at the Story Table" |
| "The dashboard showed…" | "The Vault illuminated…" |
| "Notification on Hiring tab" | "We met in the Observatory" |
| "Export from Analytics" | "The Genome revealed…" |

Spatial memory is **stickier** · **more emotional** · **more shareable**.

---

## Memory Anchor Pattern

Every significant company event should bind to a landmark:

```
Event occurs
        ↓
Work happens at Signature Landmark™
        ↓
Milestone recorded with landmark tag
        ↓
Founder Memory™ stores: WHO · WHAT · WHERE (landmark) · WHEN
        ↓
Living Timeline™ · Expedition Memory™ · Founder's Story™
```

---

## Canonical Memory Examples

| Event | Landmark | Founder remembers |
|-------|----------|-------------------|
| First campaign approval | Story Table™ | *"I approved that campaign at the Story Table."* |
| First employee hired | Talent Observatory™ | *"We hired our first employee in the Observatory."* |
| First million revenue | Capital Vault™ | *"We celebrated our first million in the Capital Vault."* |
| International launch | Launch Constellation™ | *"We launched internationally from the Launch Constellation."* |
| LLC formation signed | Charter Hall™ | *"We signed in the Charter Hall."* |
| Five-star review received | Relationship Gallery™ | *"We hung it in the Gallery."* |
| Fulfillment crisis resolved | Fulfillment Nexus™ | *"We cleared the backlog at the Nexus."* |
| Automation live | Operations Engine™ | *"We turned on the Engine."* |
| Churn pattern discovered | Living Company Genome™ | *"The Genome showed us before the board did."* |

---

## Founder Memory™ Schema (Conceptual)

```typescript
type FounderMemory = {
  id: string;
  eventType: MilestoneType | DecisionType | CelebrationType;
  summary: string;
  landmarkId: SignatureLandmarkId;  // required
  departmentId: DepartmentId;
  sceneId?: SceneId;
  timestamp: ISO8601;
  expeditionId?: ExpeditionId;
  routineId?: RoutineId;
  emotionalTone?: string;
  archiveRef?: ArchiveId;
};
```

**Rule:** `landmarkId` required for milestone-grade memories.

---

## Integration with Company Memory™

| System | Landmark role |
|--------|---------------|
| [Expedition Memory™](../expeditions/company-memory.md) | Expedition milestones tag landmark |
| [Living Timeline™](../expeditions/living-roadmaps.md) | Timeline entries show landmark thumbnail |
| [Founder's Story™](../expeditions/company-memory.md) | Chapters organized by places visited |
| [The Archive™](../world/archive-integration.md) | Landmark state preserved at milestone |
| [Routines™ Memory](../routines/routine-memory.md) | Routine completion logs landmark |

---

## Revisit Experience

Founders must be able to **revisit** memories at their landmarks:

| Action | Experience |
|--------|------------|
| Tap timeline entry | Camera travels to landmark · moment replays |
| Expedition retrospective | Orb walks founder through landmark · milestone day |
| Anniversary notification | Landmark celebrates · ambient change · Orb narrates |
| Legacy™ mode | Archive shows landmark as it was on that date |

---

## Social Sharing

Shared milestones reference landmarks — natural marketing:

> *"We hit our first million — at the Capital Vault."*

Shared preview cards from [Studio Preview™](../preview/README.md) should show landmark silhouettes.

---

## Multi-Company Founders

Serial founders build **landmark memory palaces** across companies:

| Company A | Company B |
|-----------|-----------|
| Story Table™ — first brand approved | Story Table™ — different expression · same memory type |
| Observatory™ — first hire | Observatory™ — new team orbit |

Landmark **type** persists · Living Set™ **expression** varies.

---

## AI & Orb Memory

Orb references Founder Memory™ at landmarks:

> *"Six months ago you approved a similar direction at this table."*

> *"Your first hire started at this Observatory position."*

Landmark + memory = **continuity** · **trust** · **institutional knowledge**.

---

## Design Implication

When designing any new feature ask:

> *"Where does this happen? Which landmark?"*

If no landmark → feature is not yet placed in Studio World™.

---

## See Also

- [department-landmarks.md](./department-landmarks.md)
- [orb-landmark-system.md](./orb-landmark-system.md)
- [../expeditions/company-memory.md](../expeditions/company-memory.md)
