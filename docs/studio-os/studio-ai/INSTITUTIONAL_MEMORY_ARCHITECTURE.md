# Institutional Memory Architecture (Studio AI)

**Version:** 1.0.0  
**Status:** Architecture specification — no implementation  
**Related:** [AI Context Protocol IME module](../../ai-collaboration/protocol/INSTITUTIONAL_MEMORY_ENGINE.md)

---

## Purpose

Define institutional memory as Studio AI's **primary asset** — the capital that survives every model transition.

> Not prompts. Not conversations. Not chat logs.

---

## Memory hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  TIER 4 — Relationship Memory                            │
│  Founder trust patterns · collaboration history (structured)│
├─────────────────────────────────────────────────────────┤
│  TIER 3 — Cultural Memory                                │
│  Collaboration rituals · review style · anti-patterns     │
├─────────────────────────────────────────────────────────┤
│  TIER 2 — Reasoning Memory                               │
│  Decisions · alternatives · tradeoffs · lessons           │
├─────────────────────────────────────────────────────────┤
│  TIER 1 — Structural Memory                              │
│  Architecture · graph · canon · DNA · timeline            │
├─────────────────────────────────────────────────────────┤
│  TIER 0 — Situational Memory                             │
│  Handoff · blockers · sprint scope · open questions       │
└─────────────────────────────────────────────────────────┘
```

**Succession exports all tiers.** Session start loads Tier 0–2 minimum; full onboarding loads all.

---

## What is stored

| Domain | Examples | Store |
|--------|----------|-------|
| **Projects** | Studio OS, Frontal Slayer, Experience Lab state | Graph + handoff + timeline |
| **People** | Founder preferences, professor roles | Founder DNA + role registry |
| **Architecture** | Genesis, World Compiler, compile pipeline | Graph + decisions + bibles index |
| **Culture** | Forensic-first, one-deploy, place-driven | Collaboration memory + Project DNA |
| **Reasoning** | Why Layer 1 forensic before repair | decisions.json |
| **Decisions** | Diagnostic isolation, capsule v2, protocol v1 | decisions.json + changelog |
| **Lessons** | AUTH_REQUIRED root cause, normal-tab cache | timeline + handoff |
| **Relationships** | Founder ↔ Creative Director patterns | Structured session summaries |

---

## What is NOT stored (primary asset)

| Excluded | Reason |
|----------|--------|
| Raw chat transcripts (default) | Noise, PII risk, not portable |
| Prompt libraries as source of truth | Expendable interface; DNA + roles supersede |
| Model-specific tuning weights | Engine-local; not Studio AI |
| Credentials | Security invariant |
| Unbounded motherboard dump | Redaction + summarization |

Optional: summarized session outcomes (structured JSON) — never full verbatim logs in capsule.

---

## IME ↔ Studio AI boundary

| Component | Responsibility |
|-----------|----------------|
| **IME** | Generate, store, version, diff, health-check capsules |
| **Studio AI Memory Orchestrator** | Load slice for session; write-back structured outcomes |
| **AI Context Protocol** | Transfer format across engines and external hosts |
| **Knowledge Graph** | Live relationship truth (future sync from runtime) |

Studio AI **reads** IME; it does not duplicate long-term storage.

---

## Memory operations

### Load (session start)

```
bootstrap → health → knowledge-diff (if any) → DNA → collaboration →
handoff → graph neighborhood → decisions (relevant) → canon
```

Token budget manager truncates with priority: handoff > blockers > recent decisions > graph.

### Write-back (session end / milestone)

- New decision → `decisions.json` + changelog mirror  
- Blocker change → handoff update trigger  
- Timeline event → `timeline.json`  
- **Not:** automatic full chat export  

### Diff (incremental)

Knowledge diff engine — see [KNOWLEDGE_DIFF.md](../../ai-collaboration/protocol/KNOWLEDGE_DIFF.md).

### Verify (succession)

Compare candidate onboarding report to baseline; blocker and decision recall tests.

---

## Memory graph integration

Studio AI queries graph for context expansion:

- "What depends on World Compiler?"  
- "Show blocked systems"  
- "Path from Genesis to Experience Lab"  

Graph is **relationship memory** — complements file-based capsule sections.

Spec: [MEMORY_GRAPH.md](../../ai-collaboration/protocol/MEMORY_GRAPH.md)

---

## Dual path today (convergence target)

| Path | Audience | Memory store |
|------|----------|--------------|
| **motherboard/** | Cursor Composer | MEMORY.md, CORE, CODEBASE |
| **AI Context Capsule** | ChatGPT / external | `.studiocapsule` via IME |

**Convergence:** IME ingests bounded motherboard excerpts into capsule; native Studio AI uses IME as single source. Cursor becomes one REA host, not a separate memory silo.

---

## Succession memory guarantee

On successful succession:

- Zero required manual re-explanation from founder  
- All Tier 0–3 memory available to new engine  
- AI Passport lineage proves continuity  
- Rollback restores previous engine without memory corruption  

---

## Success metrics

| Metric | Target |
|--------|--------|
| Blocker recall post-succession | 100% |
| Decision rationale recall | ≥ 95% semantic match |
| Founder "starting over" feeling | Zero on successful ceremony |
| Chat log dependency | Eliminated for continuity |

---

*Architecture specification only*
