# Canon Preservation Policy

**Capsule:** Studio DNA Capsule 1.0.0 · **Section 21**  
**Status:** Permanent policy — how Studio OS canon evolves  
**Authority:** Founder approval or repeated operational adoption

---

## Purpose

Studio OS generates many ideas — vision bibles, sprint specs, brainstorms, and agent proposals. **Not every idea is canon.**

Without policy, future contributors confuse:

- exploration with commitment  
- implemented code with aspirational docs  
- founder taste with generic best practices  

This policy creates a **traceable history** of what is officially direction vs what is still open.

---

## Core rule

> **New ideas do not automatically become canon.**

A concept becomes **canonical** only when:

1. **Explicit founder approval** (“approved for implementation”, named page/section authorization, or registered approval in CANON_REGISTRY), **or**  
2. **Repeated adoption** into the documented operational model (e.g. used across multiple shipped modules, referenced in CORE/MEMORY as permanent, no longer contested)

Until then, treat concepts as **Concept** or **Planned** — not implementation mandates.

---

## Canon entry requirements

Each canonical concept **must** be recorded in `CANON_REGISTRY.md` with:

| Field | Description |
|-------|-------------|
| **Date introduced** | ISO date first documented |
| **Approval status** | Pending · Approved · Deprecated |
| **Source reference** | Conversation, sprint, doc path, commit SHA |
| **Current maturity** | Concept · Planned · In Progress · Implemented · Deprecated |
| **Related systems** | Code paths, routes, modules |
| **Dependencies** | Prerequisites, blocked-by, supersedes |

---

## Maturity definitions

| Maturity | Meaning |
|----------|---------|
| **Concept** | Vision, bible, or brainstorm — not approved for build |
| **Planned** | Approved direction; design/spec exists; code may not |
| **In Progress** | Active implementation on `master` or registered branch policy |
| **Implemented** | Shipped, tested, documented in operational handoff |
| **Deprecated** | Replaced; kept in registry for history only |

---

## What counts as canon layers

| Layer | Examples | Change process |
|-------|----------|----------------|
| **Constitutional** | Genesis, Foundation Sprint constitutions | Founder-only |
| **Design DNA** | This capsule’s philosophy files | Append + version DNA capsule |
| **Operational** | Context Capsule handoff, blockers | Update each sprint |
| **Protected UI** | Named admin pages (Frontal Slayer protocol) | Named page + sections only |
| **Registry entries** | CANON_REGISTRY rows | Approval + metadata |

---

## Agent obligations

1. Before implementing from a doc, check **maturity** in CANON_REGISTRY.  
2. Do not cite vision bibles as “the product works like this” unless **Implemented**.  
3. After founder approval, **add or update** registry entry in same task when possible.  
4. Label user-facing agent replies: **Documented** · **Inferred** · **Unknown**.  

---

## Deprecation

When canon is superseded:

- Set maturity to **Deprecated**  
- Point to replacement entry  
- Do not delete history — append deprecation note with date  

---

## Relationship to other governance

- **Frontal Slayer Admin Alignment Protocol** — canon for customer admin pages  
- **AI Context Protocol / Capsule** — operational truth, not philosophy alone  
- **Studio World Canon Hierarchy** — spatial/product canon in docs/studio-os/canon/  

This policy **does not replace** those — it unifies how entries earn status.

---

## Enforcement

- Code review / agent self-check: “Is this canon-approved scope?”  
- Onboarding: CANON_VERIFICATION section in Context Capsule ONBOARDING_REPORT  
- Quarterly hygiene: founder reviews CANON_REGISTRY for stale **Planned** items  

---

*Canon Preservation Policy is itself canonical as of Studio DNA Capsule 1.0.0 — 2026-07-11.*
