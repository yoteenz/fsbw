# AIO IFTA — Authority Bundle + Page / Tab / State Tree (pointer)

Sprint **P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1**. No page was implemented, no paid generation ran, and no AIO data contract was changed.

## Source of truth: SITE00
The source of truth is `yoteenz/SITE00` @ `2225bc9`, merged as PR #1402.

| What | Where (SITE00) |
|---|---|
| Stored bundle (12 images + README + manifest, sha256-pinned) | `docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE/` |
| Typed ingest, tree, registries, readiness | `shared/studioos-visual-authority/projects/aio/ifta-authority/` |
| Gate extension (derivation + tree confirmation) | `shared/studioos-visual-authority/{gate,schema,tree}.ts` |
| 13 generated artifacts | `docs/aio/ifta/authority-bundle/` (regenerate with `npx tsx scripts/studioos/aio-ifta-authority-bundle-export.ts`) |

The 13 artifacts at that commit:

| Artifact | sha256 |
|---|---|
| AIO_IFTA_AUTHORITY_BUNDLE_REGISTRY.json | `a10f8100d6787ebcaadbc2ee7493110030a46546affebfcf6b872956b0e4d377` |
| AIO_IFTA_AUTHORITY_REFERENCE_MAP.json | `65e5f1d8b2de337410c5f0c9fe63f249e748170736c0314f770db4210bc3fc52` |
| AIO_IFTA_PAGE_TREE.json | `8239a367801424dd71796dd732b00df879a982d6b8101b34b09d4e9db3f2675f` |
| AIO_IFTA_TAB_TREE.json | `fb4d18c61f85d1b50bc110de6d47aa91278d4fa082db667a261f170cfa671425` |
| AIO_IFTA_COMPONENT_REGISTRY.json | `8c1752a044c62d74f5f162bffd62e8711da0712735571d1de0b0c5a30d0bdebf` |
| AIO_IFTA_INTERACTION_REGISTRY.json | `da2d7ea4c11e877f8f10af2f8961447ee511688f49af159320efdd183deac993` |
| AIO_IFTA_STATE_REGISTRY.json | `291b6dbc7cf8ba6fc835ee7dea859a69d4b2c6e27041cee94a130e50e8203a9e` |
| AIO_IFTA_ACTOR_MODE_MAP.json | `de8eb5d1c462f41b06dc23de7ef83839a31486009be87a66240b29c2ed6b303d` |
| AIO_IFTA_RESPONSIVE_AUTHORITY_MAP.json | `b527ccc2af05456befba204e63d0b3e084bf3852064d37d7f6e757cea06f0133` |
| AIO_IFTA_DATA_CONTRACT_RECONCILIATION.json | `10c06feac6026f1721028e89b2e03797c40544a9bcd373915aad39c340f4c37c` |
| AIO_IFTA_IMPLEMENTATION_READINESS.json | `cbd0b23abf6799b10b7bd7785ddfc0f1a33fce48ba4520eb71b03b3ed90496bf` |
| AIO_IFTA_REFERENCE_PACKAGE_GAP_REPORT.json | `eaa9aae0cdbbf7e32be2ce632a7b884230ae156aec8d82d8ff8c749465febcf7` |
| AIO_IFTA_PAGE_TREE_PROOF.md | `30b34c5e2fe53cba8c420edf31b4de10ebd18a9d7927e9736609ef8bb487f57f` (copied here byte-for-byte) |

## Status
- **Gate:** all three actors (PUBLIC · CLIENT · FOUNDER_STAFF) are **AUTHORITY_APPROVED**, held by **PAGE_TREE_CONFIRMATION_REQUIRED**. The founder confirms the tree before any implementation.
- **Tree:**
  - 64 material nodes: 4 pages, 14 tabs (12 primary + NOTES candidate ×2), 7 public sections, 2 child pages, 16 drawers, 12 modals, 4 flows and 5 state views.
  - Registries: 48 states, 62 interactions, 40 components, 21 data domains.
  - 39 / 64 nodes are IMPLEMENTATION_READY.
- **Reference package:** INCOMPLETE. There is no staff fuel-tax QUEUE authority, and contract interaction 09 is illegible.
- **Legacy visual leaks:** 0. Legacy AIO surfaces were read for function only.

## What the AIO repo must respect before implementation
- **Firewall:** legacy AIO visuals have ZERO design authority. Never mount IFTA pages inside the legacy portal / office chrome (decision D-ROUTES-SHELL).
- **Logo rule (LOCKED):** simple mark only in tight / top nav; full lockup only in the lower brand band.
- **Data findings** (read-only scan of this repo @ `48d463f`):
  - IFTA persists only in the localStorage demo store, and no Supabase table exists.
  - Routes `/portal/services/ifta` and `/office/permitting/fuel-tax` are unregistered; the client path is caught by `services/:serviceRequestId`.
  - Availability truth conflicts: PREPARING vs INTERNAL_ONLY vs GO.
  - The staff worksheet has no writer.
  - There is no CSV / OCR / ELD parsing and no tax computation.
  - The generic client activity page shows the org's internal events. This is pre-existing and was not changed.
- **This repo's vendored experience contract** (`src/ifta/experience/`) has been re-synced to SITE00. Only `expression_refs` and `lineage` changed; the experience semantics did not.
