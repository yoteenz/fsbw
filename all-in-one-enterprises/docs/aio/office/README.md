# AIO OFFICE / CLIENT OFFICE — Workspace Architecture (pointer)

Sprint **P0.AIO.OFFICE-WORKSPACE-ARCHITECTURE-AND-IFTA-TREE-FOUNDER-LOCK1**, SITE00 PR #1403 @ `61a5e90`. This is architecture only: no page was implemented and no AIO code or data contract was changed.

**Founder decision:** AIO services are **workspaces inside a connected business office**.

```
AIO OFFICE (founder / staff) = CLIENT × WORKSPACE × SUBCONTEXT        client and workspace switch independently
CLIENT OFFICE (client)       = FIXED CLIENT × WORKSPACE × SUBCONTEXT  no client switcher
CASE                         = PROJECT + CLIENT + WORKSPACE + CASE TYPE + SUBCONTEXT   one canonical identity
```

## Source of truth: SITE00
- Generic model: `shared/studioos-experience-brain/operating-environment.ts`.
- AIO data: `shared/studioos-experience-brain/projects/aio/office.ts`. It is built from a read-only audit of this repo @ `20438a2`.
- 10 generated artifacts in `docs/aio/office/` (regenerate with `npx tsx scripts/studioos/aio-office-export.ts`):

| Artifact | sha256 |
|---|---|
| AIO_OFFICE_ARCHITECTURE.md | `b633de4917e2f45995b053fce00210d234849ce5043010313abd863bcd1085cc` (copied here byte-for-byte) |
| AIO_OFFICE_CONTEXT_MODEL.json | `48871dfd8652099ca7f0440903fc576f10a097fa32b254a65982ccd176e0ef85` |
| AIO_OFFICE_WORKSPACE_REGISTRY.json | `6cdf4b477b1a435a20eeff90c79e8cb0dfd9bec83f39e1ad70c8451acfb0ad31` |
| CLIENT_OFFICE_ARCHITECTURE.md | `3c5ccaa786922537780e2055b859423e48ebea08ba946018391a3810af04c787` (copied here byte-for-byte) |
| CLIENT_OFFICE_WORKSPACE_MODEL.json | `f696cacc6b6ca4f727fb5f45c0bd81534f799369f02c1d59a4d0e000545ec70b` |
| CLIENT_WORKSPACE_SWITCHING.md | `729fdcfb8e1df3c3d24f8ea1f94580aadf7790bf296b3bd208e13b3a49c3425d` |
| STAFF_CLIENT_WORKSPACE_SWITCHING.md | `1b5ddb92f5b408dd04b68d722205f1d02608373d6cc5b7e459964b0ec9b30349` |
| WORKSPACE_AVAILABILITY_MODEL.json | `29ff30bb186bf42766bcd4e3836aea53f642dbf16ad0ff1a51a23ae4e63a6281` |
| WORKSPACE_EXPANSION_CONTRACT.json | `2964af9f3f88b61b45fb26ade49d4769b8c90b7dffd1efd6dc3334e87c1c7e6a` |
| WORKSPACE_EXPANSION_RULES.md | `eced22ed294f04e683f8e01a1436ff98576b0aced594979a723a32626643f49f` |

## What this repo must respect
- **Controls stay distinct.** Global navigation, the workspace switcher, the client switcher (AIO OFFICE only) and the subcontext selector (IFTA: quarter) are separate. A context change re-resolves everything; nothing is carried from the previous client.
- **Workspace states:** ACTIVE · AVAILABLE_NOT_ACTIVATED · NOT_APPLICABLE. PENDING_SETUP / PAUSED / ENDED are used only where the domain record supports them.
  - Staff with an inactive workspace see "WORKSPACE NOT ACTIVE FOR THIS CLIENT" with supported actions only. START SERVICE is not offered for IFTA: there is no writer.
  - Clients see the NOT ACTIVE YET expansion state.
  - NOT_APPLICABLE is never surfaced.
- **Expansion is explainable, not advertising.** It is built from rules over recorded signals, every suppression is named, and when no rule matches nothing is shown. The five pre-existing generic "AVAILABLE" fallbacks in `portal/clientCommandCenterService.ts` `buildActiveServices` are reported and are not to be reused.
- **Permissions are not broadened.** There is no founder role today; the recommendation is that the founder gets OfficeStaffRole `owner`, but this is an open founder question.
- **Data follow-ups** (for a future data sprint; not done):
  - Replace the two disagreeing "active services" heuristics with one canonical client × workspace resolver.
  - Add an IFTA OfficeWorkItem domain.
  - Reconcile IFTA availability.
  - Map Supabase internal roles to office roles.
