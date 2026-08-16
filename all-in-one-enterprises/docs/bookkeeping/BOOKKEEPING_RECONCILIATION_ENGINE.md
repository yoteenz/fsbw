# Bookkeeping Reconciliation Engine

## Account reconciliation

`runAccountReconciliation()` — AIO-native layer independent of QuickBooks/Xero UI automation.

```
OPENING + PERIOD TRANSACTIONS = EXPECTED ENDING
compare vs VERIFIED ENDING
```

Statuses: NOT_STARTED, IN_PROGRESS, MATCHED, DIFFERENCE_FOUND, REVIEW_REQUIRED, APPROVED, CLOSED

## Factoring reconciliation

`reconcileFactoringSettlement()` — ensures advance, fee, and reserve reconcile to net cash **without double-counting invoice revenue**.

## Transfers

`detectLikelyTransfer()` — same amount, opposite direction, related dates, different owned accounts.

## A/R and A/P

Prepared as draft workflows in autopilot architecture; no autonomous fund movement.

## Close approval

`periodReadyToClose()` requires zero open material exceptions and MATCHED reconciliation.
