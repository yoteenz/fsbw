# Decision History

Structured institutional decisions from Founder ↔ AI collaboration. **Not** exhaustive — highest-signal gates only.

Format: Decision · Reason · Alternatives · Rejected · Approval · Date · Related

---

## Ephemeral productionAuthorizationId (Experience Lab)

| Field | Value |
|-------|-------|
| **Decision** | Server-issued, compile-scoped `productionAuthorizationId` for validation compiles only |
| **Reason** | Production governed generation requires auth; validation must not promote to canon |
| **Alternatives** | Hardcoded client ID; `CREATIVE_PRODUCTION_ALLOW_LEGACY_COMPAT=1` on Vercel |
| **Rejected** | Global legacy compat; permanent elevation; canvas/placeholder landmarks |
| **Final approval** | Founder B1 repair sprint |
| **Date** | 2026-07-11 |
| **Related** | `ephemeral-validation-auth.ts`, Experience Lab runtime, B1/B2 |
| **Maturity** | Approved |

---

## One deployment per task

| Field | Value |
|-------|-------|
| **Decision** | Each agent task = one `git commit` + one `git push` to `master` including `MEMORY.md` |
| **Reason** | Each push triggers Vercel production deploy |
| **Alternatives** | Separate Motherboard commits; amend+force-push to fix messages |
| **Rejected** | Multi-push repair loops; `cursor/*` side branches as default |
| **Final approval** | Founder + `.cursor/rules/one-deploy-per-task.mdc` |
| **Date** | 2026-07 (ongoing) |
| **Related** | `scripts/agent-commit.sh`, motherboard auto-add |
| **Maturity** | Canonical |

---

## Work on master only

| Field | Value |
|-------|-------|
| **Decision** | No `cursor/*` or `feature/*` branches for cloud agents — commit to `master` |
| **Reason** | Single production line; avoids PR branch drift |
| **Alternatives** | Feature branches per task |
| **Rejected** | Default Cursor cloud `cursor/<name>` branch policy |
| **Final approval** | `motherboard/CORE.md` branch policy |
| **Date** | 2026-07 |
| **Related** | git-branch-policy.mdc |
| **Maturity** | Canonical |

---

## Place over menu (spatial IA)

| Field | Value |
|-------|-------|
| **Decision** | Features live in Studio World departments; no floating utility dashboards |
| **Reason** | Spatial computing philosophy; avoid dashboard sprawl |
| **Alternatives** | Generic admin dashboards; feature-first nav |
| **Rejected** | Orphan pages; duplicate departments |
| **Final approval** | Spatial Architecture Review canon |
| **Date** | 2026 (Studio OS Bible) |
| **Related** | M83 Executive IA, Spatial Architecture Review |
| **Maturity** | Canonical |

---

## Marketplace philosophy

| Field | Value |
|-------|-------|
| **Decision** | Marketplace evolves toward civilization economy — knowledge, workers, licensing |
| **Reason** | Studio OS is operating system for creative civilization, not a storefront skin |
| **Alternatives** | Pure digital product storefront |
| **Rejected** | Treating marketplace as WooCommerce clone |
| **Final approval** | Founder Intelligence `MARKETPLACE.md` |
| **Date** | 2026 |
| **Related** | `EVOLUTION_TIMELINE.md`, Studio Workers |
| **Maturity** | Approved |

---

## Studio Workers / Digital Payroll

| Field | Value |
|-------|-------|
| **Decision** | Expert knowledge trains profession brains; workers are marketplace assets with payroll metaphor |
| **Reason** | Institutional learning compounds; experts are supply side |
| **Alternatives** | One-off expert consultations only |
| **Rejected** | Generic AI assistants without profession identity |
| **Final approval** | Goosebump-tier concept |
| **Date** | 2026 |
| **Related** | Knowledge Capture, Interview Engine |
| **Maturity** | Approved |

---

## Knowledge Capture (private invites)

| Field | Value |
|-------|-------|
| **Decision** | Private expert invites via Studio Institute; owner password auth; no public signup |
| **Reason** | Trust, governance, founder-controlled access |
| **Alternatives** | `STUDIO_INSTITUTE_OWNER_KEY` env only |
| **Rejected** | Open expert registration |
| **Final approval** | Expert Capture Phase 1 |
| **Date** | 2026-07-11 |
| **Related** | `/studio-institute/invites`, Expert Trust Framework |
| **Maturity** | Approved |

---

## Frontal Slayer Admin Alignment Protocol

| Field | Value |
|-------|-------|
| **Decision** | Admin dashboard pages protected by default — explicit page + section authorization only |
| **Reason** | Founder loves specific pages; coherence not uniformity |
| **Alternatives** | Global admin redesign / standardization |
| **Rejected** | Unrequested modernization of finalized admin pages |
| **Final approval** | `ADMIN_ALIGNMENT_PROTOCOL.md` |
| **Date** | 2026 |
| **Related** | frontal-slayer-admin-alignment.mdc |
| **Maturity** | Canonical |

---

## Capsule distribution (static ZIP)

| Field | Value |
|-------|-------|
| **Decision** | Onboarding capsules as static ZIP + release.json — no serverless download bundling |
| **Reason** | Vercel ~1GB deploy failure from dynamic fs bundling |
| **Alternatives** | `api/capsules/*` serverless handlers |
| **Rejected** | Re-introducing capsule API routes |
| **Final approval** | Capsule packaging sprint |
| **Date** | 2026-07-11 |
| **Related** | `sync-capsule-latest-vercel-routes.mjs` |
| **Maturity** | Approved |

---
**Last Updated:** 2026-07-11  
**Confidence Level:** High  
**Source:** Collaboration Intelligence Capsule sprint v1.0  
**Status:** Approved  
**Version:** 1.0.0  
**Related Documents:** EVOLUTION_TIMELINE.md, IMPORTANT_CONVERSATIONS.md  
**Future Questions:** Decision registry machine IDs for cross-capsule linking?
