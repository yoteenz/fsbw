# Studio Builder™ — Alpha Sprint 002

**Version:** 0.2.0  
**Sprint:** Studio OS Alpha 002  
**Status:** Canonical production interface specification  
**Type:** Founder-facing production layer — not a new platform engine  
**Engine ID:** `studio.builder.v1`

---

> **The founder never opens documentation folders. Studio OS consumes internal knowledge automatically.**

Studio Builder™ is the **production interface** where founders oversee immersive departments being built — like a film producer on a studio lot, not someone managing files.

---

## Mission

Eliminate manual document usage from the founder experience.

| Founder Never | Studio OS Always |
|---------------|------------------|
| Browses `docs/` folders | Reads internal knowledge automatically |
| Locates markdown files | Ingests alpha · production · manifest specs |
| Copies or combines prompts | Compiles one optimized prompt |
| Decides generation order | Dependency engine unlocks stages |
| Tracks asset status manually | Build queue + validation workflow |

The founder presses **one button**. Studio OS performs everything else.

---

## Stack Position

Studio Builder™ sits **above** frozen platform engines — founders never open these directly:

```
FOUNDER
    ↓
STUDIO BUILDER™ (this interface)
    ↓ orchestrates
┌───────────────────────────────────────────────────────┐
│ Company Genome™ · Project Genome™ · Founder Journey™ │
│ Creative Direction Studio™ (department + alpha blueprint)│
│ Department Generator™ · Asset Compiler™ · Prompt Compiler™│
│ Generation Manager™ · Asset Registry™ · Validation Loop™│
└───────────────────────────────────────────────────────┘
    ↓
Internal knowledge (docs) — consumed automatically, never shown as files
```

---

## Design Principle

Studio Builder™ is **not another dashboard**.

It should feel like standing inside a **world-class production studio** watching creative work come to life.

---

## Document Index

| Document | Contents |
|----------|----------|
| [founder-experience.md](./founder-experience.md) | Overall UX · emotional tone · anti-patterns |
| [navigation.md](./navigation.md) | How founders move through production |
| [production-flow.md](./production-flow.md) | Generate button → full orchestration chain |
| [generation-queue.md](./generation-queue.md) | Visual queue · progress · ETA |
| [dependency-unlocking.md](./dependency-unlocking.md) | Locked · ready · complete states |
| [asset-detail-view.md](./asset-detail-view.md) | Per-asset production page |
| [validation-workflow.md](./validation-workflow.md) | Upload · validate · approve · unlock |
| [alpha-temporary-workflow.md](./alpha-temporary-workflow.md) | Copy Prompt · Open Generator · Upload (v0.2) |
| [future-automation.md](./future-automation.md) | API-ready path — zero manual steps |

---

## Alpha v0.2 Workflow Summary

**Today (no API):** Generate → Prompt Ready → Copy → FAL → Upload → Validate → Unlock  
**Tomorrow (API):** Generate → automatic provider → validate → registry → unlock

Architecture for tomorrow is built **now**. Implementation waits.

---

## Pilot Department

**Creative Direction Studio™** — `pkg-creative-direction-golden-v1`  
**Project example:** Project 001  
**Asset groups:** 16 production categories · 35 modular assets

Every future department inherits Studio Builder shell.

---

## Cross-References

| System | Role | Path |
|--------|------|------|
| Alpha blueprint | Internal knowledge ingested | [`../`](../README.md) |
| Generation Manager | Queue execution | [`../../engines/generation-manager/`](../../engines/generation-manager/README.md) |
| Production pipeline | Stage methodology | [`../../production/`](../../production/README.md) |

---

## Success Criteria (Sprint 002)

- [ ] Founder never required to open markdown or docs folders
- [ ] One-button generate per unlocked production group
- [ ] Prompt compilation from 9+ internal sources automatic
- [ ] Visual queue with ETA and group status
- [ ] Dependency unlocking automatic on approval
- [ ] Asset detail view spec complete
- [ ] Alpha temporary workflow (copy/upload) defined
- [ ] Future automation path architected without refactor

**No React. No API implementation. Interface specification only.**

---

_Studio Builder™ — the founder watches production, never chases prompts._
