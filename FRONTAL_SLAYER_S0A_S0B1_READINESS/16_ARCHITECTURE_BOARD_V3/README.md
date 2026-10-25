# 16 — Founder Approval Board V3

- **Live board (private to its owner until shared):** https://claude.ai/artifact/CpzJCzVGRK5HpEDzz91r82. This is the **same URL** as V2, updated in place. V2's source remains unchanged in `FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL/21_INTERACTIVE_FOUNDER_ARCHITECTURE_BOARD_V2/`. The decision store carries over (it was empty and is still empty).
- **Source:** `index.html` (self-contained). Generated from `evidence/generator/` (`parity.cjs`, `triage.cjs`, `build_board_v3.cjs`).

## Views

| View | Contents |
|---|---|
| Overview | What needs the founder now: counts, Wave 1 items with live state, experience authorities, triage summary |
| Experiences | **Three separate trees**: Mobile (account families + entry routes), Desktop/Tablet (Tower floors, rooms, off-tower rooms, hand-offs, legacy), Admin (15 families). Nothing is merged |
| Shared capabilities | 25 capabilities, each showing mobile, desktop/tablet and admin presentation side by side, with the single authoritative record. Filter by desktop presentation type |
| Decisions | All 55 originals + A1a/A1b + D14–D16 + XD-1–XD-3, grouped by approval wave, filterable by classification. Shows options and consequences, the recommendation, the V2 recommendation status, evidence and authority, dependencies and gate |
| Security | S0B-1 migration readiness (M1A, M2, M3 ready for review; M1B blocked), six critical risks, outstanding evidence |
| Sprints | Gate matrix with founder decisions per sprint and recorded progress |
| Export | Manifest in the doc 17 shape; copy or save |

## Decision states (truthful by construction)

| State | Shown when |
|---|---|
| RECOMMENDED | Default for every decision that is not blocked |
| SELECTED — NOT RECORDED | A non-owner (or a view without the store) picked an option. Kept on that device only, with **no authority** |
| FOUNDER APPROVED / FOUNDER REJECTED / DEFERRED | **Only** after the artifact owner presses RECORD **and** the store's live snapshot returns the saved record |
| BLOCKED | Classification 4, or A1b before A1a and staging evidence. Recording is disabled |
| IMPLEMENTED / VERIFIED | Reserved for later sprints; never set by this board |

Access rule: everyone with access reads; **only the artifact owner writes** (`db` rule `read: view, write: owner`).

**Implementation authority still comes from the repository.** Export the manifest and commit it (doc 17).
