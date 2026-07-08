# Studio World Canon Hierarchy™

**Status:** Approved · Ratified 2026-07-08

---

## Three tiers

### Tier 1 — Foundational Physics™

**Immutable natural laws.** Comparable to gravity.

- Physical Place Law™
- Relationship Gravity™
- Knowledge Conservation™
- Identity Persistence™
- Scene Integrity™
- Asset Conservation™
- Blueprint Determinism™
- Spatial Continuity™
- Temporal Continuity™
- World Memory™

**Code:** `src/studio-os-core/world-physics/`  
**Canon:** `knowledge/canon/physics/`  
**Graph:** `foundational-physics-law` · `W-PHY-*`

---

### Tier 2 — Constitutional Law™

**Behavioral and architectural governance.** Changes rarely.

**Eight Foundational Laws** (flagship governance):  
`src/studio-os-core/studio-world-constitution/laws.ts`

**Behavioral Constitutional Laws** (process governance):

| Law | Summary |
|-----|---------|
| Documentation First™ | Graph-first; register before ship |
| No Orphan Objects™ | Every object has a home |
| Canon Promotion™ | Lifecycle graduation to canon |
| Immutability of History™ | Historical nodes read-only |
| Agent Memory™ | Motherboard syncs to graph; graph is truth |
| Scene Assembly™ | Runtime composite; no layer re-generation |

**Additional articles:** World Graph Is Truth™ · Three Eras Roadmap™ · Scene Assembly Immutability™

**Canon:** `knowledge/canon/constitution/`  
**Graph:** `constitutional-law` · `W-LAW-*`

---

### Tier 3 — Implementation Standards™

**Engineering patterns.** Evolves continuously.

| Standard | Implements |
|----------|------------|
| World Graph Compile Gate™ | World Memory, Relationship Gravity |
| W-ID Registry™ | Identity Persistence |
| Route Registry Pattern™ | Physical Place, Spatial Continuity |
| Scene Stack Prompt Version™ | Blueprint Determinism, Scene Integrity |
| Era Evaluation Gate™ | World Memory, Temporal Continuity |
| Motherboard Sync Contract™ | Agent Memory |
| One Deploy Per Task™ | Knowledge Conservation |

**Code:** `src/studio-os-core/implementation-standards/`  
**Canon:** `knowledge/canon/implementation-standards/`  
**Graph:** `implementation-standard` · `W-STD-*`

---

## Dependency chain

```
Physics (immutable)
  ↑ depends-on
Constitution (rare change)
  ↑ implements
Implementation Standards (continuous evolution)
```

Constitutional laws declare `physicsBasis` in code. Standards declare `implementsLaws`.

---

## Evaluation before implementation

1. Does this respect **Physics**? (Cannot be waived)
2. Does this comply with **Constitution**?
3. Does this follow current **Implementation Standards**?

---

## See also

- [STUDIO_WORLD_PHYSICS_ARCHITECTURE.md](../world-physics/STUDIO_WORLD_PHYSICS_ARCHITECTURE.md)
- [knowledge/canon/README.md](../../knowledge/canon/README.md)
