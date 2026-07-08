# Approval Checkpoints™ — Story Table™ Benchmark

**Benchmark Module:** `studio.benchmark.story-table-hello-world.v1.approval`  
**Status:** Founder control gates per layer

---

## Approval Architecture

Story Table™ exercises [Founder Controls™](../engines/generation-pipeline/founder-controls.md) at three levels:

| Level | Gate | When |
|-------|------|------|
| **Production** | Approve Production™ | After Scene Blueprint + estimate |
| **Quality** | Per-layer pass | After Quality Inspector™ |
| **Final** | Workspace publish | After Scene Assembly™ |

---

## Gate 1 — Approve Production™

**Before Generation Queue™ unlock.**

```
Orb: "I can build Story Table™ mostly from what your studio already owns.
      Estimated $2.48 · 2m 12s · 8 assets reused · $4.86 saved."
         ↓
Founder: Approve | Reject
```

| Reject | Return to Missing Assets™ · revise scope |
| Approve | `estimateApproved: true` · queue unlock |

**Benchmark proof:** `FounderControlRecord.action: approve` at estimate stage.

---

## Gate 2 — Per-Layer Approval

After each generated/modified layer passes Quality Inspector™:

| Layer | Expected founder action |
|-------|------------------------|
| Environment Shell™ | Approve (reuse attach — instant) |
| Lighting™ | Approve |
| Architecture™ | Approve |
| Furniture™ | Approve (modify result) |
| Executive Strategy Table™ | Approve (generate result) |
| Floating Studio Orb™ | Reuse Existing (confirm attach) |
| Holographic Project Boards™ | Approve (modify result) |
| Material Samples™ | Approve |
| Atmosphere™ | Approve |
| Particles™ | Approve |
| Ambient Audio™ | Approve |
| Runtime FX™ | Approve (Cursor wiring) |

**Benchmark proof:** 12 `approvalDecision: approved` records.

---

## Gate 3 — Regenerate Proof (Lighting™)

Mandatory benchmark exercise:

```
Founder: Regenerate lighting — warmer editorial
         ↓
Partial estimate ($0.18 · 22s)
         ↓
Approve
         ↓
Regenerate lighting-story-table only
         ↓
Quality Inspector™ → Founder Approve
```

**Proof:** `FounderControlRecord.action: regenerate` on `lighting-story-table`

---

## Gate 4 — Workspace Publish Approval

After Scene Assembly™:

```
Orb: "Story Table™ assembly complete. Publish workspace?"
         ↓
Founder: Approve
         ↓
Workspace Published™
```

---

## Controls Exercised in Benchmark

| Control | Minimum exercises |
|---------|-------------------|
| Approve | ≥ 14 (estimate + 12 layers + publish) |
| Reuse Existing | ≥ 8 (default reuse path) |
| Regenerate | ≥ 1 (lighting partial) |
| Reject | 0 required (optional chaos test) |
| Create Variations | 0 required (future dept template) |

---

## Pipeline™ Workstation

Approvals occur at **Pipeline™** workspace scene — film production command wall.

Diegetic surfaces show layer status — not modal dialogs.

**v1 benchmark:** approval records required · diegetic UI implementation v1.1.

---

## Creative Approval Pipeline™ Integration

Existing [Creative Approval Pipeline™](../../alpha/studio-builder/) stages map:

| CAP Stage | Benchmark gate |
|-----------|----------------|
| Generate | Generation Queue™ complete |
| Braintrust | Quality Inspector™ (AI specialists) |
| Founder Review | Per-layer Approval™ |
| Approve | Unlock next layer / publish |

Benchmark may use simplified path — Braintrust optional for Hello World.

---

_Approval Checkpoints — informed consent at every layer._
