import { describe, expect, it } from 'vitest';
import { recommendBookkeepingPlan } from './bookkeepingRecommendation';
import type { BookkeepingAssessmentAnswers } from './bookkeepingTypes';

function baseAnswers(overrides: Partial<BookkeepingAssessmentAnswers> = {}): BookkeepingAssessmentAnswers {
  return {
    truckCount: 1,
    bankAccountCount: 1,
    creditCardCount: 1,
    monthlyTransactionBand: 'under_50',
    factoringUsed: false,
    driverStructure: 'none',
    needsDriverSettlements: false,
    needsAr: false,
    needsAp: false,
    needsPayrollReconciliation: false,
    needsIftaSupport: false,
    needsTruckProfitability: false,
    wantsMonthlyReview: false,
    booksCurrentness: 'current',
    ...overrides,
  };
}

describe('recommendBookkeepingPlan', () => {
  it('recommends Essentials for simple owner-operator', () => {
    const result = recommendBookkeepingPlan(baseAnswers());
    expect(result.recommendedPlan).toBe('ESSENTIALS');
    expect(result.booksRescueRequired).toBe(false);
    expect(result.customReviewRequired).toBe(false);
  });

  it('recommends Plus for factoring and multiple trucks', () => {
    const result = recommendBookkeepingPlan(
      baseAnswers({ truckCount: 3, factoringUsed: true, needsIftaSupport: true }),
    );
    expect(result.recommendedPlan).toBe('PLUS');
    expect(result.reasons.some((r) => r.includes('factoring'))).toBe(true);
  });

  it('recommends All In One for fleet with A/R, A/P, and settlements', () => {
    const result = recommendBookkeepingPlan(
      baseAnswers({
        truckCount: 6,
        needsAr: true,
        needsAp: true,
        needsDriverSettlements: true,
        needsPayrollReconciliation: true,
        needsTruckProfitability: true,
        wantsMonthlyReview: true,
      }),
    );
    expect(result.recommendedPlan).toBe('ALL_IN_ONE');
  });

  it('routes significantly behind books through Books Rescue first', () => {
    const result = recommendBookkeepingPlan(baseAnswers({ booksCurrentness: '7_12_months' }));
    expect(result.kind).toBe('books_rescue_first');
    expect(result.booksRescueRequired).toBe(true);
    expect(result.afterRescuePlan).toBeDefined();
    expect(result.rescueReasons?.length).toBeGreaterThan(0);
  });

  it('flags custom review for high complexity', () => {
    const result = recommendBookkeepingPlan(
      baseAnswers({ truckCount: 10, bankAccountCount: 6, monthlyTransactionBand: '400_plus' }),
    );
    expect(result.customReviewRequired).toBe(true);
    expect(result.kind).toBe('custom_review');
  });

  it('escalates when Essentials is insufficient for factoring multi-truck operation', () => {
    const result = recommendBookkeepingPlan(
      baseAnswers({ truckCount: 2, factoringUsed: true }),
    );
    expect(result.planMayNotFit).toBe(true);
    expect(result.suggestedAlternatePlan).toBe('PLUS');
    expect(result.kind).toBe('plan_escalation');
  });
});
