# AIO Client Migration, Activation + Office Provisioning (pointer)

Sprint **P0.AIO.CLIENT-MIGRATION-ACTIVATION-AND-OFFICE-PROVISIONING-ARCHITECTURE1**, SITE00 PR #1409 @ `597513c`. This is architecture only: no page was implemented and no AIO code or data contract was changed.

**Founder decision:** EXISTING-CLIENT ONBOARDING IS NOT ACCOUNT CREATION. It is reconciliation between AIO's existing knowledge and the client's current business truth.

```
LEGACY / PHYSICAL CLIENT FILE → MIGRATION INTAKE → EXTRACTION / CLASSIFICATION → FOUNDER REVIEW → PREBUILT CLIENT PROFILE
→ VAULT ORGANIZATION → OFFICE PROVISIONING → ACTIVATION INVITE → CLIENT REVIEW → WHAT CHANGED? → CLIENT CONFIRMATION
→ ACTIVE CLIENT → ACTIVE WORKSPACES → CONTEXTUAL EXPANSION
```

**PROFILE EXISTS ≠ ACTIVE CLIENT.** A client is ACTIVE only after CONFIRM & ENTER MY OFFICE, with all 8 activation conditions met.

## Source of truth: SITE00
- Generic model: `shared/studioos-experience-brain/client-lifecycle.ts`.
- AIO mapping: `shared/studioos-experience-brain/projects/aio/client-migration.ts`, built from a read-only audit of this repo @ `c88a300`.
- Experience contracts: `AIO.CLIENT_MIGRATION` and `AIO.CLIENT_ACTIVATION` (`projects/aio/migration.ts`).
- 12 generated artifacts in `docs/aio/client-migration/` (regenerate with `npx tsx scripts/studioos/aio-client-migration-export.ts`):

| Artifact | sha256 |
|---|---|
| AIO_CLIENT_IDENTITY_AND_ACTIVATION.json | `bc0b028d013a8ea41616849c1504024c928e38855c7330a2ce770dc986bb0ef9` |
| AIO_CLIENT_LIFECYCLE.json | `1ebd85ef96f8895df7aa58ef9671993cdc519e4b6624dec36fa2bcd66bdf6f00` |
| AIO_CLIENT_MIGRATION_ARCHITECTURE.md | `515901980f5b3eb71f973a207f08cfb8f2ba71d71c26b0f3e3e56d5d0cdce788` (copied here byte-for-byte) |
| AIO_CLIENT_MIGRATION_EVENTS_AND_EXCEPTIONS.json | `a1da8de278cbcbb6d05bed0dba449e8dd091c1c306ce74ca8d8814a08430590b` |
| AIO_CLIENT_MIGRATION_PROOF.md | `862127e24311a5ac55850aaa9a82a45d3272cb33e018747543c072e79c94b027` |
| AIO_EXISTING_CLIENT_FIRST_LOGIN.md | `9f36c68cb44a29490461d3f7f8205365f1c6bca9def5cc6e7f1669e1b60bfb7e` (copied here byte-for-byte) |
| AIO_FOUNDER_CLIENT_STATUS_SURFACES.json | `8951f8788af0021f73e19e0f8adc83a001f20c442d8da1e642ac7fe6444cd4b9` |
| AIO_MIGRATION_PIPELINE_CONTRACT.json | `36afe2e2a01639c7132002d097db1705044033c5c1d3d1dd324582f59ac90b09` |
| AIO_MIGRATION_REVIEW_CONTRACT.json | `d91d4db3652af18afd2af409874aee8f588399bb17851deb38859c02ff2dbc00` |
| AIO_OFFICE_PROVISIONING_CONTRACT.json | `026c4300cb460d94eea4d2ed8940643fefec6a0afef4b142325055e4011dee9d` |
| AIO_VAULT_MIGRATION_LINEAGE.json | `f20d57dca562f78136a89716e97fcf983dd67809c8b550836348376985375f52` |
| FUTURE_AUTHORITY_FAMILIES.md | `eea7890759cfcc997e5bdd261857ef583bdd9dd0c6c8db9b85972d0441813144` |

## What this repo must respect when it implements
- **Lifecycle is one canonical field on the organisation** (proposed `aio_organizations.client_lifecycle`). `Client.accountStatus` is derived from it; `archiveMigrationStatus` means document-vault completeness only.
- **Count active clients with one rule** (lifecycle ACTIVE + every activation condition). Six count sites disagree today: Office Command Center, Management Executive Snapshot, the metric registry, Customer Command Center, the Clients list and the Archive Migration dashboard.
- **Extend Physical Archive Migration** (`/office/archive-migration`) for intake. Do not build a second migration tool, and do not confuse it with the Data Migration Center.
- **Nothing extracted becomes truth without a recorded decision.** APPROVE MIGRATION needs a founder / authorised-staff permission (today any staff can approve) and yields PREBUILT, never ACTIVE.
- **Identity:** client ID `AIO-CUS-######` from `aio_next_customer_number()` (never `AIO-######`, which is the request-number format). Match on USDOT · MC · EIN · VIN; never merge an uncertain match.
- **Activation:** single-use invite (`aio_client_activation_invites`, token hash only) → `/office-activation/:token` → the client sets their own password or uses a magic link → membership is created at acceptance. Passwords are never generated, emailed or texted.
- **Must fix before activation ships:** C11 (RLS self-membership into any org), C8 (self sign-up duplicates a known business), C10 (reset-password redirect), C9 (`ensureOrganizationForUser` never called), portal gating on lifecycle.
- **Held until ACTIVE:** client notifications (the expiration notifier ignores visibility today), deadlines from migrated expiries, Road Ready sync, customer-visible documents.
- **Workspaces:** a staff-confirmed relationship → PENDING_SETUP until ACTIVE; documents alone → WE ALSO KNOW ABOUT … REVIEW NEEDED. Expansion appears AFTER_ACTIVATION only.
