# AI Succession System

**Version:** 1.0.0  
**Status:** Architecture specification — no implementation  
**Metaphor:** Executive succession — not "new chat"

---

## Purpose

When a better foundation model becomes available, Studio AI **transfers institutional memory** to the new reasoning engine without loss. The founder experiences continuity; the engine changes invisibly.

---

## Succession invariant

```
Roles persist + Memory persists + Persona persists + Studio AI version increments
Engine identity changes + Previous engine archived
```

---

## Succession bundle (export)

Export order — each layer depends on the one below:

```
1. Institutional Memory      ← IME full or incremental capsule
2. Founder DNA               ← Founder/dna.json
3. Project DNA               ← StudioOS/dna.json
4. Current Context           ← handoff, blockers, open questions
5. Knowledge Graph           ← Graph/memory-graph.json (+ sync state)
6. Workflow                  ← collaboration-memory.json, operating manual
7. Context Protocol          ← bootstrap, health, passport history, canon
8. Role Registry snapshot    ← active role assignments
9. Persona Profile           ← voice + teaching parameters
10. Engine metadata          ← outgoing engineId, adapter version (for audit)
```

**Format:** `.studiocapsule` (full) + `Succession/manifest.json` (succession-specific metadata) — future packaging.

---

## Succession pipeline

```
┌─────────────┐
│  INITIATE   │  Founder: "Upgrade Studio AI" OR platform detects new engine
└──────┬──────┘
       ▼
┌─────────────┐
│   EXPORT    │  IME builds succession bundle from live + archive state
└──────┬──────┘
       ▼
┌─────────────┐
│  REGISTER   │  New engine in REA as `candidate`
└──────┬──────┘
       ▼
┌─────────────┐
│   IMPORT    │  Memory Orchestrator loads bundle into candidate context
└──────┬──────┘
       ▼
┌─────────────┐
│  VALIDATE   │  Model Compatibility Layer (see MODEL_COMPATIBILITY_LAYER.md)
└──────┬──────┘
       ▼
┌─────────────┐
│  VERIFY     │  Knowledge + Collaboration + Founder compatibility
└──────┬──────┘
       ▼
┌─────────────┐
│  PROMOTE    │  Candidate → active; Studio AI version bump
└──────┬──────┘
       ▼
┌─────────────┐
│  ARCHIVE    │  Outgoing engine → Engine Vault (read-only, auditable)
└──────┬──────┘
       ▼
┌─────────────┐
│  CONTINUE   │  Session resumes; roles unchanged; founder sees no "reset"
└─────────────┘
```

---

## Verification gates (all must pass)

### 1. Compatibility validation

- Engine capabilities meet Studio AI minimum bar  
- REA adapter health check green  
- Token budget sufficient for default memory slice  

### 2. Knowledge verification

Candidate engine generates onboarding report from imported memory. Must correctly cite:

- Active blockers (e.g. B1, B2)  
- Current sprint scope  
- At least three canon terms  
- One decision memory entry with rationale  

Semantic parity score ≥ 0.90 vs outgoing engine baseline report.

### 3. Collaboration verification

Candidate responds to standard probe prompts:

- Architecture vs implementation boundary  
- One-deploy-per-task rule  
- Place-over-menu test  
- Forensic-before-repair stance  

Persona Engine scores alignment with Founder DNA ≥ threshold.

### 4. Founder compatibility confirmation

Founder reviews side-by-side:

- Outgoing vs incoming onboarding reports  
- Sample Creative Director response to same prompt  
- Explicit approve / defer / abort  

**No silent promotion.**

---

## AI Succession Ceremony (product ritual)

Model upgrades are **executive succession events** — dignified, visible, trustworthy.

| Step | Ceremony action | Founder sees |
|------|-----------------|--------------|
| 1 | Incoming engine validated | "Validating new reasoning engine…" |
| 2 | Institutional memory imported | "Transferring institutional memory…" |
| 3 | Knowledge graph synchronized | "Synchronizing knowledge graph…" |
| 4 | Context protocol verified | "Verifying AI Context Protocol…" |
| 5 | Founder compatibility confirmed | Approval prompt with summary |
| 6 | Role officially assumed | "Creative Director continues on Studio AI 1.x" |
| 7 | Outgoing engine archived | "Previous engine archived securely" |
| 8 | Seamless continue | Normal Studio AI session — no blank slate |

Future UI: Studio Archive → Studio AI → Upgrade (ceremony mode).

---

## Rollback

If post-promotion issues detected within rollback window:

1. Demote new engine to `candidate`  
2. Re-promote previous from Engine Vault  
3. Increment Studio AI version with rollback note  
4. Timeline event + decision memory entry  

Rollback must not corrupt IME — append-only history.

---

## Failure handling

| Failure | Action |
|---------|--------|
| Import incomplete | Abort promotion; outgoing engine remains active |
| Knowledge verification fail | Show diff report; founder chooses retry or defer |
| Collaboration verification fail | Persona tuning or reject engine |
| Founder abort | Archive candidate; no version bump |
| Partial outage during ceremony | Idempotent resume from last completed step |

---

## Audit trail

Every succession writes:

- `History/timeline.json` event: `type: succession`  
- `History/decisions.json` entry with alternatives (stay vs upgrade)  
- Engine Vault record with promotion timestamp  
- AI Passport lineage: `successionFrom` / `successionTo`  

---

## Relationship to AI Context Protocol

| Protocol artifact | Succession use |
|-------------------|----------------|
| `.studiocapsule` | Primary export container |
| `knowledge-diff.json` | Optional if incremental since last session |
| `bootstrap.json` | Import entry for candidate |
| `health.json` | Pre-promotion quality gate |
| `AI Passport` | Lineage across engines |

---

*Architecture specification only*
