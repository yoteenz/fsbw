# 08 — Room Memory

**Engine Module:** `studio.walk-the-room.v1.room-memory`  
**Status:** Spatial institutional memory per environment  
**Philosophy:** Every room remembers. Nothing is forgotten.

---

## Design Principle

> Every room remembers previous walkthroughs. Users see prior discussions, resolved issues, outstanding concerns, version history, founder decisions, and AI recommendations — **anchored to the places where they happened**.

---

## Room Memory Scope

Room Memory is **per environment anchor** — department, zone, object, or headquarters region:

```yaml
RoomMemoryRecord:
  memoryId: string
  environmentId: string            # department id · project id · etc.
  anchorId: string | null        # null = room-level

  entries:
    - entryId: string
      entryType: enum
        # walkthrough | spatial-critique | decision | resolution
        # open-concern | recommendation | version-snapshot | preview-applied

      walkId: string
      timestamp: ISO8601
      author: AIRoleId | founder
      content: string
      status: enum                 # open | resolved | dismissed | superseded

      versionRef: VersionSnapshot | null
      linkedDecisionId: string | null
      evidence: string[]
```

---

## What Users See In-Room

| Visible Element | When |
|-----------------|------|
| **Resolved issue ghost** | Subtle checkmark at anchor — tap for history |
| **Open concern pulse** | Soft highlight on unresolved critique |
| **Version marker** | "Version B discussed here · March 12" |
| **Decision plaque** | Founder decision summary at anchor |
| **Prior walk trail** | Optional — faint path of last walkthrough |
| **Recommendation outcome** | Post-session learning badge (validated · regretted) |

**Rule:** Memory is **discoverable** — not cluttering. Presentation Mode may toggle memory layer visibility.

---

## Room Memory vs Critique Memory

| Layer | Scope |
|-------|-------|
| **Critique Sessions Memory (10)** | Founder preferences · philosophy · cross-subject patterns |
| **Room Memory (08)** | Spatial history per environment · anchor-attached |

Shared `FounderPreferenceProfile` — Room Memory feeds spatial evidence.

---

## Version History

```yaml
VersionSnapshot:
  versionId: string
  label: string                    # "Version A" · "Branch B" · "Pre-launch"
  capturedAt: ISO8601
  source: enum                     # walk-preview · committed-regen · manual-branch
  anchorStates: AnchorState[]      # per-object snapshots for compare
```

Founder: "Compare Version B" → Room Memory loads snapshot · Live Visualization toggles.

---

## Walkthrough Continuity

Resuming interrupted walk:

```
Orb: "Welcome back. We paused at the Mood Board — two open critiques remain.
      Continue from here or restart?"
```

Room Memory restores:
- Stop position
- Active spatial critiques
- Uncommitted previews (reverted)
- Open Action Mode items

---

## Outstanding Concerns Dashboard (Spatial)

No dashboard UI — concerns surface **in the room**:

- Entry threshold shows count: "3 open concerns in this department"
- Orb may offer critical-only path filtered to open concerns
- Resolved concerns remain as ghosts — institutional pride

---

## Memory Persistence Events

```yaml
RoomMemoryEvent:
  eventId: string
  walkId: string
  environmentId: string
  anchorId: string | null
  eventType: enum
  payload: object
  timestamp: ISO8601
```

Emitted on: critique raised · decision recorded · resolution applied · version saved · concern opened/closed.

---

## Retention

| Data | Retention |
|------|-----------|
| Full walk transcripts | Indefinite |
| Version snapshots | Indefinite · compress after 10 versions |
| Resolved concern ghosts | Indefinite · fade visually over time |
| Dismissed advice | Indefinite · for post-session learning |
| Preview-only (uncommitted) | Not retained |

---

## Integration

| Consumer | Usage |
|----------|-------|
| Walkthrough Path Resolver | Inject open-concern stops |
| Live Visualization | Version compare |
| AI Team Presence | "Last walkthrough you decided…" |
| Post Session Learning | Outcome badges at anchor |
| Validation Evolution | Spatial regression detection |

---

_Next: [09 — Action Mode](./09_ACTION_MODE.md)_
