# Genesis Identity Engine™

**Ontology:** [`../articles/IDENTITY_ENGINE.md`](../articles/IDENTITY_ENGINE.md)  
**Runtime:** *(planned — Cycle 4 per Studio OS Build Order™)*  
**Admin:** *(planned)*

Identity Engine™ is Studio OS's foundational platform system for **who and what exists** in Studio World. It is **not** user authentication.

## Structure (planned runtime)

| Path | Purpose |
|------|---------|
| `identity-registry/` | Canonical identity records — actors and entities |
| `identity-graph/` | Typed relationships, inheritance, composition |
| `role-model/` | Declarative role assignments |
| `membership/` | Organization and company membership |
| `invitation/` | Provisioning pending identities and affiliations |
| `identity-context/` | Resolved actor context for Authentication and Permissions |
| `lifecycle/` | State transitions and audit |
| `ai-identities/` | AI worker actor provisioning |

## Rule

No feature may invent parallel actor, company, or membership records. Authentication binds to Identity Engine actors; Permissions Engine evaluates authority using Identity context.
