# Object Lifecycle

Every directable object follows the same lifecycle within Director Mode.

## Lifecycle phases

```
1. Conceived      — founder vision captured (draft)
2. Planned        — Blueprint Author produces specification
3. Previewed      — Construction Mode / visual blueprint
4. Directed       — founder selects and directs changes
5. Approved       — founder authorizes manufacturing
6. Manufactured   — workers execute Render Intent
7. Inspected      — Quality Guard + Manufacturing Inspection
8. Verified       — Immune System compares to Blueprint/DNA
9. Installed      — object mounted in scene / living context
10. Living        — object operational in Living World
11. Iterated      — object-local version bump (loop to Planned)
12. Repaired       — Immune System targeted repair
13. Retired        — object removed from Living World (history preserved)
```

## Lifecycle metadata

| Record | Preserved |
|--------|-----------|
| Blueprint revision | Yes |
| DNA revision | Yes |
| Render Intent revision | Yes |
| Worker + model | Yes |
| Inspection score | Yes |
| Approval actor + timestamp | Yes |
| Repair history | Yes |
| Director decision log | Yes |

## Status mapping to health overlay

| Lifecycle phase | Health color (Construction Mode) |
|-----------------|----------------------------------|
| Queued | Gray |
| Manufacturing | Blue |
| Inspecting | Yellow |
| Verified / Living | Green |
| Repairing | Red |
| Waiting dependencies | Purple |

## Cross-references

- World Manufacturing History: `docs/studio-os/manufacturing-engine/WORLD_MANUFACTURING_HISTORY.md`
- Digital Twin: `docs/studio-os/manufacturing-engine/DIGITAL_TWIN_MANUFACTURING.md`
- Object Lifecycle ↔ Asset DNA lifecycle status in Manufacturing Engine
