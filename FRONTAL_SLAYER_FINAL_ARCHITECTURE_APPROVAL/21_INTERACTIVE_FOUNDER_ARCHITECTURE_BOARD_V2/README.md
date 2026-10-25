# 21 — Interactive Founder Architecture Board V2

- **Live board (private to its owner until shared):** https://claude.ai/artifact/CpzJCzVGRK5HpEDzz91r82
- **Source:** `index.html` in this folder (self-contained; data embedded from the page, workflow and decision models that also generate docs 03, 04, 05, 16 and 20).
- **V1 board is preserved unchanged:** `FRONTAL_SLAYER_ACCOUNT_ADMIN_AUDIT/PAGE_TREE_BOARD.html` and its own artifact link.

## Views

| View | What it shows |
|---|---|
| Overview | Counts, critical path, sprint gates with recorded-decision progress, risk register summary |
| Page tree | CUSTOMER / ADMIN switch; PROPOSED or CURRENT hierarchy; expand/collapse; marker filters (EXISTING, NEW, CONSOLIDATED, RETIRED, BLOCKED, UNVERIFIED); page inspector with status, owner, existing and proposed route, visual preservation, workflows, mirror, backend readiness, missing functionality, risks, decisions and sprint |
| Workflows | The 35 workflows of doc 04 with all 12 columns |
| Founder decisions | 55 decisions in groups A–H: current state, evidence, options with consequences, recommendation, rationale, impact, reversibility, dependencies, gates unblocked, pages affected, recorded status |
| Export | The approval manifest in the doc 20 shape, with copy and save |

## How a decision is recorded (and what does not count)

- Only the **artifact owner** can record a decision. Access rule: everyone with access reads; only the owner writes (`db` rule `read: view, write: owner`). A record stores the option, status (APPROVED / REJECTED / DEFERRED), note, the owner's account id and the time.
- Viewers without write access see recorded decisions read-only.
- When the decision store is unavailable, the page offers **drafts on this device**. Drafts are labelled "not recorded", are exported only under `localDraftsNotRecorded`, and **never count as founder approval**.
- Selecting a radio button records nothing. Only the RECORD DECISION button writes.
- **Implementation authority** comes from the repository: export the manifest and commit it as `20_ARCHITECTURE_APPROVAL_MANIFEST.json`.

## State at publication

The decision store was read once after publishing and is **empty**: 0 of 55 decisions recorded. The write path was not exercised, because a test write would itself look like a founder decision.
