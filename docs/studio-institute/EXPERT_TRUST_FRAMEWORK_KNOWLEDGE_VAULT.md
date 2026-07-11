# Expert Trust Framework™ + Knowledge Vault™ (Studio Institute v1.1)

Extends Expert Capture with institutional trust, legal placeholders, and a permanent secure archive — without redesigning the interview system.

## Expert Trust Framework™

Appears **before every new interview** (after landing, before recording):

1. **Protecting Your Expertise** — 10 animated glass protection cards (confidentiality, ownership, training scope, versioning, audit trail, encryption, review-before-training, continuous updates, access control, withdrawal rights)
2. **Institutional Agreements** — 5 scrollable agreements with checkbox + electronic signature (legal placeholders only — attorney review pending)
3. **Knowledge Vault gate** — vault intro with continue to interview setup
4. **Session confirmation** — existing consent recap (unchanged retention/rights copy)

Session meta: `trustFramework` on `ExpertCaptureSessionMeta`.

## Knowledge Vault™

Permanent expert archive (not the worker). Route examples:

| Route | Purpose |
|-------|---------|
| `/expert-capture/knowledge-vault` | Vault homepage |
| `/expert-capture/trust-dashboard` | Owner trust metrics |
| `/expert-capture/living-worker` | Worker evolution + continuous education |
| `/expert-capture/tax-preparation/knowledge-vault` | Tax-scoped vault |
| `/expert-capture/all-in-one-permitting/knowledge-vault` | Permitting-scoped vault |

Vault sections (22): recordings, transcripts, published/draft/retired knowledge, version history, audit, exports, legal agreements, trust settings, etc.

## Worker isolation

Each profile defines `workerDefinition.workerDisplayName` with `{organization}` token. Proprietary knowledge never crosses organization boundaries — enforced in `worker-isolation.ts`.

## Modules

| Path | Role |
|------|------|
| `trust-vault/types.ts` | Canonical trust + vault types |
| `trust-vault/protection-cards.ts` | Protection card content |
| `trust-vault/agreements.ts` | Agreement placeholders |
| `trust-vault/worker-isolation.ts` | Org-scoped worker manifest |
| `trust-vault/audit-log.ts` | Local audit trail |
| `trust-vault/vault-builder.ts` | Vault snapshot, timeline, dashboard, living worker |
| `trust-vault/vault-exports.ts` | JSON export downloads |

## Integration

- `useExpertCaptureSession`: `completeTrustWelcome`, `signTrustAgreements`, `completeVaultGate`
- Interview nav: Knowledge Vault, Trust Dashboard, Owner Mirror
- Builds on Living Knowledge Mirror™ (`KnowledgeProgram`) for published knowledge and competencies

## Tests

```bash
npm run test -- src/studio-os-core/expert-capture/trust-vault/trust-vault.test.ts
```

## Deployment

https://fsbw.vercel.app/expert-capture/tax-preparation/knowledge-vault
