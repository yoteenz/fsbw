# FleetCare Legal Review Gates

**Status:** NOT COMPLETE — architecture hooks only; awaiting business/legal review.

| # | Gate | Software support | Review required |
|---|------|------------------|-----------------|
| 1 | FleetCare Customer Terms | `fleetcareLegalHooks.customerTermsVersion` | Yes |
| 2 | FleetCare Provider Agreement | `provider_agreement_version` on provider record | Yes |
| 3 | Referral / non-circumvention policy | `lead_attribution_window_days` (nullable config) | Yes |
| 4 | Pre-existing customer policy | `aio_fleetcare_preexisting_relationships` + review workflow | Yes |
| 5 | Marketplace payment structure | Phase 1: direct pay provider; hooks for future processor | Yes |
| 6 | Tax / accounting treatment | Referral transaction records only | Yes |
| 7 | Provider insurance requirements | `aio_service_provider_insurance` + requirement matrix config | Yes |
| 8 | Provider credential requirements | Jurisdiction-aware credential records | Yes |
| 9 | State-specific provider compliance | Eligibility config hooks — no hardcoded state rules | Yes |
| 10 | Roadside / towing requirements | Service taxonomy flags only | Yes |
| 11 | Privacy / data-sharing language | Job-scoped release + disclosure components | Yes |
| 12 | Provider verification language | Verification states — no "guaranteed workmanship" copy | Yes |
| 13 | Warranty responsibility | Job-level warranty fields on provider | Yes |
| 14 | Dispute / cancellation policy | Dispute + cancellation records; fees configurable | Yes |
| 15 | Review / rating policy | Reviews tied to completed jobs only | Yes |
| 16 | Sponsored placement disclosure | Matching metadata fields reserved | Yes |
| 17 | Record retention | Audit events + document retention via vault | Yes |
| 18 | Electronic acceptance | Agreement acceptance timestamps on provider application | Yes |

**Do not mark any gate complete in product UI until legal approves corresponding copy and policy.**
