# AIO IFTA — Experience Brain Consumption Report

**Sprint:** P0.AIO.EXPERIENCE-DRIVEN-PAGE-REFINEMENT1 · founder override
**Status:** composition PROPOSED_FOR_FOUNDER_REVIEW · function layer implemented and tested
**Source:** yoteenz/SITE00 `docs/studioos/experience-brain` @ 5d6c074, vendored byte-for-byte into `src/ifta/experience/` (sha256 pinned in `provenance.json`, checked by `src/ifta/iftaFamily.test.ts`). Refresh with `node scripts/experience-brain/sync-ifta-contract.mjs --site00 <path>`; `--check` fails on drift.

## How the Brain is consumed

Two ways, both direct reads of the contract rather than restatements:

1. **In code (function layer, live now).** `src/ifta/experience/iftaExperience.ts` reads the vendored JSON. State labels and per-actor meanings (`stateMeaning`), one primary action per state (`primaryCta`), status treatments, section order (`sectionsFor`), hub buckets, inbox / activity / notification / human-task summaries (`channelEvent` + `fillTemplate`), receipt-class rules and mileage-source rules all come from the contract. Reducers in `src/ifta/iftaActions.ts` move state only along contract transitions.
2. **In the composition (proposed).** Every surface in `AIO_IFTA_COMPOSITION_REVIEW.html` and the JSON contracts lists the fields that drove it ("Driven by").

## Per screen

| Screen | Content | Composition | Interaction | State | Actor difference | Archetype |
|---|---|---|---|---|---|---|
| P1 Public | `perspectives.public.must_understand · who_its_for · what_we_handle (7) · what_client_provides (4) · how_it_works (6) · outcome · timing · pricing_relationship` | `information_hierarchy.PUBLIC`; `workspace_continuity` (same quarter card + six steps as the room) | `public_cta` REQUEST FILING (one action); blocker → IFTA registration | `NOT_ENROLLED` meaning PUBLIC | `emotional_target.PUBLIC` | `expression_refs.page_archetypes` HUB → threshold + checklist + packet specimen |
| C0 My Office card | `client_entry`, `perspectives.client.entry_point`, `sees_first` | closed jacket = `primary_visual_object` | `client_cta` CONTINUE FILING | live state via `effectiveState` | client wording only | PACKET |
| C1 Filing room | `project_room`, `information_hierarchy.CLIENT`, `under_review`, `what_happens_next` | `desktop_behavior` (left quarter + six steps · centre compartment · right flags + messages), `tablet_behavior`, `mobile_behavior`; `composition_rules[0..5]` | `interaction_grammar` client verbs | `section_overrides.CLIENT` where defined; `visual_relationships[*]` per state | `perspectives.client` vs `founder_staff.mirror_not_copy` | `visual_archetype` PACKET_BUILDER · WORKBENCH · CHECKLIST |
| C2 Receipts | `receipt_classes` rules; `required_inputs.FUEL_RECEIPTS.methods` | flagged slips first, fix inline (`composition_rules[2]`); `FUEL_RECEIPT.view_behavior` | TAKE PHOTO · UPLOAD · IMPORT FROM VAULT · RESOLVE FLAG | `RECEIPT_PARSE`, `DUPLICATE_CHECK`, `POSSIBLE_MISSING` derivations | staff see the same receipts as classification work | slip ledger (document table) |
| C3 Mileage | `mileage_sources` (6) with quality rules | one lane per truck; estimate visually distinct (`composition_rules[3]`) | upload ELD report · spreadsheet · manual state entry · ask AIO; ELD/GPS shown not live | `MILEAGE_QUALITY` via unchanged `assessIftaReadiness` | client gets plain language; staff see `IftaReadinessStatus` | ledger per truck |
| C5 With AIO | `under_review` | inputs quiet (`composition_rules[4]`; `quiet: capture tools`) | MESSAGE AIO | `AIO_REVIEW · RECONCILING · FILING` emphasis REVIEW | named reviewer from staff record | case (read-only) |
| C6 Decision window | `RETURN_SUMMARY.view_behavior` (miles, gallons, MPG, tax due / credit by jurisdiction) | `section_overrides.CLIENT.AWAITING_APPROVAL` = QUARTER · RETURN_SUMMARY · APPROVE_OR_ASK | `client_approval_points` APPROVE · ASK A QUESTION | `AWAITING_APPROVAL` emphasis DECISION | approval timestamp + approver recorded | DECISION_WINDOW |
| C7 Sealed | `completion_looks_like`, `artifacts_received` | `section_overrides.CLIENT.FILED` = QUARTER_SEALED · CONFIRMATION · ARTIFACTS · VAULT_LINK · NEXT_QUARTER | VIEW IN VAULT | `FILED` emphasis SUCCESS | staff: RECORD PAYMENT STATUS | packet (sealed) |
| C8 Vault drawer | `vault_destination`, `QUARTER_PACKET` | `IFTA_FILED_TO_VAULT.visual_transition` | open packet | `ARCHIVED` | client + staff visibility per artifact | ARCHIVE / CABINET |
| C9 Next quarter | `next_step`, `system.next_cycle_creation` | `IFTA_ARCHIVED_OPENS_NEXT.visual_transition` | open next quarter | `QUARTER_OPEN` / `COLLECTING` | staff: new quarter work item | HORIZON → PACKET_BUILDER |
| C10 Inbox slip | `inbox_events` IFTA_NEEDS_YOU · IFTA_APPROVAL_REQUEST · IFTA_FILED | slip object in room + thread | resolve in room → thread + notice update | `NEEDS_CLIENT` → `COLLECTING` | staff message, client reply | queue item |
| S1 Staff queue | `founder_staff.work_queue`, `blockers`, `system_flags` | due date × readiness order; `hub_buckets` ribbon | `visual_relationships[*].primary_cta.FOUNDER_STAFF` per row | staff meanings | `mirror_not_copy` (CLIENT SEES ⇄ YOU SEE) | QUEUE + PIPELINE |
| S2 Case file | `client_context`, `missing_inputs` (heat strip), `human_review`, `corrections`, `overrides`, `audit_history` | `section_overrides.FOUNDER_STAFF` (AIO_REVIEW · RECONCILING · FILING · FILED) | `operational_actions`; overrides need a note (`founder_override_points`) | `human_review_points` per state | dense, staff-only instruments | CASE_FILE |

