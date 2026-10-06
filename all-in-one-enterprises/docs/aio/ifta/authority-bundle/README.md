# AIO IFTA — Authority Bundle + Page / Tab / State Tree (pointer)

- **Revision 1:** sprint **P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1**, SITE00 PR #1402.
- **Revision 2:** sprint **P0.AIO.OFFICE-WORKSPACE-ARCHITECTURE-AND-IFTA-TREE-FOUNDER-LOCK1**, SITE00 PR #1403. The tree is rebased under AIO OFFICE / CLIENT OFFICE and the ten founder decisions are locked.

No page was implemented, no paid generation ran, and no AIO data contract was changed.

## Source of truth: SITE00
The source of truth is `yoteenz/SITE00` @ `61a5e90` (PR #1403).

| What | Where (SITE00) |
|---|---|
| Stored bundle (12 images + README + manifest, sha256-pinned) | `docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE/` |
| Typed ingest, tree, registries, readiness, decisions | `shared/studioos-visual-authority/projects/aio/ifta-authority/` |
| Gate + tree core (now with OPERATING_ENVIRONMENT · HUB · WORKSPACE · CONTEXT nodes) | `shared/studioos-visual-authority/{gate,schema,tree}.ts` |
| Office / workspace architecture | `shared/studioos-experience-brain/{operating-environment.ts, projects/aio/office.ts}` → `docs/aio/office/` (pointer: `../../office/README.md`) |
| 16 generated artifacts | `docs/aio/ifta/authority-bundle/` (regenerate with `npx tsx scripts/studioos/aio-ifta-authority-bundle-export.ts`) |

| Artifact | sha256 |
|---|---|
| AIO_IFTA_ACTOR_MODE_MAP.json | `4a047ae8ac01a7bceae92d1f416c97a30a859bc1cbb4589c98804383792b3fc1` |
| AIO_IFTA_AUTHORITY_BUNDLE_REGISTRY.json | `e6d98f1987fe1e55a08c2b0330c1ed8ec41ca6e4b11d56c7a38c676971f96770` |
| AIO_IFTA_AUTHORITY_REFERENCE_MAP.json | `547f3045e3db32c7988258cf692cb8b873c2fb691a293a019f04e59070d25870` |
| AIO_IFTA_COMPONENT_REGISTRY.json | `b2323330baef517a8a5eb32eac74fa28a1d750240d196110aa08aca8e453b395` |
| AIO_IFTA_DATA_CONTRACT_RECONCILIATION.json | `c9267f8905fdd4b65109406a209004e353c22beb746550d6b8cdcb4ec0ebac46` |
| AIO_IFTA_DECISION_REGISTRY.json | `2ef496f2be9103c925ef0953e76ad2ce5df3d567fadfb75e4d132b5187b3f2e8` |
| AIO_IFTA_IMPLEMENTATION_READINESS.json | `b3daf869b24b2302f91f0b38523ec7e8137927348d52a57bf03f21a21f0e772c` |
| AIO_IFTA_INTERACTION_09_CORRECTION_PROOF.md | `6cb2ad5fe8e6d268a65375f3dfa357c6303a1cc17573002a00174ac059f52350` (copied here byte-for-byte) |
| AIO_IFTA_INTERACTION_REGISTRY.json | `67d528a4627433e2c945f956fa28ec050ccac978694bb69d2ac89b2964070e86` |
| AIO_IFTA_PAGE_TREE.json | `373562db187659776e7ed2ae972491270c3fc89e06d61f01e535d7a33328cdf7` |
| AIO_IFTA_PAGE_TREE_PROOF.md | `2b22ff25873b4b5b206234ae1c72fa7f8e7c0724068abe6771b245f71cd7b5d9` (copied here byte-for-byte) |
| AIO_IFTA_QUEUE_DERIVATION_CONTRACT.json | `92a92630fb7398b97b7ed55b77be4cde73a74c03e86d79caeec1a3fbb07fc284` |
| AIO_IFTA_REFERENCE_PACKAGE_GAP_REPORT.json | `94192328b00129dce2719ddc8d03ddd890bf812c9444f69c1dfa487e16befd59` |
| AIO_IFTA_RESPONSIVE_AUTHORITY_MAP.json | `c9d9dc90110d76419e7e9c164bd4755a66304bdc13c6015cb402cf9d9b233bfd` |
| AIO_IFTA_STATE_REGISTRY.json | `09aba4354506b5b32285acf8f4c8018db12e0ad4d2f3f46ddf81baf429a32816` |
| AIO_IFTA_TAB_TREE.json | `d2c574787ba4ca31d8e6e30492217dd2ef484ea3d055e61cceb55b9cc9387001` |

## Status (revision 2)
- **Tree:** PRODUCED and **AWAITING FINAL FOUNDER CONFIRMATION**. PAGE_TREE_CONFIRMED is not marked, so the gate still holds every actor at **PAGE_TREE_CONFIRMATION_REQUIRED**.
- **Founder tree:** AIO OFFICE → WORKSPACE IFTA → FUEL TAX QUEUE (cross-client landing) → CLIENT CONTEXT → CLIENT-QUARTER CASE. There is also a WORKSPACE NOT ACTIVE FOR THIS CLIENT state.
- **Client tree:** CLIENT OFFICE → WORKSPACE IFTA → QUARTER SELECTOR → IFTA FILING ROOM, with six tabs (no client NOTES; MESSAGE AIO instead). SET UP IFTA FILING is the NOT ACTIVE YET state.
- **Coverage:**
  - 64 material nodes; material IDs are preserved.
  - 3 environments, 2 hubs, 2 workspace nodes, 4 pages, 13 tabs (12 primary + staff NOTES secondary), 7 public sections, 2 child pages, 16 drawers, 12 modals, 4 flows and 6 state views.
  - Registries: 48 states, 69 interactions, 43 components, 22 data domains.
- **Readiness:** 49 / 64 IMPLEMENTATION_READY (was 39). Every remaining blocker is a data blocker:
  - CSV import · staff escalate · mark not operated · worksheet writer · rejection / reopen · reclassify · export report
  - staff notes model · public availability truth
  - plus route registration and production persistence before implementation
- **Reference package:** COMPLETE.
  - The staff FUEL TAX QUEUE is **DERIVED_AUTHORITY**: the founder authorised derivation from the staff case authority.
  - Interaction 09 is **RUN FAQS**: identity resolved, behaviour description pending, non-blocking.
  - The environment hubs and the client overview have no authority yet; they are outside the IFTA package.
- **Founder decisions locked:**
  - D-BRAND-TOKENS · D-TYPOGRAPHY · D-INTERACTION-09 · D-ROUTES-SHELL · D-IFTA-AVAILABILITY
  - D-NOTES-TAB · D-CLIENT-DESKTOP-STAFF-MODULES · D-TAX-FIGURES · D-PUBLIC-COPY-TRUTH · D-STAFF-QUEUE-AUTHORITY
- **Legacy visual leaks:** 0.

## What the AIO repo must respect before implementation
- **Firewall:** legacy AIO visuals have ZERO design authority. Mount the new pages on the planned static routes inside the existing guards, rendering the new family shell (D-ROUTES-SHELL). Planned routes:
  - `/office/workspaces/ifta(/:clientId/:quarter)`
  - `/office/clients/:clientId/ifta/:quarter`
  - `/portal/workspaces/ifta(/:quarter)`
  - The old helpers `/portal/services/ifta` and `/office/permitting/fuel-tax` are superseded.
- **One canonical case:** `IftaQuarterCase` (one per organisation-quarter) serves both client and staff. Never create a second record per actor or per route.
- **Brand:**
  - The brand DNA board wins every shared brand role (#050505 · #1A1A1A · #D4A853 · #EBD9B7 · #C0C6CC · #F6F6F4).
  - The asset sheet supplies functional tokens only.
  - INTER TIGHT / INTER for client and staff UI.
  - The logo rule is LOCKED.
- **Tax figures:** come only from the staff-prepared return summary ("TAX DUE / CREDIT — PENDING AIO PREPARATION" until then). There is no tax-rate engine.
- **Data findings** (read-only; unchanged since `48d463f`, re-audited @ `20438a2`):
  - IFTA lives in the localStorage demo store only.
  - The routes are unregistered.
  - Availability sources conflict: PREPARING · INTERNAL_ONLY · GO.
  - The staff worksheet has no writer.
  - There is no CSV / OCR / ELD parsing and no tax computation.
  - The generic client activity page shows internal events (pre-existing).
- **Vendored experience contract** (`src/ifta/experience/`): checked against SITE00 @ `61a5e90` with `--check`. No drift.
