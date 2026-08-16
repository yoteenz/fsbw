import type {
  AutopilotDashboardMetrics,
  AutopilotClientSummary,
  BookkeepingException,
  BookkeepingPeriod,
  BookkeepingTransaction,
  CustomerClarification,
} from './autopilotTypes';

export function buildAutopilotDashboard(
  clients: AutopilotClientSummary[],
  exceptions: BookkeepingException[],
): AutopilotDashboardMetrics {
  const openExceptions = exceptions.filter((e) => e.status === 'open');
  return {
    activeClients: clients.length,
    readyToClose: clients.filter((c) => c.autopilotStatus === 'READY_TO_CLOSE').length,
    waitingOnCustomer: clients.filter((c) => c.waitingOnCustomerCount > 0).length,
    exceptionsFound: openExceptions.length,
    autoClassifiedTotal: clients.reduce((s, c) => s + c.autoClassifiedCount, 0),
    reviewRequiredTotal: clients.reduce((s, c) => s + c.needsReviewCount, 0),
  };
}

export function computeAutopilotCoverage(period: BookkeepingPeriod): number {
  if (period.transactionCount === 0) return 0;
  return Math.round((period.autoClassifiedCount / period.transactionCount) * 100);
}

export function periodReadyToClose(period: BookkeepingPeriod, openExceptionCount: number): boolean {
  if (openExceptionCount > 0) return false;
  return period.reconciliationStatus === 'MATCHED' && period.reviewCount === 0;
}

export function groupClarificationsForDigest(items: CustomerClarification[]): { count: number; label: string } {
  const pending = items.filter((i) => i.status === 'pending');
  return {
    count: pending.length,
    label: pending.length === 1 ? '1 item needs your help' : `${pending.length} items need your help`,
  };
}

export function filterTransactionsNeedingReview(transactions: BookkeepingTransaction[]): BookkeepingTransaction[] {
  return transactions.filter((t) => t.reviewState !== 'AUTO_APPROVABLE' && t.status !== 'excluded');
}
