# Client migration — founder review mocks

Static, self-contained copies of the six representative client-migration screens, captured from the live app with the founder icon sheet and the uppercase law applied. The renderer is unit-based (1u = 1px of the 853×1536 authority frame). Phones see the authority composition. Tablets (≥700px) and desktops (≥1120px) see the derived layout described in `docs/AIO_CLIENT_MIGRATION_AUTHORITY_RECOVERY.md`. Open a link on a phone, a tablet and a desktop browser, or resize the window, to review all three.

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
