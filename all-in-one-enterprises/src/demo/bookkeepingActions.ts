import type { BookkeepingAssessmentAnswers, BookkeepingRecommendationResult } from '../bookkeeping/bookkeepingTypes';
import { recommendBookkeepingPlan } from '../bookkeeping/bookkeepingRecommendation';
import {
  BOOKKEEPING_ASSESSMENT_STORAGE_KEY,
  BOOKKEEPING_RECOMMENDATION_STORAGE_KEY,
} from '../bookkeeping/bookkeepingConfig';
import type { DemoStore } from './demoTypes';
import { updateDemoStore } from './demoStore';

export function getOrganizationId(store: DemoStore): string {
  return store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
}

export function getBookkeepingSubscription(orgId: string, store: DemoStore) {
  return store.bookkeepingSubscriptions?.find((s) => s.organizationId === orgId);
}

export function getBookkeepingCycles(orgId: string, store: DemoStore) {
  return (store.bookkeepingCycles ?? []).filter((c) => c.organizationId === orgId);
}

export function getBookkeepingReports(orgId: string, store: DemoStore) {
  return (store.bookkeepingReports ?? []).filter((r) => r.organizationId === orgId);
}

export function getBooksRescue(orgId: string, store: DemoStore) {
  return store.booksRescueEngagements?.find((e) => e.organizationId === orgId);
}

export function getOfficeBookkeepingMetrics(store: DemoStore) {
  const subs = store.bookkeepingSubscriptions ?? [];
  const cycles = store.bookkeepingCycles ?? [];
  const rescue = store.booksRescueEngagements ?? [];
  const leads = store.bookkeepingLeads ?? [];
  return {
    active: subs.filter((s) => s.status === 'active').length,
    onboarding: subs.filter((s) => s.status === 'onboarding').length,
    booksRescue: rescue.filter((r) => !['complete', 'cancelled'].includes(r.status)).length,
    waitingDocuments: cycles.filter((c) => ['documents_requested', 'waiting_on_customer'].includes(c.status)).length,
    reconciliation: cycles.filter((c) => ['reconciliation', 'staff_review'].includes(c.status)).length,
    reportsDue: cycles.filter((c) => ['reports_prepared'].includes(c.status)).length,
    overdue: store.bookkeepingCounters?.overdueCycles ?? 0,
    pricingReview: leads.filter((l) => l.status === 'pricing_review').length,
    newLeads: leads.filter((l) => l.status === 'new' || l.status === 'assessment_complete').length,
  };
}

export function saveAssessmentToSession(
  answers: BookkeepingAssessmentAnswers,
  billingInterval: BookkeepingRecommendationResult['billingInterval'] = 'MONTHLY',
): BookkeepingRecommendationResult {
  const result = recommendBookkeepingPlan(answers, billingInterval);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(BOOKKEEPING_ASSESSMENT_STORAGE_KEY, JSON.stringify(answers));
    sessionStorage.setItem(BOOKKEEPING_RECOMMENDATION_STORAGE_KEY, JSON.stringify(result));
  }
  return result;
}

export function loadAssessmentFromSession(): BookkeepingAssessmentAnswers | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(BOOKKEEPING_ASSESSMENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BookkeepingAssessmentAnswers;
  } catch {
    return null;
  }
}

export function loadRecommendationFromSession(): BookkeepingRecommendationResult | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(BOOKKEEPING_RECOMMENDATION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BookkeepingRecommendationResult;
  } catch {
    return null;
  }
}

export function requestBookkeepingService(
  orgId: string,
  plan: BookkeepingRecommendationResult['recommendedPlan'],
  billingInterval: BookkeepingRecommendationResult['billingInterval'],
) {
  updateDemoStore((s) => {
    const existing = s.bookkeepingSubscriptions?.find((x) => x.organizationId === orgId);
    if (existing) {
      existing.plan = plan;
      existing.billingInterval = billingInterval;
      existing.status = 'pending_payment';
      existing.updatedAt = new Date().toISOString();
      return s;
    }
    s.bookkeepingSubscriptions = s.bookkeepingSubscriptions ?? [];
    s.bookkeepingSubscriptions.push({
      id: `bk-sub-${orgId}-${Date.now()}`,
      organizationId: orgId,
      plan,
      billingInterval,
      basePriceMinor: 0,
      currency: 'USD',
      status: 'pending_payment',
      booksRescueRequired: false,
      customerStatusLabel: 'Getting Started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return s;
  });
}

export function submitBookkeepingLead(answers: BookkeepingAssessmentAnswers, email?: string) {
  const recommendation = recommendBookkeepingPlan(answers);
  updateDemoStore((s) => {
    s.bookkeepingLeads = s.bookkeepingLeads ?? [];
    s.bookkeepingLeads.unshift({
      id: `bk-lead-${Date.now()}`,
      contactEmail: email,
      assessment: answers,
      recommendation,
      status: recommendation.customReviewRequired ? 'pricing_review' : 'assessment_complete',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (s.bookkeepingCounters) s.bookkeepingCounters.leads = s.bookkeepingLeads.length;
    return s;
  });
  return recommendation;
}
