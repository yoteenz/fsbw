# Start Your Business Journey

**Refinement 06** · Canonical startup milestone map

---

## Milestones

| # | ID | Title | Purpose | Primary route |
|---|-----|-------|---------|---------------|
| 01 | build | BUILD | Form business entity (LLC / INC) | `/start-your-business/build` |
| 02 | authorize | AUTHORIZE | USDOT, operating authority | `/services/operating-authority-assistance` |
| 03 | protect | PROTECT | Commercial trucking insurance | `/services/insurance` |
| 04 | register | REGISTER | IRP, IFTA, UCR, tags, HVUT | `/start-your-business/register` |
| 05 | activate | ACTIVATE | BOC-3, MCS-150, compliance filings | `/start-your-business/activate` |
| 06 | roll | ROLL | Operate & grow (optional) | `/start-your-business/roll` |

---

## BUILD subflow

- **LLC** → `get-started?goal=llc-formation-assistance`
- **Corporation / INC** → `get-started?goal=inc-formation-assistance`
- **Already have business** → Road Ready public profile update

Completion: Road Ready keys `business_formation`, `business_structure`, `ein_status` → `completed`

---

## REGISTER sub-journey

Applicable sub-steps (Road Ready driven):

- IRP, IFTA, UCR, Tags/Plates, HVUT (optional), Title (optional)

Each sub-step links to existing service catalog slug with journey context.

---

## ACTIVATE sub-journey

- BOC-3, MCS-150, Drug & Alcohol Consortium, Clearinghouse, DQ Files, ELD (optional)

---

## ROLL transition

Operational recommendations only — dispatch, factoring, brokerage, bookkeeping, fleet, compliance calendar. **Not legal requirements.**

---

## Dependencies

Non-linear where business logic allows. Insurance intake may begin while authority processes. No artificial global lock on future milestones.

---

## Status mapping

Road Ready `RoadReadyItemStatus` → customer-facing `JourneyStepStatus` via `journeyStatusMap.ts`.

---

## Config source

`src/journeys/startBusinessJourneyConfig.ts`

Hook: `useStartBusinessJourney()`
