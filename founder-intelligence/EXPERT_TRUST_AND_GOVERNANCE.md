# Expert Trust & Governance

Expert Trust Framework, worker isolation, owner oversight, and authorization.

---
**Last Updated:** 2026-07-11  
**Confidence Level:** High  
**Source:** Professional Trust Framework M94, Expert Capture, Studio Institute invites  
**Status:** Approved framework — phased enforcement  
**Version:** 1.0.0  
**Related Documents:** KNOWLEDGE_CAPTURE.md, INTERVIEW_ENGINE.md, MARKETPLACE.md  
**Future Questions:** Regulated-industry license verification automation?

---

## Expert Trust Framework

Every Profession Brain declares **professional scope**:

| Scope | Meaning |
|-------|---------|
| **Can** | Actions workers may perform autonomously within confidence |
| **Cannot** | Hard boundaries — never cross |
| **Review recommended** | Suggest human review |
| **Review required** | Block until licensed human approves |

Trust is **transparency**, not fear-based disclaimers. Concierges communicate responsibly.

## Organization-level worker isolation

- Digital Workers belong to **one organization** — no cross-org memory leakage  
- Expert Capture sessions isolated from public FSBW storefront nav  
- Private invite tokens scoped to owner-configured access  
- Knowledge Vault visibility: owner oversight before training downstream workers  

## Owner oversight

- Founder/owner approves which brain surfaces publish to Expert Marketplace  
- Interview transcripts: save/resume, incremental training only after approval  
- Pause/resume/revoke invite access; audit trail on owner actions  

## Competency & authorization

- Shadow Mode™ phases before automation (Observe → Recommend → Assist → Automate)  
- Knowledge Confidence™ scores per Profession Brain  
- Regulated industries: escalation to licensed professional (tax, legal, medical paths)  

## Private invite system (Phase 1 shipped)

- `/studio-institute/invites` — owner creates invite  
- `/studio-institute/invite/:token` — expert landing with optional PIN  
- Temporary deployment on **fsbw.vercel.app** — migration-ready to dedicated Studio OS domain  

## Future Studio OS domain migration

Expert Capture and Studio Institute routes designed for **host migration** without rewriting capture logic — config via `getPublicAppOrigin()`, not hardcoded production URLs.

## Cross-reference

Context: `KNOWN_BLOCKERS.md` for implementation gates · FIC: `INTERVIEW_ENGINE.md` for invite mechanics
