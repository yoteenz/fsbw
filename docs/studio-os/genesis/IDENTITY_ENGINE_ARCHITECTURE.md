# Identity Engine™ — Architecture Guide

**Blueprint:** `genesis/articles/IDENTITY_ENGINE.md`  
**Content home:** `genesis/identity-engine/`  
**Build order:** Cycle 4 — after Organization Registry™ + Company Registry™ MVP  
**Status:** Architecture approved; runtime not yet implemented

---

## Purpose

Identity Engine™ is the **first production-ready Core System** architecture for Studio OS. It defines permanent platform capability for:

- **Actors:** founders, employees, citizens, AI workers, clients, vendors, partners, mentors, students
- **Entities:** companies, organizations, departments, headquarters, rooms, workspaces, teams, profession brains, assets, products, communities

Authentication proves access. Permissions decide authority. **Identity declares existence.**

---

## Architectural components

| Component | Description |
|-----------|-------------|
| Identity Registry™ | Canonical records with immutable `identityId` |
| Identity Graph™ | `belongs_to`, `contains`, `operates`, `cross_company_link`, etc. |
| Role Model™ | Declarative roles — Permissions Engine evaluates |
| Ownership Model™ | Steward, org, company, operator layers |
| Invitation Model™ | Pending identities → Authentication binding |
| Identity Context™ | Resolved actor + affiliations + inherited scope |

---

## Boundaries

| System | Relationship |
|--------|--------------|
| **Authentication** | Binds sessions to actor identities — does not own identity records |
| **Permissions Engine™** | Consumes Identity Context — Identity never returns allow/deny |
| **Organization Registry™** | Org envelope; Identity owns org identity node in graph |
| **Company Registry™** | Company structure; Identity owns company identity + memberships |

---

## MVP (Cycle 4)

Ship: actor envelope, org/company entities, membership, declarative roles, invitation flow, core graph edges, Identity Context resolver, lifecycle events.

Defer: marketplace public profiles, complex holdings, full Career Worlds identities, federation.

---

## Next implementation sprint

When runtime begins, create `src/studio-os-core/genesis/identity-engine/` following Build Order Engine and Dependency Map patterns. Consult `getOptimalNextSystem()` — Business Discovery™ and Company Genome™ precede Identity in strict build order, but this blueprint is the normative target for Cycle 4.
