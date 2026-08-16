# Safety & Compliance Services — All In One Enterprises

## Services

| Slug | Notes |
|------|-------|
| `drug-alcohol-consortium` | Enrollment workflow; provider per configuration; no lab claims unless configured |
| `fmcsa-clearinghouse-assistance` | Registration/query support; minimize sensitive data |
| `driver-qualification-files` | Document Vault; statuses: COMPLETE, ACTION NEEDED, EXPIRING SOON, IN REVIEW, MISSING — not legal “compliant” unless workflow supports |
| `dot-compliance-support` | Umbrella ongoing support; no guaranteed compliance |
| `dot-audit-support` | Readiness checklist; not FMCSA; no outcome guarantee |
| `new-entrant-audit-support` | New entrant preparation |
| `safety-compliance-programs` | Configurable umbrella; programs activated individually |
| `eld-services` | Setup/partner coordination; AIO does not manufacture ELD hardware |

## Security

- Least-privilege access for driver records
- No sensitive data in general notifications
- DQ and Clearinghouse data not in generic customer profile

## Road Ready

Applicability engine: `src/services/catalog/roadReadyApplicability.ts`  
Integrated in: `src/road-ready/roadReadyRules.ts`

Results: REQUIRED, LIKELY_REQUIRED, RECOMMENDED, OPTIONAL, NOT_APPLICABLE, NEEDS_REVIEW

## Workflow template slugs

See `WORKFLOW_TEMPLATE_SLUGS` in `src/demo/workflowSeed.ts`
