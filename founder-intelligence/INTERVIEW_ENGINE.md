# Interview Engine

Private expert interviews and invite-only capture.

---
**Last Updated:** 2026-07-11  
**Confidence Level:** High  
**Source:** Private Expert Invite System Phase 1, Studio Institute vision bibles  
**Status:** Shipped Phase 1 — migration-ready isolation  
**Version:** 1.0.0  
**Related Documents:** KNOWLEDGE_CAPTURE.md, MARKETPLACE.md  
**Future Questions:** Phase 2 multi-expert panel interviews?

---

## Purpose

Capture expert knowledge **before it walks out the door** — structured interviews, not ad-hoc chats. Isolated from public FSBW nav; migration-ready to dedicated hosts.

## Phase 1 (shipped)

| Surface | Path |
|---------|------|
| Owner invite manager | `/studio-institute/invites` |
| Expert landing | `/studio-institute/invite/:token` |
| Interview workspace | `/studio-institute/interview` |
| Knowledge vault | `/studio-institute/knowledge-vault` |

## Invite mechanics

- Copy link, ready-to-send messages, Web Share API  
- Owner preview (`?preview=owner`), pause/resume, regenerate link  
- Optional PIN (SHA-256), access status audit trail  
- Env: `STUDIO_INSTITUTE_OWNER_KEY`, public origin via `getPublicAppOrigin()`  

## Expert journey

Receive invite → optional PIN → interview session → knowledge stored in vault → **founder approval** before training workers or marketplace publication.

## Relationship to Expert Capture legacy

`/expert-capture/*` routes remain for domain-specific capture (tax, permitting). Studio Institute path is the **canonical invite system** going forward.

## Cross-reference

Docs: `docs/studio-institute/EXPERT_CAPTURE_INVITE_SHARING.md`
