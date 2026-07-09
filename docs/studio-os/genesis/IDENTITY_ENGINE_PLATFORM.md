# Genesis Studio OS Identity Engine™ — Platform Guide

**Core:** `src/studio-os-core/genesis/identity-engine/`  
**Blueprint:** `genesis/articles/IDENTITY_ENGINE.md`  
**Content home:** `genesis/identity-engine/`  
**Status:** Runtime shipped — Cycle 4 MVP infrastructure

---

## Purpose

Identity Engine™ is Studio OS's **first production Core System** runtime. It provides reusable platform infrastructure for declaring **who and what exists** — not authentication, not UI state, not brand-specific logic.

---

## Implemented modules

| Module | Path |
|--------|------|
| Identity Registry | `identity/registry.ts` |
| Users | `users/users.ts` |
| Organization Engine | `organizations/organizations.ts` |
| Companies | `companies/companies.ts` |
| Role Engine | `roles/role-engine.ts` |
| Permission refs | `permissions/permission-engine.ts` |
| Company Membership | `memberships/memberships.ts` |
| Ownership Registry | `ownership/ownership-registry.ts` |
| Invitation System | `invitations/invitation-system.ts` |
| AI Workers | `ai-workers/ai-workers.ts` |
| Identity Graph | `identity-graph/graph.ts` |
| Identity Context | `context/identity-context.ts` |
| Audit History | `audit/history.ts` |
| Bootstrap | `bootstrap/seed.ts` |

---

## Identity record fields

Every identity stores: `identityId`, `identityType`, `kind`, `displayName`, `officialName`, `lifecycleState`, `status`, `ownerIdentityId`, `organizationIds`, `companyIds`, `relationshipIds`, `roleAssignmentIds`, `permissionRefIds`, `metadata`, `auditHistoryIds`, `version`.

---

## Key APIs

```typescript
import {
  ensureIdentityEngineSubsystem,
  createUserIdentity,
  createOrganizationIdentity,
  createCompanyIdentity,
  createAiWorkerIdentity,
  assignIdentityRole,
  createCompanyMembership,
  issueIdentityInvitation,
  resolveIdentityContext,
  getIdentityGraphView,
  getIdentityEnginePlatformStats,
} from '@/studio-os-core/genesis';
```

---

## Boundaries

| System | Identity Engine role |
|--------|---------------------|
| **Authentication** | Binds sessions to actor identities |
| **Permissions Engine™** | Evaluates authority from Identity Context + permission refs |
| **Organization Registry™** | Org envelope (future); Identity owns org identity node |

Permission refs in `permissions/permission-engine.ts` are **declarative only** — they do not evaluate allow/deny.

---

## Persistence

Nested under `genesis_v1` localStorage as `GenesisStore.identityEngine`. Bootstrapped with **generic platform fixtures** (Platform Steward, Studio Platform Tenant, Demo Company, Platform Concierge) — no brand hardcoding.

---

## Principles

- Existence before access; access before authority
- Immutable `identityId`; display names may change
- Every AI worker is a registered actor identity
- Graph edges model membership, ownership, and composition
- Audit history is append-only
