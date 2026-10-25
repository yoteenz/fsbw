# 19 — Implementation Gate Matrix

A sprint may start only when **every** cell in its row is satisfied. "Founder" means a decision recorded in the approval manifest (doc 17) or the board's owner-only store, then committed. A selection that is not recorded does not count.

| Sprint | Experience(s) touched | Founder decisions required | Engineering defaults applied | Evidence required | Environment | Security precondition | Verification before release | Current state |
|---|---|---|---|---|---|---|---|---|
| **S0A** (this sprint) | — | — | — | — | — | — | Doc 00 validation | **COMPLETE (planning)** |
| **S0B-1** DB containment | None visually (backend for all three) | **A1a** (rehearse), then **A1b** (production) | H3 rules; ENG version and transaction rules | V0 precheck; U-22 backups; U-01 recommended | **Staging (H2)** | — | V1 Part A + B; C1–C9 (doc 09 §4); SITE00/JURNL smoke (doc 11 §4); 24h log watch | **BLOCKED**: H2 evidence, A1a |
| **S0B-1b** (later) M1B + trigger hygiene | — | — | — | **U-01 resolved**; U-21 investigated; SITE00 owner ack | Staging | S0B-1 done | Same as S0B-1 + signup across 3 products | BLOCKED: U-01, U-21 |
| **S0B-2** application containment | Mobile checkout, **desktop Acquisition tablet** (same component), admin numbers | **A2, A4, A5, F1** | A3, A6, A7, E2, D16 (voucher wipe), D14 (no fabricated progress), `COMMERCE_CONTAINMENT` flag, fail-closed checkout availability | A8 evidence for remediation only | Staging + Stripe test mode | S0B-1 recommended first (no hard dependency) | Doc 15 §3; each item checked in **both** customer experiences where present | BLOCKED: wave 2 decisions, staging |
| **S1** order of record | All three (records) | **C4** | A9 additive schema | Schema diff (U-06) | Staging | S0B-1 done (orders write policies dropped) | Cross-device and cross-experience order parity (mobile orders, Penthouse "My Orders", admin) | BLOCKED: S0B-1, C4 |
| **S1B** BAW price authority | Mobile Atelier + desktop Atelier zone (logic only) | — (E4, E5 established/default) | E5 single catalogue | — | Staging | S0B-2 BAW interim live | Parity: client total = server total over option combinations | BLOCKED: S1 |
| **S2-M** mobile account core | **Mobile only** | **B1** (mobile tree), B3, B8, G4 (mobile visuals), XD-2 | B5/B6 established | U-08 (mobile) | Staging | S1 | Page Definition of Done (prior package doc 13) at mobile widths | BLOCKED: wave 3 |
| **S2-D** desktop/tablet account access | **Desktop/tablet only** | **XD-1** (and each new desktop presentation separately), XD-2 | EC-4/EC-5 data parity (no visual change) | U-24, U-25 | Staging | S1 | Tower walkthrough at 768–1023 native, ≥1024; no mobile shell imported | BLOCKED: XD-1 |
| **S3** admin core | **Admin only** | **C1** (per page), **C2**, C3, G2, G3 | Fabricated-number removal (from S0B-2) | — | Staging | S1 | API auth + audit per mutation | BLOCKED: wave 3/5 |
| **S4** rewards | All three (ledger) | **D3, D5, D9, D11, D13, D15** (+ B4/D1/D2/D4 established) | D10 fail-closed | U-03 art check | Staging | S1 | Ledger invariants; each experience displays the same balances | BLOCKED: wave 4 |
| **S5** hair, BAW, community | Mobile (MY HAIR) + desktop Analysis Lab (XD-1) + admin | **B2, E1, E3, D7, F2, F4, F5** (E6, F3 established) | E2 | — | Staging | S4 for rewards parts | Per-experience E2E | BLOCKED: wave 4/5 |
| **S6** affiliate, referral, support | All three | **D6, D8, B7**, G5 | — | — | Staging | S4 | Per-experience E2E | BLOCKED: wave 4/5 |
| **S7** verification and launch | All three | **H1** (launch scope per experience), XD-3 | — | U-17, U-18 | Staging → production | All above | Release readiness (prior package doc 19), per experience | BLOCKED |
