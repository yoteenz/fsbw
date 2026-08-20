# Legacy Brand Intelligence Recovery — Studio World Methodology

**Version:** 1.0  
**First specimen:** NDXbook (`docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.md`)  
**Boundary:** Studio World (fsbw) exports knowledge; downstream systems (SITE 00 / EVOLVE) consume portable handoffs — **no runtime coupling**.

---

## Purpose

When a brand originates in Studio World and later activates in a business orchestration system (SITE 00 EVOLVE), recover existing intelligence **before** asking the founder to recreate it.

**Goal:** RECOVER first · ASK ONLY FOR TRUE GAPS.

---

## System Boundary

| System | Owns |
|--------|------|
| **SITE 00 / EVOLVE** | Business/brand orchestration, marketing strategy, objectives, channel intelligence, campaign planning, manifests, distribution planning, publishing orchestration, performance intelligence |
| **Studio World (fsbw)** | Creative production infrastructure, production execution, asset generation, production methods, provenance, governed compute, creative-production workflows |

NDXbook is the first specimen proving the **knowledge-transfer contract** between these systems.

---

## Recovery Phases

1. **FIND** — repository-wide forensic search (code, docs, fixtures, migrations, git history, read-only DB)  
2. **CLASSIFY PURPOSE** — why the brand existed; experimental vs approved  
3. **RECOVER BRAND** — identity, business, audience, voice, strategy  
4. **RECOVER MARKETING/CONTENT** — pillars, channels, campaigns, social concepts  
5. **RECOVER PRODUCTION HISTORY** — Studio World-only; separate from brand canon  
6. **INVENTORY ASSETS** — with approval status  
7. **PROVENANCE CLASSIFY** — every reusable fact tagged  
8. **EVOLVE GAP ANALYSIS** — map to downstream assessment domains  
9. **FOUNDER QUESTION REDUCTION** — minimum questionnaire for true gaps  
10. **PORTABLE HANDOFF** — MD + JSON, no secrets  
11. **IMPORT CONTRACT** — define stages; do not implement importer in fsbw  

---

## Provenance Classifications

| Class | Meaning |
|-------|---------|
| **CANONICAL** | Strong evidence of confirmed brand truth |
| **REFERENCE** | Useful context — not automatic current truth |
| **OWNER_CONFIRMATION_REQUIRED** | Potentially current — founder must confirm |
| **STUDIO_WORLD_ONLY** | Production implementation — never EVOLVE brand canon |
| **DUPLICATE** | Downstream already has equivalent |
| **CONFLICT** | Incompatible versions — founder review |
| **OBSOLETE** | Superseded — preserve provenance, do not import as active |

Each item also receives **HIGH / MEDIUM / LOW** confidence (evidence-based).

---

## Principles

1. **Existence ≠ canon** — code/demo seeds are not founder approval  
2. **Production history ≠ brand truth** — pipeline metadata stays in Studio World  
3. **No mystery canon** — every importable field retains provenance (file, table, commit)  
4. **No secrets in handoffs** — tokens, encrypted fields, API keys excluded  
5. **No runtime coupling** — downstream imports portable packages; never fetch fsbw at runtime  
6. **Read-only recovery** — no DB mutations, no publishing, no activation during recovery sprint  

---

## Deliverables (per brand)

- `docs/studio-world/{brand}/SITE00_HANDOFF.md` — human review artifact  
- `docs/studio-world/{brand}/SITE00_HANDOFF.json` — machine-readable portable package  
- `src/studio-os-core/{brand}-recovery/` — classification builder + secret exclusion tests (optional)  

---

## Import Stages (downstream — SITE 00 sprint)

```
DISCOVERED → REVIEWED → OWNER_CONFIRMED → IMPORT_APPROVED → IMPORTED
```

Mapping targets: Content Brain · marketing profile · objectives · channel intelligence · marketing manifest · campaign references.

---

## Reuse for Partner Agencies

Same methodology applies when exporting Studio World knowledge about partner/agency brands — always separate:

- **Brand intelligence** (portable)  
- **Production lineage** (Studio World retention)  
- **Governance/compute metadata** (never marketing canon)

See also: Partner/Agency onboarding sprint (`motherboard/MEMORY.md` 2026-08-20 entry).
