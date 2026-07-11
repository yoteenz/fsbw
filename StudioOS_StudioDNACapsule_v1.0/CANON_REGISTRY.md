# Canon Registry

**Capsule:** Studio DNA Capsule 1.0.0  
**Maintained per:** `CANON_PRESERVATION_POLICY.md`  
**Format:** Append new rows — do not delete history

---

## Registry

| ID | Concept | Date introduced | Approval | Maturity | Source | Related systems | Dependencies |
|----|---------|-----------------|----------|----------|--------|-----------------|--------------|
| C-001 | Studio OS platform hierarchy (Studio → Workspace → Organization) | 2026-07-05 | Approved | Implemented | `motherboard/CORE.md`, `docs/studio-os/architecture.md` | `studio-os-core/application/`, admin studio routes | Multi-company routes |
| C-002 | Expert Capture profile-based interviews | 2026-07-10 | Approved | Implemented | MEMORY 2026-07-10, `expert-capture/profiles/` | `/expert-capture/*`, `useExpertCaptureSession` | Persistence layer |
| C-003 | Expert Capture Save/Exit/Resume | 2026-07-10 | Approved | Implemented | `docs/studio-institute/EXPERT_CAPTURE_PERSISTENCE.md` | `expert_capture_sessions` API | Supabase migration |
| C-004 | Living Knowledge Mirror™ | 2026-07-10 | Approved | Implemented | `docs/studio-institute/EXPERT_CAPTURE_KNOWLEDGE_MIRROR.md` | knowledge-mirror core, 9 routes | Expert Capture sessions |
| C-005 | Expert Trust Framework + Knowledge Vault™ | 2026-07-10 | Approved | Implemented | `docs/studio-institute/EXPERT_TRUST_FRAMEWORK_KNOWLEDGE_VAULT.md` | trust-vault/, vault routes | Session trustFramework meta |
| C-006 | Private Expert Invite System (Phase 1) | 2026-07-11 | Approved | Implemented | `docs/studio-institute/EXPERT_CAPTURE_INVITE_SYSTEM.md` | `/studio-institute/*`, invite-system | Expert Capture persistence |
| C-007 | Invite Sharing + ready-to-send messages | 2026-07-11 | Approved | Implemented | `docs/studio-institute/EXPERT_CAPTURE_INVITE_SHARING.md` | invites dashboard, invite-messages | C-006 |
| C-008 | AI Context Capsule™ export system | 2026-07-10 | Approved | Implemented | `StudioOS_ContextCapsule_v0.1/`, admin context-capsule | prebuild zip, `/downloads/context-capsules/` | — |
| C-009 | Studio DNA Capsule™ | 2026-07-11 | Approved | Implemented | This folder, `docs/studio-os/studio-dna-capsule/` | `/downloads/studio-dna-capsules/` | C-008 (companion) |
| C-010 | Canon Preservation Policy | 2026-07-11 | Approved | Implemented | `CANON_PRESERVATION_POLICY.md` | CANON_REGISTRY, onboarding | — |
| C-011 | Frontal Slayer Admin Alignment Protocol | 2026-07-06 | Approved | Implemented | `docs/frontal-slayer/ADMIN_ALIGNMENT_PROTOCOL.md` | Protected admin pages | — |
| C-012 | One Vercel deploy per agent task | 2026-07-10 | Approved | Implemented | `.cursor/rules/one-deploy-per-task.mdc` | `agent-commit.sh`, MEMORY protocol | — |
| C-013 | Studio Institute (M93 learning engine) | 2026-07-06 | Approved | In Progress | `docs/studio-os/studio-institute.md` | `studio-os-core/studio-institute/` | Profession Brain |
| C-014 | Studio World spatial computing vision | 2026-07-10 | Approved | Planned | Spatial Computing Philosophy sprint | docs/studio-os/foundation-sprint/ | World Graph |
| C-015 | Full Studio Accounts / SSO for Institute | 2026-07-11 | Pending | Concept | Invite system auth scaffold | `InviteAccessGrant` types | C-006 migration |

---

## How to add an entry

1. Assign next `C-###` ID  
2. Fill all columns  
3. Set maturity honestly (Concept if not approved)  
4. Append to this table in same commit as approval when possible  
5. Bump Studio DNA Capsule patch version if philosophy/policy changed  

---

## Approval log (abbreviated)

| Date | ID | Action |
|------|-----|--------|
| 2026-07-11 | C-009, C-010 | Founder sprint — Studio DNA Capsule + Canon Policy |
| 2026-07-11 | C-006, C-007 | Founder sprint — Institute invite system |

---

*Registry is source of truth for maturity — not folder presence alone.*
