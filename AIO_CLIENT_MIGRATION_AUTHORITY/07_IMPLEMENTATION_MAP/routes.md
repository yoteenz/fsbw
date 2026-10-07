# Implementation map

Live UI is React. Authority PNGs are visual truth only.

| Authority | Route | Component |
| --- | --- | --- |
| Root and staff branches A, C, D | `/office/migration` and `/office/migration/:screen` | `MigrationStudioPage` outside the office chrome |
| Activation branch B | `/portal/activation/review` | `ClientOfficeReviewPage` outside the portal chrome |

Staff intake is linked from the archive migration dashboard. Approval calls `approveMigrationBatchForOffice` and must land on PREBUILT. Invite calls `sendClientActivationInvite` and requires PREBUILT. Client confirm calls `confirmAndActivateClient` or `supabaseConfirmActivation` and is the step that can become ACTIVE.

Photographic heroes: `/migration/hero-root.jpg` and `/migration/hero-existing.jpg`.
