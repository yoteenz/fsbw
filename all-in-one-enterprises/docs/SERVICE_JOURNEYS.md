# All In One — Service Journeys

**Sprint:** 14  
**Type:** `ServiceJourney` in `workflowTypes.ts`

---

## Purpose

A **Service Journey** groups multiple independent workflow instances under one customer-facing roadmap.

Example: **Start My Trucking Business**

- Business Formation workflow
- USDOT workflow
- Operating Authority workflow
- BOC-3, Insurance, IRP, IFTA (locked/future in demo)

Each service remains an independent workflow instance with its own template version pin.

---

## vs Road Ready

| | Service Journey | Road Ready |
|--|-----------------|------------|
| Question | What services is All In One helping complete? | What requirements are tracked for this business? |
| Progress | Service process progress | Requirement verification state |
| Legal meaning | **None** — process tracking only | Verification per Road Ready rules |

---

## Customer roadmap

Route: `/debug/all-in-one/portal/roadmap`

Displays journey items with customer-friendly states:

NOT STARTED · READY · IN PROGRESS · WAITING ON YOU · ALL IN ONE IS WORKING · WAITING EXTERNALLY · COMPLETE · NOT NEEDED

Raw workflow states are not shown.

---

## Journey dependencies

Templates may define dependencies between workflow milestones (e.g. formation completion unlocks USDOT). Configurable — not hard-coded legal assumptions.

---

## Demo seed

`journey-client-a-startup` links Operating Authority (v1, external wait) and USDOT (waiting on customer) for Summit Ridge Transport demo org.
