import { dollarsToMinor } from '../billing/money';
import type {
  BookkeepingCounters,
  BookkeepingCycle,
  BookkeepingLead,
  BookkeepingReport,
  BookkeepingSubscription,
  BooksRescueEngagement,
} from '../bookkeeping/bookkeepingTypes';
import { daysAgo } from './dateHelpers';

export function createBookkeepingSeedData(): {
  subscriptions: BookkeepingSubscription[];
  cycles: BookkeepingCycle[];
  reports: BookkeepingReport[];
  booksRescue: BooksRescueEngagement[];
  leads: BookkeepingLead[];
  counters: BookkeepingCounters;
} {
  const subscriptions: BookkeepingSubscription[] = [
    {
      id: 'bk-sub-b',
      organizationId: 'client-b',
      plan: 'PLUS',
      billingInterval: 'MONTHLY',
      basePriceMinor: dollarsToMinor(449),
      finalPriceMinor: dollarsToMinor(449),
      currency: 'USD',
      status: 'active',
      startedAt: daysAgo(90),
      renewalDate: daysAgo(-15),
      booksRescueRequired: false,
      assignedStaffId: 'staff-8',
      currentPeriodLabel: 'August 2026',
      cycleStatus: 'reconciliation',
      customerStatusLabel: 'Books In Progress',
      latestReportAt: daysAgo(32),
      createdAt: daysAgo(95),
      updatedAt: daysAgo(1),
    },
    {
      id: 'bk-sub-c',
      organizationId: 'client-c',
      plan: 'ALL_IN_ONE',
      billingInterval: 'ANNUAL',
      basePriceMinor: dollarsToMinor(7490),
      finalPriceMinor: dollarsToMinor(7490),
      currency: 'USD',
      status: 'active',
      startedAt: daysAgo(200),
      renewalDate: daysAgo(-165),
      booksRescueRequired: false,
      assignedStaffId: 'staff-8',
      reviewerStaffId: 'staff-1',
      currentPeriodLabel: 'August 2026',
      cycleStatus: 'reports_delivered',
      customerStatusLabel: 'Reports Ready',
      latestReportAt: daysAgo(3),
      createdAt: daysAgo(210),
      updatedAt: daysAgo(3),
    },
    {
      id: 'bk-sub-a',
      organizationId: 'client-a',
      plan: 'ESSENTIALS',
      billingInterval: 'MONTHLY',
      basePriceMinor: dollarsToMinor(249),
      currency: 'USD',
      status: 'onboarding',
      booksRescueRequired: true,
      booksRescueStatus: 'in_progress',
      assignedStaffId: 'staff-8',
      customerStatusLabel: 'Getting Started',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(1),
    },
  ];

  const cycles: BookkeepingCycle[] = [
    {
      id: 'bk-cycle-b-1',
      subscriptionId: 'bk-sub-b',
      organizationId: 'client-b',
      periodLabel: 'August 2026',
      status: 'reconciliation',
      dueDate: daysAgo(-5).slice(0, 10),
      assignedStaffId: 'staff-8',
    },
    {
      id: 'bk-cycle-c-1',
      subscriptionId: 'bk-sub-c',
      organizationId: 'client-c',
      periodLabel: 'August 2026',
      status: 'reports_delivered',
      reportsDeliveredAt: daysAgo(3),
      assignedStaffId: 'staff-8',
    },
  ];

  const reports: BookkeepingReport[] = [
    {
      id: 'bk-rpt-c-1',
      organizationId: 'client-c',
      subscriptionId: 'bk-sub-c',
      periodLabel: 'July 2026',
      reportType: 'profit_loss',
      plan: 'ALL_IN_ONE',
      preparedFor: 'Heartland Freight LLC',
      generatedAt: daysAgo(3),
      documentId: 'doc-bk-1',
      status: 'delivered',
    },
    {
      id: 'bk-rpt-c-2',
      organizationId: 'client-c',
      subscriptionId: 'bk-sub-c',
      periodLabel: 'July 2026',
      reportType: 'fleet_profitability',
      plan: 'ALL_IN_ONE',
      preparedFor: 'Heartland Freight LLC',
      generatedAt: daysAgo(3),
      status: 'delivered',
    },
  ];

  const booksRescue: BooksRescueEngagement[] = [
    {
      id: 'bk-rescue-a',
      organizationId: 'client-a',
      status: 'in_progress',
      monthsBehind: '3_6_months',
      accountCount: 2,
      transactionComplexity: '50_150',
      accountingSoftware: 'QuickBooks Online',
      quoteMinor: dollarsToMinor(749),
      recommendedPlanAfter: 'ESSENTIALS',
      assignedStaffId: 'staff-8',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(1),
    },
  ];

  const leads: BookkeepingLead[] = [
    {
      id: 'bk-lead-1',
      contactName: 'Demo Lead',
      contactEmail: 'lead@example.com',
      status: 'assessment_complete',
      recommendation: {
        kind: 'plan',
        recommendedPlan: 'PLUS',
        billingInterval: 'MONTHLY',
        booksRescueRequired: false,
        customReviewRequired: false,
        reasons: ['You use factoring', 'You operate multiple trucks'],
      },
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  ];

  const counters: BookkeepingCounters = {
    activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
    onboarding: subscriptions.filter((s) => s.status === 'onboarding').length,
    booksRescue: booksRescue.filter((r) => !['complete', 'cancelled'].includes(r.status)).length,
    pricingReview: leads.filter((l) => l.status === 'pricing_review').length,
    overdueCycles: 1,
    leads: leads.length,
  };

  return { subscriptions, cycles, reports, booksRescue, leads, counters };
}
