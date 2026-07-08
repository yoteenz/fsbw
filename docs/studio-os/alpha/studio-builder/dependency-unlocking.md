# Dependency Unlocking — Studio Builder™

**Sprint:** Alpha 002  
**Rule:** When a group completes, dependent groups unlock **automatically**

---

## Founder-Visible States

| State | UI | Founder action |
|-------|-----|----------------|
| **Locked** | Dim strip · 🔒 · reason | None — read reason only |
| **Ready** | Full brightness · [ Generate ] | Press Generate |
| **In Progress** | Active animation | Wait / alpha upload |
| **Complete** | ✓ green | Optional regenerate |
| **Needs Revision** | ⚠ amber | Retry |

---

## Lock Reasons (Plain Language)

| Reason shown | Meaning |
|--------------|---------|
| Waiting on Environment | Floor/shell not approved |
| Waiting on Architecture | Shell not complete |
| Waiting on Lighting | Rig not validated |
| Waiting on Furniture | Tables/shelves not ready |
| Waiting on Mood Wall | Hero surface not approved (for particles) |
| Reused from Library | Auto-complete — no Generate needed |
| Blueprint incomplete | Rare — department not bound |

Never: `depends on env-shell-cds stage 2 gate`

---

## CDS Unlock Graph

### On Environment ✓ Complete

Unlock immediately:

- **Architecture** (shell requires floor context)
- Partial prep for **Lighting** (may remain locked until Architecture ✓)

### On Architecture ✓ Complete

Unlock:

- **Lighting**
- **Furniture** (floor + shell context)
- **Panels** (portal markers need shell)

### On Lighting ✓ Complete

Unlock:

- **Furniture** (if not already)
- **Mood Wall** (hero lighting)
- **Glass Systems** (light response)

### On Furniture ✓ Complete

Unlock:

- **Timeline** (table ready)
- **Orb** (pedestal placement)
- **Glass Systems** (zone context)

### On Mood Wall ✓ Complete

Unlock:

- **Particles** (hero atmosphere context)
- **Branch Comparison** (within Mood group completion)

### On Orb ✓ Complete

Unlock:

- **Audio** (orb SFX chain)

### On Glass + Furniture + Mood ✓

Unlock:

- **Animations** (choreography refs)
- **Runtime Metadata** (walk markers need zones)

Visual: unlock cascade animation — lock icon dissolves · Generate fades in.

---

## Unlock Rules Engine

```yaml
UnlockRule:
  groupId: architecture
  requiresGroupsComplete: [environment]
  requiresAssetsApproved: [env-floor-cds]
  optionalReuse: false

UnlockRule:
  groupId: lighting
  requiresGroupsComplete: [architecture]
  requiresAssetsApproved: [env-shell-cds]

UnlockRule:
  groupId: particles
  requiresGroupsComplete: [mood-wall, lighting]
  requiresAssetsApproved: [wall-mood-cds]
```

Studio Builder evaluates on every **approval** event.

---

## Registry Reuse Auto-Complete

| Group | If reuse linked | Founder sees |
|-------|-----------------|--------------|
| Orb | `orb-cds` → registry | ✓ Reused from Library — instant |
| Glass | adapt link | Generate still shown OR auto adapt pass |
| Lighting | adapt link | One-click **Apply Adaptation** (future) |

Reuse counts as **Complete** for dependency purposes.

---

## Partial Group Completion

Architecture has 6 assets. 4 approved · 2 pending:

- Group state: **In Progress**
- Dependent groups: **remain locked**
- Founder sees: `Architecture — 4 / 6 complete` in expand list

No unlock until group policy satisfied (all required assets approved).

---

## Regenerate Impact

Founder regenerates **Environment** after Architecture complete:

| Policy (Alpha) | Behavior |
|----------------|----------|
| **Cascade lock** | Dependent groups lock until Environment re-approved |
| **Warning** | "Architecture was built on this floor. Regenerating will require review of dependent assets." |

Founder confirms — studio safety.

---

## Unlock Animation Spec

200ms stagger per newly unlocked row:

1. Lock icon opacity 0  
2. Row brightness 0.6 → 1.0  
3. Generate button scale 0.95 → 1.0  
4. Optional subtle chime (respect reduced motion: skip)

---

## Dependency Diagram (Founder Optional)

Hidden by default. **View Dependencies** in ⋮ menu shows simplified graph — not Mermaid in admin UI.

```
Environment → Architecture → Lighting
                    ↓            ↓
               Furniture ←───────┘
                    ↓
         Mood Wall · Glass · Orb
                    ↓
              Particles · Audio
                    ↓
           Runtime Metadata
```

Educational only — not required to operate.

---

## Multi-Group Unlock Notification

Single banner when Environment completes:

```
✓ Environment complete. Architecture, Lighting, and Furniture preparation unlocked.
```

Batch message — not three toasts.

---

_Dependency unlocking — the studio opens doors, not the founder._
