import { buildAutopilotDashboard, computeAutopilotCoverage, groupClarificationsForDigest } from '../bookkeeping/autopilot/exceptionQueue';
import { planDisplayName } from '../bookkeeping/bookkeepingRecommendation';
import type { AutopilotClientSummary, BookkeepingException } from '../bookkeeping/autopilot/autopilotTypes';
import type { DemoStore } from './demoTypes';

export function getFinancialConnections(orgId: string, store: DemoStore) {
  return (store.financialConnections ?? []).filter((c) => c.organizationId === orgId);
}

export function getFinancialAccounts(orgId: string, store: DemoStore) {
  return (store.financialAccounts ?? []).filter((a) => a.organizationId === orgId);
}

export function getBookkeepingPeriods(orgId: string, store: DemoStore) {
  return (store.bookkeepingPeriods ?? []).filter((p) => p.organizationId === orgId);
}

export function getBookkeepingExceptions(orgId: string, store: DemoStore) {
  return (store.bookkeepingExceptions ?? []).filter((e) => e.organizationId === orgId);
}

export function getCustomerClarifications(orgId: string, store: DemoStore) {
  return (store.customerClarifications ?? []).filter((c) => c.organizationId === orgId);
}

export function getAllOpenExceptions(store: DemoStore): BookkeepingException[] {
  return (store.bookkeepingExceptions ?? []).filter((e) => e.status === 'open');
}

export function buildClientAutopilotSummaries(store: DemoStore): AutopilotClientSummary[] {
  const subs = store.bookkeepingSubscriptions ?? [];
  return subs
    .filter((s) => s.status === 'active' || s.status === 'onboarding')
    .map((s) => {
      const client = store.clients.find((c) => c.id === s.organizationId);
      const period = (store.bookkeepingPeriods ?? []).find((p) => p.organizationId === s.organizationId);
      const clarifications = getCustomerClarifications(s.organizationId, store).filter((c) => c.status === 'pending');
      const coverage = period ? computeAutopilotCoverage(period) : 0;
      return {
        organizationId: s.organizationId,
        companyName: client?.companyName ?? s.organizationId,
        plan: planDisplayName(s.plan),
        currentPeriodLabel: period?.label ?? s.currentPeriodLabel ?? '—',
        autopilotStatus: period?.status ?? 'WAITING_FOR_DATA',
        autopilotCoveragePct: period?.autopilotCoveragePct ?? coverage,
        autoClassifiedCount: period?.autoClassifiedCount ?? 0,
        needsReviewCount: period?.reviewCount ?? 0,
        waitingOnCustomerCount: clarifications.length,
        reconciliationStatus: period?.reconciliationStatus ?? 'NOT_STARTED',
        reportStatus: period?.reportStatus ?? 'DRAFT',
      };
    });
}

export function getAutopilotDashboardMetrics(store: DemoStore) {
  const clients = buildClientAutopilotSummaries(store);
  const exceptions = getAllOpenExceptions(store);
  return buildAutopilotDashboard(clients, exceptions);
}

export function getClarificationDigest(orgId: string, store: DemoStore) {
  return groupClarificationsForDigest(getCustomerClarifications(orgId, store));
}
