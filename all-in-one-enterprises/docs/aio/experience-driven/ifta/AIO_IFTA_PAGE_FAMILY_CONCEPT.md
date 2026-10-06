# AIO IFTA — Page Family Concept (for founder review)

**Status:** PROPOSED_FOR_FOUNDER_REVIEW · nothing visual implemented
**Review page:** `AIO_IFTA_COMPOSITION_REVIEW.html` (wireframes at mobile / tablet / desktop, state postures, mirror table, decision sheet)
**Structured contracts:** `AIO_IFTA_PAGE_FAMILY_MAP.json` · `AIO_IFTA_PUBLIC_PAGE_CONTRACT.json` · `AIO_IFTA_CLIENT_WORKSPACE_CONTRACT.json` · `AIO_IFTA_STAFF_WORKSPACE_CONTRACT.json` · `AIO_IFTA_STATE_VISUALIZATION_MAP.json` · `AIO_IFTA_RESPONSIVE_CONTRACT.json` · `AIO_IFTA_VISUAL_LANGUAGE_PROPOSAL.json` · `AIO_IFTA_FOUNDER_DECISIONS.json`

## The idea

The quarter is one filing jacket. It has a tab (quarter + due date), a completeness line on its spine, and three compartments: receipts, mileage, vehicles. The same jacket appears to every actor:

PUBLIC specimen → MY OFFICE card → open on the desk in the FILING ROOM → closed with a silver band WITH AIO → under the return summary in the DECISION WINDOW → SEALED in champagne when filed → in the VAULT drawer → replaced on the desk by the NEXT QUARTER. Staff see the same jackets as a queue of cases and open one as a case file.

Grounding: the Brain's primary visual object (the quarter), its secondary metaphor (building a complete filing packet), the packet artifact's view behavior ("single folder object — one tap opens the whole quarter"), composition rules 1 and 6, and the AIO IDNTY brand world (American road and business office: asphalt, paper, cab, dispatch).

## Language

Follows the **locked brand foundation** (forensic sprint): uppercase primary, monogram-only nav (full lockup in intro band and footer), palette obsidian · charcoal · signature gold · platinum/silver · stone white · warm champagne. A dark road office with stone-white paper records. Signature gold appears once per screen for the one decision, and for blockers as an outline with a solid marker, never alarm red. Silver means AIO is working. Champagne is progress and the filing seal. Stone is estimate or archived. Hex values are proposals (D-03); the only typographic proposal is a sentence-case exception inside paper records and message threads (D-05). No photography is needed; the jacket is the hero.

## Shell

The family gets its own slim shell on the existing routes: a road-office bar for clients carrying the monogram only (path answers "where am I"), an operations bar for staff, a family-scoped public bar. The legacy sidebar, bottom nav, grey canvas and office layout are not used. The shells keep everything the old layouts ran: portal evaluations, unread counts, staff identity and permissions.

## Every screen answers five questions

WHERE AM I (bar path) · CURRENT STATE (jacket status line) · WHAT NEEDS ME · WHAT IS AIO DOING · WHAT HAPPENS NEXT (answer line). The lines already exist in the function layer (`nextItemLine`, `aioDoingLine`, `nextStepLine`, `clientStatusLine`, `staffStatusLine`).

## State postures (sprint §14)

| Class | Posture | What changes |
|---|---|---|
| Collecting | Open jacket | Compartments fill on the desk; champagne spine; capture tools in reach; next item leads |
| Blocked | Held | AIO correction slip clipped on top; packet dimmed; gold outline + marker; flags one at a time with the fix inline |
| Review | With AIO | Jacket closed with a silver band naming the reviewer; capture tools gone; AIO-at-work sheet |
| Approval | Decision window | Return summary sheet fills the bench; one gold decision; ask-a-question beside it |
| Filed | Sealed | Workbench collapses to a sealed jacket; confirmation, amount, payment; moves along the Vault path; next quarter at the edge |
| Archived | Filed away | Next quarter is the desk object; archived quarters on a stone history shelf |

## Responsive

Mobile is capture-first for clients (pinned quarter card, one flag at a time, compartments as rows, sticky TAKE PHOTO + the state's one action) and triage-first for staff (never a shrunk desktop). Tablet is review-and-resolve (quarter band + two compartments). Desktop is the three-zone workbench (spine · bench · work rail) for clients and three-zone case file for staff.

## Decisions requested

D-01 family shell · D-02 public chrome · D-03 palette hexes · D-04 availability truth · D-05 sentence case inside records · D-06 monogram source · D-07 imagery · D-08 objects in legacy hosts + Vault drawer route · D-09/D-10/D-11/D-14 Brain updates · D-12 demo anchoring · D-13 Office work items. Details and recommendations: `AIO_IFTA_FOUNDER_DECISIONS.json`.
