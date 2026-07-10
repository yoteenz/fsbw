# Long-Term Evolution Roadmap

**Protocol module:** Process document  
**Parent:** [AI_CONTEXT_PROTOCOL_SPECIFICATION.md](../AI_CONTEXT_PROTOCOL_SPECIFICATION.md)  
**Status:** Planning — no dates; technical phases only

---

## North star (unchanging)

> Software preserves code. Studio OS preserves understanding.

Every phase moves institutional memory from **manual** → **generated** → **living** → **self-healing**.

---

## Phase 0 — Foundation (complete)

**Deliverables:**

- `docs/ai-collaboration/` collaboration layer  
- ChatGPT Operating Manual, handoff, changelog, glossary  
- v1 flat CLI export (`npm run export:ai-context-capsule`)  
- AI Context Capsule v2 ZIP specification + manifest v2 schema  
- Layer 1 forensic + diagnostic route isolation (production blockers documented)

**Gap:** Capsule v2 not fully implemented in CLI; HQ export UI absent.

---

## Phase 1 — Protocol specification (this sprint)

**Deliverables:**

- AI Context Protocol™ v1.0 canonical specification  
- All protocol module docs (`protocol/`)  
- manifest v3 schema (protocol fields)  
- Founder DNA + Project DNA structured models  
- Capsule bootstrap, health, graph, diff, passport specs  

**Exit criteria:**

- Founder can hand spec to any engineer or AI for implementation  
- No open module placeholders in protocol index  
- Capsule v2 spec updated to reference v3 target layout  

**No code** in this phase — specification only per sprint mandate.

---

## Phase 2 — Capsule builder v3 (CLI + CI)

**Scope:**

- Extend `scripts/export-ai-context-capsule.mjs` to emit `.studiocapsule` ZIP  
- Generate all manifest v3 modules from repo sources  
- Implement health analyzer (completeness, freshness, broken refs)  
- Implement knowledge diff vs last export artifact  
- Validate against `manifest.v3.schema.json`  

**Dependencies:** Phase 1 specs frozen.

**Risks:** MEMORY redaction bounds; graph synthesis quality from incomplete bibles.

---

## Phase 3 — HQ Archive integration

**Scope:**

- Studio Archive → Knowledge Management → Export AI Context Capsule™  
- Export preview with health traffic light  
- Import log storing AI Passports  
- Capsule history + diff viewer for founder  

**Dependencies:** Phase 2 CLI proven stable.

**UI constraint:** Follow Studio World geography — export lives in Archive district.

---

## Phase 4 — Native import (Studio AI + Cursor)

**Scope:**

- Automatic bootstrap read on capsule attach  
- Onboarding report generation without manual prompt  
- AI Passport issuance and session linkage  
- Cursor: optional capsule sync alongside motherboard  

**Dependencies:** Phase 3 Archive storage for passport audit.

---

## Phase 5 — Living memory graph

**Scope:**

- Sync memory graph from World Compiler / Knowledge Graph runtime  
- Real-time blocker nodes (`blocked-by` edges)  
- Canon engine lint pre-commit hook (advisory)  
- Decision memory auto-seeded from AI_CHANGELOG on export  

**Dependencies:** Experience Lab compile path unblocked (B1).

---

## Phase 6 — Self-healing institutional memory

**Scope:**

- Detect outdated sections automatically (health → PR suggestions)  
- Onboarding report inconsistencies → founder notification  
- Cross-capsule regression tests (semantic parity across platforms)  
- Incremental import as default; full export on milestone only  

**Dependencies:** Phases 4–5 operational.

---

## Phase 7 — Institutional Memory Engine as platform product

**Scope:**

- Multi-tenant capsule export per organization in Studio OS  
- Encrypted capsule option for enterprise  
- API: `POST /archive/export-capsule`, `GET /archive/passports`  
- Third-party LLM plugin: "Import Studio Capsule"  

**Vision:** IME becomes sellable platform capability — not only Frontal Slayer internal tooling.

---

## Explicit non-goals (until Phase 7)

- Storing full chat transcripts in capsule  
- Replacing Git or product bibles  
- Automatic code generation from capsule alone  
- Implementing Experience Lab repair under protocol sprints  

---

## Decision gates between phases

| Gate | Requirement |
|------|-------------|
| Phase 1 → 2 | Founder approves spec; manifest v3 schema validated |
| Phase 2 → 3 | CLI export confidence ≥ 0.85 on dogfood capsule |
| Phase 3 → 4 | B2 verified; Archive export used in 3+ real sessions |
| Phase 4 → 5 | B1 resolved; graph sync design approved |
| Phase 5 → 6 | 10+ incremental diffs without canon regression |
| Phase 6 → 7 | Multi-org Studio OS deployment architecture defined |

---

## Maintenance ownership

| Artifact | Owner | Refresh trigger |
|----------|-------|-----------------|
| Protocol spec | Founder + architect agent | Breaking protocol change |
| Module docs | Same as protocol | New module or field |
| Compatibility matrix | QA + founder | New platform tested |
| Evolution roadmap | Founder | Phase completion or reprioritization |

---

*Protocol module — specification only*
