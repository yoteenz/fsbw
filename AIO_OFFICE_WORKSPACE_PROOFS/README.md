# AIO OFFICE four workspace proofs: boards, recordings, screenshots and QA

Sprints:
- `P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.CREATIVE-DIRECTION-AND-WORKSPACE-RECOVERY1` (2026-10-08) built the four workspaces.
- `P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.MATERIAL-MOTION-AND-DETAIL-POLISH1` (2026-10-08) locked their design language and polished material, motion and detail.

Founder review link: https://claude.ai/artifact/DKYZUHjSdiTw1qSC1evdbk

The files here show the review with sample records, not the live app. The four workspaces are candidates until the founder approves them.

## `boards/`

- **This pass** (`polish-1-fleet.jpg` to `polish-7-motion.jpg`): the last pass (git 5d39f7bb) beside this one, for the seven areas the founder named: fleet lower tiles, Client 360 lower panels and nested detail, bookkeeping detail states, the compliance calendar and tabs, mobile drawers, text fit, and motion. They come from `workspaces/polish-boards.mjs`.
  - `polish-6-text.jpg` prints the counts of the text audit, run on both builds.
  - `polish-7-motion.jpg` shows frames from the recordings.
  - `polish-audit.json` holds the raw counts.
- **Diagnosis** (`diagnosis-1-one-template.jpg` to `diagnosis-5-client.jpg`): what was wrong with the Batch 1 deeper pages.
- **Since Batch 1** (`before-after-{fleet,books,comp,client}.jpg`): the same records as Batch 1 drew them, next to the current workspace. They come from `workspaces/boards.mjs`.
- **Family check** (`family-roots.jpg`): the approved WORK root, unchanged, next to the four workspaces.

## `recordings/`

Twelve interactions, each recorded with real clicks in Chromium on both builds by `workspaces/record.mjs`. Each is saved as `NN-before` and `NN-after`, in both `.mp4` and `.webm`. The files also include a poster frame (`NN-poster.jpg`), and `recordings-{before,after}.json` with the click times.

The twelve interactions:

1. Fleet vehicle selection
2. Connection detail
3. Client service selection
4. Drill-down and return
5. Bookkeeping step
6. Bookkeeping drawer
7. Compliance deadline
8. Issue detail
9. Action confirmation
10. Mobile drawer
11. Mobile tabs
12. Reduced motion

Interaction 08's ALSO DUE step does not exist in the last pass, so it is marked missing there.

The founder's own screen recording was not available to this work. The same states were captured directly instead.

## `screens/`

There are 35 captures from `workspaces/qa.mjs`:

- **Every workspace at all four sizes**: `{fleet,books,comp,client}--{phone,tablet,desktop,wide}.jpg`
- **Desktop states**: selected, context and action states.
- **Bookkeeping**: the ANNUAL cadence (`books--desktop--annual.jpg`).
- **Phone drawers**: `--phone--context` captures.
- **Tablet**: the client directory as a side drawer.
- **Staff view of Client 360**: `client--desktop--staff.jpg`.
- **The review itself**: the landing on desktop and phone, the BEFORE view, and a playing recording.

## `qa-summary.json`

This is the result of every check `qa.mjs` ran: 258 run and 0 failed.

It covers everything listed below:

- **The earlier checks**: draws, handlers, dead controls, uppercase, overflow, one-screen fit, journeys, roles, shell, review chrome, and TRY demonstrations.
- **Keyboard reach** for every control.
- **The motion tokens**, checked against the brief's ranges.
- **Selections**: they update in place, and nothing runs longer than 350 ms or pulses.
- **Drawers**:
  - They have a role, a label and modality.
  - They slide in, take focus and hold Tab.
  - They close on Escape and leave with motion, then return focus.
  - They close from the keyboard.
  - A change made during the exit wins.
- **Reduced motion**: no slide, an instant close, and an instant confirmation.
- **MONTHLY / ANNUAL**, with no invented annual data.
- **The text audit** (`workspaces/audit.mjs`): 79 panel, tab, record and drawer states at 390, 834, 1440 and 2560 px. It fails on any of these:
  - wrap
  - clip
  - overlap
  - unreachable truncation
  - text below 9 px
  - unintended sideways scroll
