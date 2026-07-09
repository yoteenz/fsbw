# Genesis Identity Engine™

**Ontology:** [`../articles/IDENTITY_ENGINE.md`](../articles/IDENTITY_ENGINE.md)  
**Runtime:** `src/studio-os-core/genesis/identity-engine/`  
**Platform guide:** [`../../docs/studio-os/genesis/IDENTITY_ENGINE_PLATFORM.md`](../../docs/studio-os/genesis/IDENTITY_ENGINE_PLATFORM.md)

Identity Engine™ is Studio OS's foundational platform system for **who and what exists** in Studio World. It is **not** user authentication.

## Structure

| Path | Purpose |
|------|---------|
| `identity/` | Identity Registry™ — canonical actor and entity records |
| `users/` | Human actor identities (user, founder, employee, citizen) |
| `organizations/` | Organization Engine™ — tenant entity identities |
| `companies/` | Company entity identities |
| `roles/` | Role Engine™ — declarative role assignments |
| `permissions/` | Declarative permission subject refs (not policy evaluation) |
| `memberships/` | Company Membership™ |
| `ownership/` | Ownership Registry™ |
| `invitations/` | Invitation System™ |
| `ai-workers/` | AI worker actor identities |
| `identity-graph/` | Identity Graph™ — typed relationship edges |
| `context/` | Identity Context™ resolver |
| `audit/` | Append-only audit history |

## Rule

Authentication binds sessions to Identity Engine actors. Permissions Engine™ evaluates authority using Identity Context. No feature may invent parallel identity records.
