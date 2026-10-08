# Client migration — founder review mocks

Static, self-contained copies of the six representative client-migration screens, captured from the live app with the founder icon sheet and the uppercase law applied. The renderer is unit-based (1u = 1px of the 853×1536 authority frame). Phones see the authority composition. Tablets (≥700px) and desktops (≥1120px) see the derived layout described in `docs/AIO_CLIENT_MIGRATION_AUTHORITY_RECOVERY.md`. Open a link on a phone, a tablet and a desktop browser, or resize the window, to review all three.

## All screens (flow prototype)

https://claude.ai/artifact/1rPbngoDNkMNwTg695HUZQ — the real migration screens running on demo data, not pictures. A tree on the left lists all 41 built screens by branch (existing client, client activation, new client, bulk batch). The stage runs the selected screen at phone (390), tablet (834) or desktop (1440) width, and every button works. The inspector shows each screen's expected exits (tested or not yet), where you arrived from, chevrons that look tappable but do nothing, an outbox that catches activation invites (open one to continue as the client), the authority frame, links that leave client migration, and the gaps found while wiring the flow. The meter counts screens reached by clicking. The test record stays in the viewer's browser; CLEAR TEST RECORD resets it.

**MOCK DATA** (switch in the top bar, on by default, remembered per browser) turns the entry gates off: on arrival each screen gets what a person would otherwise supply (the client is picked, a small mock PDF is added through the screen's own file input, forms, email and password are typed, extraction and batch processing are finished, MATCH TO EXISTING and KEEP AIO are chosen, the required client review sections are answered LOOKS RIGHT, the bulk batch gets its four demo clients), so CONTINUE always moves on. The inspector's MOCK DATA ON THIS SCREEN card lists exactly what was filled. APPROVE MIGRATION needs the match chosen in the same page, so after a jump past MATCH mock data goes back through it first and says so. Switch it off and every gate is live. Code: `src/prototype/migrationMockData.ts` (prototype only; the app's checks are unchanged).

Rebuild with `npm run migration:prototype` (→ `.migration-mocks/aio-migration-flow.html`, entry `prototype/migration-app.html`, app `src/prototype/migrationFlowPrototype.tsx`, navigator `scripts/migration/flow-prototype-template.html`) and republish to the same link. Version 2 of that link was the static gallery; `npm run migration:gallery` still builds it.

## The six representatives

| Screen | Live route | Authority | Actor | Published link |
|---|---|---|---|---|
| Migration intake (root) | `/office/migration` | AIO-MIG-ROOT-001 | Staff intake | https://claude.ai/artifact/74jt6mCfA3hnLBQeUKVKF1 |
| Existing client file | `/office/migration/existing` | AIO-MIG-EXISTING-SELECT-001 | Staff intake | https://claude.ai/artifact/TVtSskzAXy9BN8n7MSdqDW |
| Extracting and classifying | `/office/migration/extract` | AIO-MIG-EXISTING-EXTRACT-001 | Staff intake | https://claude.ai/artifact/4EwFCHwjmT5ipo43oVtZNJ |
| Files received | `/office/migration/received` | AIO-MIG-EXISTING-RECEIVED-001 | Staff intake | https://claude.ai/artifact/BFJtYoiXnyPLXukaL1f3A7 |
| Company review | `/portal/activation/review#company` | AIO-MIG-ACTIVATION-COMPANY-001 | Client, not active yet (no staff dock) | https://claude.ai/artifact/4cWJK8TF8dmr3WRPCuJX8p |
| Welcome to your office | `/portal/activation/review#done` | AIO-MIG-ACTIVATION-COMPLETE-002 | Client, lifecycle ACTIVE (no staff dock) | https://claude.ai/artifact/3K9HLnJFT2vb8cyWDHcxUG |

Demo data: Heartland Freight Co. (`client-b`). EXTRACTING and FILES RECEIVED use a sample batch, and FILES RECEIVED adds three unsupported files through the real file input. All of this lives only in the capture's browser profile. Links and buttons are inactive in a mock. Each file names the commit it was built from (`<!-- migration-mock: … -->` and the line at the foot of the page).

## Rebuild and republish

```bash
cd all-in-one-enterprises
npm run migration:mocks      # → .migration-mocks/aio-migration-<screen>.html (git-ignored); starts its own dev server if none is running
```

The links do not follow `master` by themselves. A Claude session republishes each file to its link above using the Artifact tool with `url` set to that link. The link stays the same, and open viewers get the new version.
