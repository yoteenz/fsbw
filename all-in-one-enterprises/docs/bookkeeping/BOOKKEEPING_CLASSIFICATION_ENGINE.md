# Bookkeeping Classification Engine

## Entry point

`classifyBookkeepingTransaction()` in `src/bookkeeping/autopilot/classificationEngine.ts`

## Classification sources

MERCHANT_RULE, CUSTOMER_RULE, ORGANIZATION_RULE, HISTORICAL_MATCH, TRANSACTION_PATTERN, DOCUMENT_MATCH, LOAD_MATCH, TRUCK_MATCH, PROVIDER_CATEGORY, MODEL_SUGGESTION, STAFF_OVERRIDE, CUSTOMER_CONFIRMATION

## Confidence states

VERY_HIGH, HIGH, MEDIUM, LOW, UNCLASSIFIED

## Review mapping

| Confidence | Review state |
|------------|--------------|
| VERY_HIGH / HIGH | AUTO_APPROVABLE |
| MEDIUM | REVIEW_REQUIRED |
| LOW | STAFF_APPROVAL_REQUIRED |
| UNCLASSIFIED | CUSTOMER_CLARIFICATION |

## Merchant rules

Configurable in `src/bookkeeping/autopilot/chartOfAccounts.ts` — not hard-coded in UI components.

Customer-specific rules scoped by `organizationId` — never global without approval.

## Explanation

Every classification retains: source, confidence, rule reference, reason string.

## Overrides

Staff and customer clarifications update final category with audit trail (`ClassificationAuditEntry`).
