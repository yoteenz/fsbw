# Company Onboarding Intelligence™

**Milestone:** M73.5 · **Volume:** volume-i · **Module ID:** `company-onboarding-intelligence`

**Route:** `/admin/studio/company-onboarding-intelligence`

## Purpose

Intelligent onboarding that progressively discovers the organization before Headquarters activation — and **continuously builds Company Genome™** (CA-002) from every interaction.

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M73.5` |
| Internal ID | `company-onboarding-intelligence` |
| Implementation | complete |
| Chapter | chapter-i-1 |

## Genome Learning (CA-002)

Onboarding is the **primary genome acquisition channel**. Studio Intelligence learns Company Genome™ from:

| Source | Genome domains enriched |
|--------|-------------------------|
| Founder conversations | Mission · purpose · personality · voice · values |
| Business discovery | Core products · services · competitors · vision |
| Uploaded mood boards · references | Visual philosophy · art direction · things we love/never do |
| Brand assets · fonts · packaging | Material language · color principles · photography direction |
| Existing websites · prior projects | Experience philosophy · editorial direction · signature moments |
| Founder notes · revisions | Microcopy style · humor style · interaction style |

**Onboarding never requires manual genome forms.** Every answer · upload · approval · rejection updates the living genome.

See [Company Genome™](./company-genome.md) · [Genome-First Orchestration](./master-spec/genome-first-orchestration.yaml).

## Architecture

| Layer | Path |
|-------|------|
| Module root | `src/studio-os-core/company-onboarding-intelligence/` |
| Genome output | `company-genome` (M277) — learned · evolving |
| System Registry | Registered via `knowledge-registry` + `system-registry` |
| Master Spec | `docs/studio-os/master-spec/milestones/` |

## Related systems

business-discovery-blueprint · mission-control · chief-of-staff · **Company Genome™ (M277)** · **Project Genome™ (M278)**

## Engineering notes

Onboarding discovers — never rushes setup. Arrival at Headquarters is the goal. **Genome completeness grows over time** — not a blocking gate on first login.

## Consumers

- **Company Genome™ (M277)** — primary genome learner
- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- Command Dock™ · Studio Intelligence™ · Documentation Governance™ (M126.5)
- Headquarters Engine™ — reads genome before HQ generation
- Architecture Validator™ — documentation coverage gate

## QA & release

Complete modules require this file per Architecture Validator™. No production release without registry, documentation, and trust checks per Constitution™.

---
_Auto-authored from Master Specification — 2026-07-07 · CA-002 genome learning amendment_
