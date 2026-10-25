# 20 — Recommended Next Sprints

## Recommended next sprint

**`S0B-1-REHEARSAL`: staging provisioning + S0B-1 database containment rehearsal (no production change).**

| | |
|---|---|
| Starts when | (1) The operator supplies the H2 facts (Supabase plan tier, production domain, Stripe test keys: U-17, U-19, U-20). (2) The founder chooses the staging option (H2) and records **A1a**. (3) The founder acknowledges **H3** and the SITE00 owner agrees to run the smoke test |
| Does | Provisions staging per doc 13 (schema-only, synthetic fixtures, Stripe test mode). Runs V0 → M1A → M2 → M3 → V1 on staging. Runs the doc 14 test plan and the SITE00/JURNL smoke. Investigates U-21 on staging. Produces the evidence pack |
| Does not | Touch production, change application code, apply M1B, change any SITE00 object |
| Exit | Evidence pack attached → founder decides **A1b** (production apply) |
| In parallel | The operator completes the U-01 checklist (doc 12) and the A8 read-only Stripe review |

## Then

| Order | Sprint | Gate (doc 19) | Notes |
|---|---|---|---|
| 2 | **S0B-1-PRODUCTION**: apply M1A, M2, M3 to production | A1b + staging evidence + U-22 backups | About 1 hour plus a 24h log watch. SITE00 owner smoke on site00.com |
| 3 | **S0B-2**: application containment | Wave 2 founder decisions (A2, A4, A5, F1) | Verify each item in mobile checkout **and** the desktop Acquisition tablet |
| 4 | **S0B-1b**: M1B + trigger hygiene + default privileges | U-01 resolved, U-21 investigated, SITE00 owner ack | Cross-product signup tests |
| 5 | **S1**: order of record | C4 | Unblocks S2-M, S2-D, S3 |
| 6 | **S2-M** (mobile) and **S2-D** (desktop/tablet), separately | Wave 3 (B1, XD-1, XD-2) | Two sprints with two design authorities. No shared responsive shell |
| 7 | S3 admin core · S4 rewards · S5 · S6 · S7 | Waves 3–5 | As in doc 19 |

## Founder actions this week (summary)

1. Ask the operator for the three H2 facts and the U-01 checklist (**no keys in chat**).
2. Choose the staging option (H2) and record **A1a**.
3. Acknowledge **H3**. Notify the SITE00 owner (doc 11 §5 hand-off).
4. Optionally start reviewing Wave 2 (A2, A4, A5, F1) so S0B-2 can follow the production apply without a gap.
