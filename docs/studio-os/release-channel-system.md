# Studio OS Release Channel System™

**Milestone:** M127.14 · **Volume:** volume-ii · **Module ID:** `release-channel-system`  
**Constitutional Amendment:** CA-001 · **Foundation:** v1.1.0

## Purpose

**Studio OS Release Channel System™** is a **constitutional platform capability** — not a product feature. It governs how organizations adopt new Studio OS capabilities at different speeds without affecting production environments.

> Every organization has an assigned Release Channel. All modules must respect channel eligibility before exposing functionality.

## Operating Channels

| Channel | Description | Recommended for |
|---------|-------------|-----------------|
| **Stable** | Production-ready. Fully validated. | Live organizations (e.g. Frontal Slayer) |
| **Preview** | Feature-complete, gathering production feedback | Early adopters, controlled pilots |
| **Beta** | Major capabilities undergoing broader validation | Innovation brands (e.g. NDXBOOK) |
| **Experimental** | Research, prototypes, future architecture | Sandbox organizations only |

## Default Organization Assignments

| Organization | Workspace ID | Channel |
|--------------|--------------|---------|
| Frontal Slayer | `frontal-slayer` | **Stable** |
| NDXBOOK | `ai-media` | **Beta** |
| Sandbox Organization | `sandbox` | **Experimental** |

Future organizations choose their channel at onboarding or via governed channel migration.

## Organization Profile Integration

Release Channel is a first-class field on every **Organization Profile**:

- **Organization Genome™** (M95) — `releaseChannel` on genome profile
- **System Registry™** (M127) — `organization:workspace.releaseChannel` metadata
- **Workspace schema** — default channel resolution per workspace ID

## Channel-Native Engines

| Engine | Role | Modules |
|--------|------|---------|
| **QA Engine™** | Channel-specific QA gates before exposure | `qa-headquarters`, `qa-inspector`, `qa-simulation-engine`, `release-readiness` |
| **Update Engine™** | Staged manifest and documentation rollout per channel | `manifest-reconciliation`, `documentation-sync`, `knowledge-registry` |
| **Deployment Engine™** | Channel-scoped build and release promotion | `release-readiness`, `self-healing-engine`, `documentation-governance` |

## Module Eligibility

Modules declare `minimumReleaseChannel`. Surfaces below the organization's channel are hidden or disabled — never silently exposed.

| Module | Minimum Channel |
|--------|-----------------|
| Studio Intelligence™ | Stable |
| QA Headquarters™ | Stable |
| Studio Orb™ | Preview |
| Experience Engine™ | Preview |
| Marketplace™ | Beta |
| Website Builder™ | Preview |
| Executive Strategy Floor™ | Experimental |

## Master Specification

| Field | Value |
|-------|-------|
| Canonical ID | `M127.14` |
| Internal ID | `release-channel-system` |
| Spec artifact | `docs/studio-os/master-spec/release-channel-system.yaml` |
| Amendment | `docs/studio-os/master-spec/constitutional-amendments.yaml` (CA-001) |
| Implementation | complete (constitutional + resolver) |

## Architecture

| Layer | Path |
|-------|------|
| Spec | `docs/studio-os/master-spec/release-channel-system.yaml` |
| Core | `src/studio-os-core/release-channel-system/` |
| Organization Genome | `releaseChannel` on `OrganizationGenomeProfile` |
| System Registry | `registry-builder.ts` — Release Channel infrastructure entry |

## Platform Governance

**Platform Governance™** (M212) inherits Release Channel policy for extension review, promotion approvals, and cross-organization rollout discipline.

## Governance

- Changes require **Constitutional Amendment** or **Design Revision**
- Prohibited: silent channel override, bypassing Stable QA gates, cross-channel bleed without promotion

## Consumers

- Studio OS Knowledge Registry™ (M126)
- System Registry™ (M127)
- QA Engine™ · Update Engine™ · Deployment Engine™
- Studio Orb™ · Studio Intelligence™ · Experience Systems™ · Marketplace™ · Website Builder™
- Architecture Validator™ — constitutional and registry integrity gate

---
_Constitutional capability — Foundation v1.1 Operational Completion (CA-001)_
