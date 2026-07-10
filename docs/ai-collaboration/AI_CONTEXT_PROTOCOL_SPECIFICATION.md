# AI Context Protocol™ — Canonical Specification

**Version:** 1.0.0  
**Status:** Architecture specification — **no implementation in this sprint**  
**Authority:** Canonical standard for onboarding any AI into Studio OS  
**Implementation:** [AI Context Capsule™](../AI_CONTEXT_CAPSULE_SPECIFICATION.md) (`.studiocapsule`)

---

## 0. North star

> **Software preserves code. Studio OS preserves understanding.**

Git clones repositories. **AI Context Protocol clones organizational understanding.**

The receiving AI should behave as though it has participated in the project for months — knowing not only *what* exists, but *why*, *how decisions were made*, and *how collaboration works*.

---

## 1. Official names

| Name | Role |
|------|------|
| **AI Context Protocol™** | Universal onboarding standard (this document) |
| **AI Context Capsule™** | Portable single-file implementation (`.studiocapsule`) |
| **Institutional Memory Engine™** | Long-term platform system that generates and preserves capsules |
| **AI Passport™** | Import receipt + accountability record per AI session |
| **Studio AI™** | Persistent intelligence layer — identity, roles, persona ([spec](../studio-os/studio-ai/)) |

**Analogy:**

| Git | AI Context Protocol |
|-----|---------------------|
| `git clone` | Capsule import |
| `.git/` | `.studiocapsule` internal graph + history |
| `commit` | Decision memory entry |
| `git diff` | Knowledge diff |
| `README` | Self-describing bootstrap |

---

## 2. Protocol layers

```
┌─────────────────────────────────────────────────────────────┐
│  L4 — AI Passport™          accountability per import       │
├─────────────────────────────────────────────────────────────┤
│  L3 — Onboarding Report     AI self-assessment post-read    │
├─────────────────────────────────────────────────────────────┤
│  L2 — Institutional Memory  graph · decisions · timeline    │
├─────────────────────────────────────────────────────────────┤
│  L1 — Canon Engine          terminology · rules · violations│
├─────────────────────────────────────────────────────────────┤
│  L0 — Capsule Bootstrap     self-describing entry point     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Module specifications

Full module index: [`protocol/README.md`](./protocol/README.md)

| Deliverable | Spec |
|-------------|------|
| Capsule bootstrap system | [CAPSULE_BOOTSTRAP.md](./protocol/CAPSULE_BOOTSTRAP.md) |
| Capsule health | [CAPSULE_HEALTH.md](./protocol/CAPSULE_HEALTH.md) |
| Project memory graph | [MEMORY_GRAPH.md](./protocol/MEMORY_GRAPH.md) |
| Decision memory | [DECISION_MEMORY.md](./protocol/DECISION_MEMORY.md) |
| Collaboration memory | [COLLABORATION_MEMORY.md](./protocol/COLLABORATION_MEMORY.md) |
| Founder DNA model | [FOUNDER_DNA_MODEL.md](./protocol/FOUNDER_DNA_MODEL.md) |
| Project DNA model | [PROJECT_DNA_MODEL.md](./protocol/PROJECT_DNA_MODEL.md) |
| Canon engine | [CANON_ENGINE.md](./protocol/CANON_ENGINE.md) |
| Memory timeline | [MEMORY_TIMELINE.md](./protocol/MEMORY_TIMELINE.md) |
| AI onboarding report | [ONBOARDING_REPORT.md](./protocol/ONBOARDING_REPORT.md) |
| Knowledge diff engine | [KNOWLEDGE_DIFF.md](./protocol/KNOWLEDGE_DIFF.md) |
| AI Passport | [AI_PASSPORT.md](./protocol/AI_PASSPORT.md) |
| Institutional Memory Engine | [INSTITUTIONAL_MEMORY_ENGINE.md](./protocol/INSTITUTIONAL_MEMORY_ENGINE.md) |
| Compatibility matrix | [COMPATIBILITY_MATRIX.md](./protocol/COMPATIBILITY_MATRIX.md) |
| Evolution roadmap | [EVOLUTION_ROADMAP.md](./protocol/EVOLUTION_ROADMAP.md) |

---

## 4. Capsule integration (v3 target)

AI Context Capsule manifest advances to **manifestVersion: 3** when protocol modules ship.

New internal paths (additive to v2):

```
.studiocapsule
├── Manifest/
│   ├── bootstrap.json          ← L0: read FIRST
│   ├── health.json             ← founder-facing quality
│   ├── knowledge-diff.json     ← vs previous capsule
│   └── passport.schema.json    ← import output template
├── Graph/
│   └── memory-graph.json       ← L2: relationships
├── Canon/
│   └── canon.json              ← L1: rules + terms
├── Founder/
│   └── dna.json                ← expanded Founder DNA
├── StudioOS/
│   └── dna.json                ← structured Project DNA
├── History/
│   ├── decisions.json          ← decision memory
│   └── timeline.json           ← replayable milestones
└── Workflow/
    └── collaboration-memory.json
