# 21 — Board Approval-State Correction (V3 → V3.1)

Published to the **same URL**: https://claude.ai/artifact/CpzJCzVGRK5HpEDzz91r82 (version 3 of the artifact, 2026-10-26). Capabilities carried forward unchanged: `db` (read: view, write: owner), `user`, `downloads`. The decision store was read back after the publish: **empty (0 decisions recorded)**.

## What was wrong in V3

| # | Ambiguity | Effect |
|---|---|---|
| 1 | The outcome select showed "FOUNDER APPROVED" as its default visible option before anything was recorded | Read as if approval already existed |
| 2 | The working outcome defaulted to `APPROVED` | One click on Record approved by default |
| 3 | Unrecorded cards showed `RECOMMENDED` as their state | A recommendation looked like a status |
| 4 | An owner's radio selection did not change the badge | No visible "selected but not recorded" stage for the owner |
| 5 | The manifest mixed recommendation and state; unrecorded selections sat in a side list | Recommendation, selection, approval, authorization and progress were not separable |
| 6 | Sprint chips showed ✓ for any recorded decision, including rejections | |

## What V3.1 does

| Rule (brief §16) | Implementation | Verified (render check) |
|---|---|---|
| Default state "PENDING DECISION" | `stateOf()` returns `PENDING DECISION` (or `PENDING DECISION · BLOCKED`) when nothing is recorded | 59 + 4 cards, 0 other states, phone and desktop |
| FOUNDER APPROVED only after explicit selection **and** a successful record | Badge comes only from records read back from the store snapshot; Record is disabled until an option **and** an outcome are chosen | 59/59 Record buttons disabled initially; option → `SELECTED — NOT RECORDED`, still disabled; outcome → enabled; record → `FOUNDER APPROVED` after the (simulated) store confirms |
| Recommendation, visual selection and JSON template are not approvals | Separate "Recommendation" line ("a recommendation, not an approval"); select placeholder "— Choose outcome —" with verbs Approve / Reject / Defer | `selectDefault: "— Choose outcome —"` |
| Keep IDs and recommendations; no preselection; no auto-approval of A1a, H2, H3, A1b | IDs and recommendations unchanged; `status` starts empty; A1b stays non-recordable while BLOCKED | 0 FOUNDER APPROVED badges on load |
| Manifest distinguishes six fields | Manifest v4: `recommendation`, `selectedOption` (with `source`), `recordedFounderDecision`, `executionAuthorization`, `implementationStatus`, `verificationStatus` | `APPROVAL_MANIFEST_TEMPLATE_v4.json` |
| Execution authorization respects dependencies | A1a → authorized for staging only when H2 and H3 are also recorded as approved; A1b → never authorized without A1a + staging evidence | Logic in the template, `execAuth()` |
| No unrelated redesign | Only the decision card controls, state badges, the export panel text, the security note (rehearsal facts) and the subtitle changed | Same layout; screenshots in `render_check/` |

The owner-flow test used an **in-browser mock store** inside a headless browser, never the real decision store. No decision was written to the real store.

## Files

| Path | Purpose |
|---|---|
| `generator/patch_board.py` | Applies the correction to `FRONTAL_SLAYER_S0A_S0B1_READINESS/evidence/generator/board_v3_template.html` (every replacement asserted) |
| `generator/board_v3_1_template.html` | Corrected template |
| `generator/build_board_v3_1.cjs` | Builder: `node build_board_v3_1.cjs <outdir> <dir with board_data.js>`. Also updates the migration statuses to "REHEARSED LOCALLY · STAGING BLOCKED" and the A1a "Now" line |
| `built/index.html` | The published page |
| `APPROVAL_MANIFEST_TEMPLATE_v4.json` | Exported with an empty store: status `NO FOUNDER DECISION RECORDED` |
| `render_check/` | Playwright script, JSON output (0 page errors, no horizontal overflow at 390 and 1280 px) and screenshots |