## Where the Brain was silent (marked PROPOSED)

- Client sections for AIO_REVIEW, RECONCILING, FILING, OVERDUE_RISK, ARCHIVED, FILING_REJECTED (contract lists QUARTER_OPEN, COLLECTING, NEEDS_CLIENT, AWAITING_APPROVAL, FILED only).
- Staff sections for states other than AIO_REVIEW, RECONCILING, FILING, FILED.
- Sub-paths `/portal/services/ifta/{receipts|mileage|vehicles|approval}` and the Vault drawer route.
- Posture names (OPEN JACKET, HELD, WITH AIO, DECISION WINDOW, SEALED, FILED AWAY, RETURNED).
- Hex values and type composition (IDNTY palette and type are in progress).

## Sprint additions the Brain should absorb (founder decisions)

| Addition | Sprint § | Decision |
|---|---|---|
| Receipt class UNDER_AIO_REVIEW | §6 | D-09 |
| Activity events: mileage imported, AIO review started, correction requested, payment recorded, vault package created | §19 | D-10 |
| FILED and PAYMENT PENDING as separate staff buckets | §13 | D-11 |
| Approval CTA "APPROVE FOR FILING" (contract: "APPROVE RETURN") | §11 | D-14 |

## Contract ambiguity found

`{n}` means the quarter number in `Q{n}` and a count elsewhere (`'{n} fuel receipts added to Q{n}'`). `fillTemplate` resolves `Q{n+1}` and `Q{n}` first, then treats any remaining `{n}` as a count. Recommend a distinct `{count}` token in the Brain.
