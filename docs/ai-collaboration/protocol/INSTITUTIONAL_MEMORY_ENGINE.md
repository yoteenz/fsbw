# Institutional Memory Engine™

**Protocol module:** Platform architecture  
**Role:** Long-term system that **generates**, **preserves**, and **evolves** AI Context Capsules  
**Status:** Architecture specification — no implementation in this sprint

---

## Purpose

The Institutional Memory Engine (IME) is Studio OS's defining innovation layer:

> Software preserves code. Studio OS preserves understanding.

IME ensures the project never loses memory when people — or AI systems — change.

---

## What IME preserves

| Domain | Mechanism |
|--------|-----------|
| **Knowledge** | Glossary, canon, bibles indexed in capsule |
| **Reasoning** | Decision memory, alternatives, tradeoffs |
| **Architecture** | Memory graph, timeline, Genesis links |
| **Vision** | Project DNA, Founder DNA, roadmap |
| **Culture** | Collaboration memory, review rituals |
| **Workflow** | Operating manual, prompt library, handoff |

---

## System architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Studio Headquarters                           │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────┐ │
│  │ Product      │    │ Institutional   │    │ Studio        │ │
│  │ Bibles       │───▶│ Memory Engine   │───▶│ Archive       │ │
│  │ docs/        │    │ (generators)    │    │ Export/Import │ │
│  └──────────────┘    └────────┬────────┘    └───────┬───────┘ │
│                               │                      │         │
│  ┌──────────────┐    ┌────────▼────────┐    ┌───────▼───────┐ │
│  │ motherboard  │───▶│ Capsule Builder │───▶│ .studiocapsule│ │
│  │ (Cursor)     │    │ + Health Check  │    │               │ │
│  └──────────────┘    └────────┬────────┘    └───────────────┘ │
│                               │                                │
│  ┌──────────────┐    ┌────────▼────────┐                       │
│  │ Git / CI     │───▶│ Knowledge Diff  │                       │
│  │ history      │    │ Engine          │                       │
│  └──────────────┘    └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    External AI (ChatGPT, Claude, …)
                    AI Passport + Onboarding Report
```

---

## IME subsystems

### 1. Ingestion collectors

| Collector | Source | Output module |
|-----------|--------|---------------|
| Handoff collector | `CURRENT_HANDOFF.md` | `CurrentSprint/handoff.md` |
| Changelog collector | `AI_CHANGELOG.md` | `History/decisions.json`, timeline |
| Glossary collector | `AI_GLOSSARY.md` | `Glossary/terms.json`, canon |
| Codebase collector | `motherboard/CODEBASE.md` | Graph code refs |
| Founder collector | `FOUNDER_PROFILE.md` | `Founder/dna.json` |
| DNA collector | `PROJECT_DNA.md` | `StudioOS/dna.json` |

### 2. Graph synthesizer

Builds `Graph/memory-graph.json` from bibles, glossary, changelog, and codebase paths.

### 3. Health analyzer

Produces `Manifest/health.json` — completeness, freshness, broken refs, confidence formula:

```
confidence = weighted_mean(completeness, freshness, consistency, coverage)
           - penalty(brokenReferences * 0.05)
           - penalty(glossaryGaps * 0.03)
           - penalty(missingSections * 0.10)
```

### 4. Bootstrap composer

Assembles `Manifest/bootstrap.json` from inventory + health + default readOrder.

### 5. Diff engine

Compares against `previousCapsuleReference` → `Manifest/knowledge-diff.json`.

### 6. Export orchestrator

- Validates manifest v3 schema  
- Computes checksums  
- Packages ZIP `.studiocapsule`  
- Optional executive summary PDF  

### 7. Import orchestrator (future)

- Verify checksums  
- Issue AI Passport  
- Trigger onboarding report schema  
- Log session to Archive  

---

## Triggers

| Trigger | Export type |
|---------|-------------|
| Founder: "Export AI Context Capsule" | full or smart selection |
| Sprint close | sprint |
| Milestone / release tag | milestone / release |
| CI release pipeline | release |
| Scheduled (weekly) | incremental |

---

## HQ integration path

```
Studio Headquarters
  └── Studio Archive
        └── Knowledge Management
              ├── View capsule health history
              ├── Export AI Context Capsule™
              ├── Import log (passports)
              └── Compare capsules (diff viewer)
```

**This sprint:** CLI + specs only. HQ UI on evolution roadmap.

---

## Relationship to motherboard

| System | Audience | Scope |
|--------|----------|-------|
| **motherboard/** | Cursor agents in-repo | Agent memory, codebase, chat summaries |
| **IME / Capsule** | External AI + portable handoff | Institutional memory transfer |

IME **reads** motherboard (bounded, redacted) — does not replace it.

---

## Redaction policy

- MEMORY.md: last N entries or summarized snapshot only  
- No secrets, env values, customer PII  
- Founder DNA: collaboration traits only  

---

## Success metrics

| Metric | Target |
|--------|--------|
| Capsule export time | < 30s for full export |
| Health confidence on release exports | ≥ 0.85 |
| Onboarding report generation | 100% of imports |
| Cross-platform understanding parity | Same blockers cited on ChatGPT and Claude |
| Incremental diff read reduction | ≥ 60% fewer tokens vs full re-read |

---

*Protocol module — specification only*
