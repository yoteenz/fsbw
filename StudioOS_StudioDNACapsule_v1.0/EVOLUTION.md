# Evolution — Living Document Protocol

**Capsule:** Studio DNA Capsule 1.0.0  
**Purpose:** How Studio DNA Capsule grows over time without losing history

---

## Principle

Founder philosophy **emerges in conversation** — repeated preferences, rejected patterns, and approved instincts should accumulate into this capsule, not scatter across chat logs.

---

## When to append

Append to the relevant DNA file (or this EVOLUTION log) when:

- The founder states the same preference **twice** across sprints  
- A review rejects work for a **repeatable taste reason**  
- A new canon entry is approved (cross-link CANON_REGISTRY)  
- Communication or quality standards explicitly change  

---

## Append format

Add to **EVOLUTION.md** changelog table:

| Version | Date | Section | Change | Source |
|---------|------|---------|--------|--------|
| 1.0.1 | YYYY-MM-DD | FOUNDER_DESIGN_PHILOSOPHY | Added pattern: … | Sprint / chat ref |

Then edit the target section with the new bullet — **do not rewrite history**; add dated subsections if needed.

---

## Versioning

| Bump | When |
|------|------|
| **Patch** (1.0.x) | Clarifications, new bullets, registry rows |
| **Minor** (1.x.0) | New DNA document file or policy section |
| **Major** (x.0.0) | Restructuring or conflicting philosophy resolution (founder-led) |

After bump:

1. Update `MANIFEST.md` version  
2. Update `studio-dna-capsule.json`  
3. Run `npm run package:studio-dna-capsule-zip`  
4. Note in `motherboard/MEMORY.md`  

---

## Relationship to Context Capsule

| Capsule | Update frequency |
|---------|------------------|
| Context | Every sprint / handoff change |
| DNA | When **thinking** changes — less often, higher permanence |

---

## Changelog

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-07-11 | Initial Studio DNA Capsule — Sections 20–21; full philosophy stack; Canon Preservation Policy; starter CANON_REGISTRY |

---

## Goal

Future AI collaborators gradually align with Studio OS judgment — **by reading**, not by guessing the founder’s taste each session.

---

*Evolution.md is the audit trail for DNA changes — keep it current.*