```

Schema: [`schemas/manifest.v3.schema.json`](./schemas/manifest.v3.schema.json)

---

## 5. Import lifecycle (canonical)

```
1. RECEIVE     Upload .studiocapsule (or incremental overlay)
2. BOOTSTRAP   Read Manifest/bootstrap.json — never wonder where to begin
3. VALIDATE    Verify checksums + health.json thresholds
4. PASSPORT    Issue AI Passport™ (context version, import timestamp)
5. INGEST      Follow bootstrap.readOrder + graph preload
6. REPORT      AI generates Onboarding Report (mandatory before contributions)
7. DIFF        If incremental: apply knowledge-diff.json
8. COLLABORATE Founder task with institutional memory active
9. RECORD      Optional: export updated passport + onboarding report back to Archive
```

---

## 6. Multi-AI handoff

One capsule → identical institutional memory for:

ChatGPT · Claude · Gemini · Cursor · Studio AI · future LLMs

**Rule:** Protocol data is platform-neutral JSON + Markdown. No vendor-specific required fields.

See [COMPATIBILITY_MATRIX.md](./protocol/COMPATIBILITY_MATRIX.md).

---

## 7. Relationship to existing docs

| Layer | Location |
|-------|----------|
| **Protocol (this)** | `docs/ai-collaboration/protocol/` |
| **Capsule packaging** | `AI_CONTEXT_CAPSULE_SPECIFICATION.md` |
| **Human collaboration docs** | `CHATGPT_OPERATING_MANUAL.md`, etc. |
| **Cursor agent memory** | `motherboard/` |
| **Product canon** | `docs/studio-os/`, `docs/studio-world/` |

Protocol **does not replace** product bibles — it **indexes, relates, and transfers** understanding of them.

---

## 8. Security invariant

Protocol transfers **collaboration and institutional memory only**.

Never: credentials, PII, customer data, full unbounded MEMORY dumps.

Founder DNA: professional collaboration traits only.

---

## 9. Success criteria

Protocol succeeds when:

- Receiving AI reads bootstrap and knows exact read order without human instruction
- Health report gives founder confidence before upload
- Onboarding report surfaces inconsistencies before code/docs changes
- Knowledge diff answers "what changed since last capsule?"
- Decision memory explains *why* — not just *what*
- Memory graph enables "show everything connected to Experience Lab"
- Same capsule produces equivalent understanding on ChatGPT and Claude

---

## 10. Implementation status

| Component | Spec | Code |
|-----------|------|------|
| AI Context Protocol v1 | ✅ This sprint | ❌ |
| Capsule v2 (ZIP layout) | ✅ Prior sprint | CLI partial |
| Capsule v3 (protocol modules) | ✅ This sprint | ❌ |
| Institutional Memory Engine | ✅ Architecture | ❌ |
| HQ Archive export | Roadmap | ❌ |

---

*End of AI Context Protocol™ Canonical Specification v1.0.0*
