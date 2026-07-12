# Onboarding Guide — Unified Studio OS Pack

**Purpose:** How to complete onboarding once — across all included capsules.

---
**Last Updated:** 2026-07-12  
**Authority:** Subordinate only to `START_HERE.md` and `MASTER_MANIFEST.md` when inside the Unified Onboarding Pack.

---

## One process, one report

- Read every file in **MASTER_MANIFEST.md** order — completely, not skimmed.
- Do **not** stop after listing archive contents.
- Do **not** produce intermediate summaries between phases.
- Use **ONBOARDING_REPORT_TEMPLATE.md** as the **required structure** for your **single final report**.
- **Populate every section in your own words** based on what you read.
- **Do not** copy blank instructional text or placeholders as your answers.
- **Do not** reproduce long sample blocks verbatim.
- Generate **one** onboarding report for the entire pack — not one per capsule.
- **Stop** after the report. Wait for founder approval. Do not implement, propose sprints, or solve blockers.

---

## Classifying statements

| Label | Meaning |
|-------|---------|
| **Documented** | Explicitly stated in a cited capsule file |
| **Inferred** | Reasonable deduction — mark clearly as inference |
| **Unknown** | Write: *"This information is not documented within the current onboarding pack."* |

Never present inference or training-data guesses as documented fact.

---

## Implementation state

| State | How to describe |
|-------|-----------------|
| **Implemented** | Cite `CURRENT_HANDOFF.md`, codebase paths, or explicit shipped notes |
| **In progress** | Cite handoff + blockers with status |
| **Planned** | Cite `ROADMAP.md`, `OPEN_QUESTIONS.md`, or FIC future sections |
| **Conceptual** | Vision / FIC future ideas — **not shipped** |

Do not invent implementation status for conceptual systems (Civilization layer, full marketplace rollout, etc.).

---

## Operational source-of-truth hierarchy

Use this map in your report (do **not** treat the ZIP as one undifferentiated blob):

| Topic | Authoritative file (path in pack) |
|-------|----------------------------------|
| Current implementation status | `AI_Context_Capsule/CURRENT_HANDOFF.md` |
| Active blockers & gates | `AI_Context_Capsule/KNOWN_BLOCKERS.md` |
| Technical / project canon summary | `AI_Context_Capsule/PROJECT_DNA.md` |
| AI collaboration & repo context | `AI_Context_Capsule/AI_CONTEXT.md` |
| Founder operating preferences (collaboration) | `AI_Context_Capsule/FOUNDER_PROFILE.md` |
| Long-term Studio World vision | `Founder_Intelligence_Capsule/STUDIO_WORLD.md` |
| Marketplace & expert economy | `Founder_Intelligence_Capsule/MARKETPLACE.md` |
| Revenue & monetization | `Founder_Intelligence_Capsule/REVENUE_MODEL.md`, `MONETIZATION.md` |
| Studio Workers / Studio Team / HR | `Founder_Intelligence_Capsule/STUDIO_WORKERS.md` |
| Knowledge capture & vault | `Founder_Intelligence_Capsule/KNOWLEDGE_CAPTURE.md` |
| Expert interviews & invites | `Founder_Intelligence_Capsule/INTERVIEW_ENGINE.md` |
| Expert trust & authorization | `Founder_Intelligence_Capsule/EXPERT_TRUST_AND_GOVERNANCE.md` |
| Future sequencing | `AI_Context_Capsule/ROADMAP.md` |
| Unresolved decisions | `AI_Context_Capsule/OPEN_QUESTIONS.md` |
| Design judgment & canon policy | `Studio_DNA_Capsule/` *(if included)* |
| Founder strategy & vision | `Founder_Intelligence_Capsule/VISION.md` |

When sources conflict: **Context** wins for *what is built today*; **Founder Intelligence** wins for *why & strategy*; **Studio DNA** wins for *design judgment* (when included).

---

## Live Repository Cross-Context After Onboarding

The Unified Pack provides portable architecture, founder, canon, and collaboration context. It is **not** a permanent replacement for live repository operational state.

**After onboarding approval**, an AI with repository access should consult:

| Source | Role |
|--------|------|
| `AI_Context_Capsule/CURRENT_HANDOFF.md` | Current sprint and implementation status |
| `AI_Context_Capsule/KNOWN_BLOCKERS.md` | Active gates |
| `motherboard/CORE.md` | Persistent implementation rules (repo root — not inside ZIP) |
| `motherboard/CODEBASE.md` | Live codebase map (repo root) |
| `motherboard/MEMORY.md` | Append-only history — latest applicable entries only |
| Founder's latest verified production evidence | Black Box exports, device tests |

**Binding hierarchy:** Newer operational evidence overrides older package or MEMORY content. Vision and conceptual documents are not automatically production.

| Agent layer | System |
|-------------|--------|
| Cursor | Motherboard (implementation memory) |
| External AI | Unified Onboarding Pack (deterministic onboarding) |

Cross-context synchronization is required when either system changes materially. Motherboard files are **not** in the 93-file required reading order — use this section and `AI_Context_Capsule/AI_CONTEXT.md` § Motherboard as the bridge.

---

## Optional capsules

If **Studio_DNA_Capsule/** is absent, continue onboarding with included capsules only. Its absence is **not** a failure unless `MASTER_MANIFEST.md` lists DNA files as required (they will be omitted when DNA is not packaged).

---

## Approval boundary

Your final report must explicitly confirm:

- No implementation was performed  
- No Composer sprint was generated  
- No architecture change was proposed  
- No blockers were solved  
- You are **waiting for founder approval**
