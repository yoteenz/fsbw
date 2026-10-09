# Studio Institute recovery audit

**Date:** 2026-10-09  
**Branch base:** `origin/master` `ccbc51911`  
**Scope:** Existing Expert Capture was inspected in code. Its files were not rewritten. Browser regression of the old interviews was not completed in this sprint.

## What exists

| Capability | Where | Persistence | Classification |
| --- | --- | --- | --- |
| Private invitation links | `expert-capture/invite-system/` | Invite records can sync; token handling is in the invite module | ADAPT |
| Access protection | Invite token plus optional Supabase session | UI routes are public pages. Server session routes exist. This sprint did not re-prove production RLS. | UNSAFE FOR LIVE USE until the journal’s own token checks are on a durable server |
| Company expert profiles | `profiles/all-in-one-permitting-profile.ts`, `tax-preparation-profile.ts` | Code | REUSE AS IS |
| One-question interviews | `interview-engine.ts`, `ExpertCaptureInterviewView.tsx` | — | ADAPT into step review. Do not replace. |
| Voice recording | `recording-service.ts` MediaRecorder | IndexedDB blobs, upload when the media API is configured | UNSAFE to advertise inside the journal until retention is reviewed |
| Speech transcription | Web Speech API in the recording service, plus `POST /api/expert-capture/interview` | Provider call | MISSING for this pilot. No paid transcription was used. |
| AI follow-up | `follow-up-detector.ts` and the interview API | — | Not used. The journal asks only when a step is marked different. |
| Answer confirmation | Understanding and knowledge review screens | local session | ADAPT |
| Session recovery / resume | `persistence/autosave-manager.ts`, `server-sync.ts` | localStorage plus `expert_capture_sessions` when the migration and service role are present | ADAPT. Device drafts are labeled. Durable cross-device save is not claimed. |
| Knowledge extraction | `knowledge-extraction.ts` | — | Not reused for step wording. Narrative splitting is local and unapproved. |
| Knowledge review / owner approval | Knowledge Mirror lifecycle | — | REUSE the existing status names via `toKnowledgeMirrorStatus` |
| Knowledge Vault | `trust-vault/` | — | REUSE AS IS. The journal does not write into it. |
| Data export | `export-service.ts` | — | Not connected. Restricted notes are not exported by the journal. |
| Worker isolation | `trust-vault/worker-isolation.ts` and training gates | — | ADAPT. Owner approval maps to `owner_visible`, not `active_knowledge`. Worker use stays false. |
| Visual workflow generation | Workflow Engine V1 node names | localStorage engine store | ADAPT vocabulary only. The journal does not write the engine store and cannot execute. |
| Revision history | Session version on expert capture | — | MISSING as a full audit log. The journal keeps researched wording beside the expert’s words. |

## Device versus server

Expert Capture sessions start in `localStorage`. Audio blobs start in IndexedDB. Server save is `POST /api/expert-capture/session` and is confirmed only when that response succeeds. The journal pilot saves to `sessionStorage` and says so. `api/workflow-journal/session.ts` is process memory only. The SQL migration was not applied.

## Preserved

Permitting and tax profiles, invite manager, vault, and workflow engine files were not deleted or overwritten.
