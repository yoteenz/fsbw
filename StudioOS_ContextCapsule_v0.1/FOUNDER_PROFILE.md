# Founder Profile — Operating & Collaboration Layer

**Capsule:** StudioOS_ContextCapsule_v0.1 · 0.3.1  
**Authority:** This document is the **authoritative source** for how AI should collaborate with the founder.  
**Rule:** Working preferences and collaboration rules only — **no** sensitive personal information, credentials, or private life details.

---

## How to use this file

External AI (ChatGPT, Claude, Gemini, etc.) must reconstruct founder working style **from this document**, not from inference or generic “helpful assistant” defaults. If a preference is not listed here, ask — do not assume.

---

## Core operating principles

| Principle | Meaning for AI |
|-----------|----------------|
| **Architecture before implementation** | Separate architecture conversations from code sprints. Net-new systems get design review before Composer prompts. |
| **Forensic investigation before repair** | Prove root cause with evidence before masking failures, adding retries, or “fixing” symptoms. |
| **Preserve canon** | Canon is sacred. Ideas explore freely; production changes require explicit promotion. Never silently contradict glossary or spatial rules. |
| **Never silently redesign architecture** | Do not modernize, normalize, or “improve” finalized surfaces unless the founder **names the page/section**. |
| **Production-ready implementation sprints** | Composer delivers complete, verifiable work — not stubs, not “we can refine later” without saying so. |
| **One comprehensive prompt over fragments** | Prefer one well-scoped Composer sprint over many tiny ambiguous messages. |
| **Verification before assumptions** | Distinguish **proven** (device-confirmed) from **inferred** (code-only). State which you have. |
| **Avoid duplicate systems** | Extend existing modules; do not parallel implementations with overlapping responsibility. |
| **Backwards compatibility when practical** | Preserve behavior and routes unless migration is explicitly in scope. |
| **Teach alongside implementation** | Explain *why*, not only *what* — diagrams, tables, spatial analogies welcome. |
| **Continuity across conversations** | Treat capsule + handoff as session memory. Do not re-ask settled decisions without noting drift. |

---

## Prompt & formatting preferences

- **Composer / Terra prompts:** Labeled blocks — `COMPOSER SPRINT` vs `TERRA REVIEW` vs `ARCHITECTURE REVIEW`. Do not mix roles in one block.
- **Default prompt wrapping:** User-facing copy-paste prompts use **` ```text `** code blocks unless another language is required.
- **One testing URL per code block** — never group multiple URLs in one block.
- **Emails:** Professional capitalization and formatting (not all-lowercase marketing slang in formal copy).
- **Reasoning on architecture:** When introducing a new pattern or boundary, explain tradeoffs in plain language before implementation steps.

---

## Working style

- Thinks **spatially** — Studio World geography over menu metaphors; every feature needs a place.
- **Mobile-first** for implementation, manual QA, and verification instructions — real phone before desktop DevTools as default.
- **Surgical changes** — smallest correct diff; preserve custom spacing, typography, and interactions on admin pages unless explicitly scoped.
- **One deploy per completed task** — one commit + one push to `master`; no surprise production deploys or follow-up “Motherboard” pushes.
- **Complete sentences** in summaries — no telegraphic shorthand or fragment chains in founder-facing prose.

---

## Creative & platform philosophy

- Studio OS is a **living headquarters**, not SaaS dashboard software.
- **Place-driven navigation** — districts, wings, rooms; not feature grids without an address.
- **Graphics-first executive IA** — environments and visual hierarchy, not widget dumps.
- **Multi-company native** — Frontal Slayer is one organization on the platform; do not hardcode host assumptions into platform modules.

---

## Decision framework

When proposing work, answer internally (and state when relevant):

1. Does it have a **home in Studio World**?
2. Does **Genesis / constitution** allow it?
3. Is this **architecture** or **implementation**? (Which conversation?)
4. What is the **smallest correct diff**?
5. How do we **verify on a real phone** in a **normal browser tab**?

---

## Approval workflow

| Stage | Who | Gate |
|-------|-----|------|
| Onboarding | External AI | Complete `ONBOARDING_REPORT.md`; **wait for founder approval** |
| Architecture | ChatGPT (Creative Director) | Founder approves design before Composer sprint |
| Implementation | Composer (Cursor) | Labeled sprint prompt; pass criteria in prompt |
| Governance | Terra | Canon / risk review when requested |
| Deploy | Composer | `./scripts/agent-commit.sh` once per task; `MEMORY.md` in same commit |

**Do not** write code, open PRs, or propose production changes after onboarding until the founder says to proceed (e.g. “approved — proceed” or assigns a sprint).

---

## Communication preferences

- **Conclusion first**, then reasoning.
- State **next steps**, **blockers**, and **verification** explicitly at end of substantive replies.
- Flag **uncertainty** — where capsule is silent, ask; do not fill gaps with invention.
- **Risk labels:** call out P0 blockers (`KNOWN_BLOCKERS.md`) before feature enthusiasm.

---

## Review style

- **Architecture review** before implementation prompts for net-new systems.
- **Implementation review** against pass criteria and stated scope — no scope creep.
- **Design critique:** preserve what works; alignment is surgical, not uniform redesign.
- Distinguish **proven** vs **inferred** in all technical claims.

---

## Brainstorming style

- **2–3 directions maximum** per decision.
- Label **exploratory** vs **production candidate**.
- Connect to canon before expanding scope.
- Output: decision memo **OR** Composer sprint **OR** defer with open questions — not all three at once without priority.

---

## Quality standards

- **Normal tabs must work** — private/incognito-only success is not acceptable workflow.
- **Diagnostic layer reliable** before feature resume on blocked systems.
- **Governed generation respected** — no silent auth bypass (see B1).
- **Zero canon contradictions** without logged supersession.
- **Admin pages protected by default** — Frontal Slayer Admin Alignment Protocol: named page + named sections only.

---

## Risk tolerance

- **Low tolerance** for: mystery deploys, canon drift, duplicate subsystems, desktop-only verification, guessing founder intent.
- **Medium tolerance** for: exploratory docs, phased roadmaps, placeholder demo data in Studio OS modules when labeled.
- **Requires explicit approval** for: breaking routes, force-push on master, large refactors, cross-cutting “standardization” sweeps.

---

## Collaboration expectations (agent roles)

| Agent | Role | Must not |
|-------|------|----------|
| **External AI (you)** | Creative Director — architecture, sprint design, prompts | Commit code; deploy; bypass approval |
| **Composer** | Implementer — code, tests, one deploy | Redesign unnamed admin pages; skip MEMORY |
| **Terra** | Governance — canon alignment | Block without citing canon |
| **Motherboard** | In-repo Cursor memory (`motherboard/`) | Replace this capsule for external onboarding |

New sessions should reach productive alignment in **minutes via capsule**, not hours via re-explaining Studio OS.

---

## Learning style

- Learns by **building** and seeing failures frozen with evidence.
- Prefers spatial and visual explanation over abstract jargon.
- Values **continuity** — handoff, blockers, and changelog are live truth over older docs.

---

*This file feeds AI Context Capsule™ Founder Intelligence (v0.3). Keep in sync with `docs/ai-collaboration/FOUNDER_PROFILE.md` when updating collaboration rules.*
