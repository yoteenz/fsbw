import { BOOKKEEPING_RECOMMENDATION_THRESHOLDS } from './bookkeepingConfig';
import type {
  BookkeepingAssessmentAnswers,
  BookkeepingPlanId,
  BookkeepingRecommendationResult,
  BooksCurrentness,
} from './bookkeepingTypes';

function booksNeedRescue(currentness: BooksCurrentness): boolean {
  return (BOOKKEEPING_RECOMMENDATION_THRESHOLDS.booksRescueBehind as readonly string[]).includes(currentness);
}

function needsCustomReview(answers: BookkeepingAssessmentAnswers): boolean {
  const t = BOOKKEEPING_RECOMMENDATION_THRESHOLDS;
  if (answers.truckCount >= t.customReviewTruckCount) return true;
  if (answers.bankAccountCount >= t.customReviewBankAccounts) return true;
  if (answers.creditCardCount >= t.customReviewCreditCards) return true;
  if (answers.monthlyTransactionBand === t.customReviewTransactionBand) return true;
  if ((answers.entityCount ?? 1) >= t.customReviewEntityCount) return true;
  if (answers.needsDriverSettlements && answers.needsPayrollReconciliation) return true;
  return false;
}

function scorePlan(answers: BookkeepingAssessmentAnswers): { plan: BookkeepingPlanId; score: number } {
  let score = 0;
  if (answers.truckCount >= 6) score += 4;
  else if (answers.truckCount >= 3) score += 2;
  else if (answers.truckCount >= 2) score += 1;

  if (answers.bankAccountCount >= 3) score += 1;
  if (answers.creditCardCount >= 2) score += 1;
  if ((answers.entityCount ?? 1) >= 2) score += 1;
  if (answers.monthlyTransactionBand === '150_400') score += 1;
  if (answers.monthlyTransactionBand === '400_plus') score += 2;
  if (answers.factoringUsed) score += 2;
  if (answers.driverStructure === 'contractors' || answers.driverStructure === 'both') score += 1;
  if (answers.needsDriverSettlements) score += 3;
  if (answers.needsAr) score += 3;
  if (answers.needsAp) score += 2;
  if (answers.needsPayrollReconciliation) score += 3;
  if (answers.needsIftaSupport) score += 1;
  if (answers.needsTruckProfitability) score += 3;
  if (answers.wantsMonthlyReview) score += 2;

  if (score >= 10) return { plan: 'ALL_IN_ONE', score };
  if (score >= 4) return { plan: 'PLUS', score };
  return { plan: 'ESSENTIALS', score };
}

function evaluatePlanFit(
  answers: BookkeepingAssessmentAnswers,
  recommendedPlan: BookkeepingPlanId,
  score: number,
): Pick<BookkeepingRecommendationResult, 'planMayNotFit' | 'planFitMessage' | 'suggestedAlternatePlan'> {
  const t = BOOKKEEPING_RECOMMENDATION_THRESHOLDS;
  if (recommendedPlan !== 'ESSENTIALS') {
    return {};
  }
  if (score >= t.essentialsEscalationScore) {
    const suggested: BookkeepingPlanId = score >= 10 ? 'ALL_IN_ONE' : 'PLUS';
    return {
      planMayNotFit: true,
      suggestedAlternatePlan: suggested,
      planFitMessage:
        'This plan may not fit your bookkeeping needs. Your operation suggests Bookkeeping Plus or a custom review.',
    };
  }
  if (answers.factoringUsed && answers.truckCount >= 2) {
    return {
      planMayNotFit: true,
      suggestedAlternatePlan: 'PLUS',
      planFitMessage:
        'Essentials may not include the factoring reconciliation and reporting depth your multi-truck operation likely needs.',
    };
  }
  return {};
}

function buildReasons(answers: BookkeepingAssessmentAnswers, plan: BookkeepingPlanId): string[] {
  const reasons: string[] = [];
  if (answers.truckCount >= 3) reasons.push(`You operate ${answers.truckCount} trucks`);
  else if (answers.truckCount === 2) reasons.push('You operate multiple trucks');
  if (answers.factoringUsed) reasons.push('You use factoring');
  if (answers.driverStructure === 'contractors' || answers.driverStructure === 'both') {
    reasons.push('You work with contractors or company drivers');
  }
  if (answers.needsDriverSettlements) reasons.push('You need driver-settlement tracking');
  if (answers.needsAr) reasons.push('You need Accounts Receivable tracking');
  if (answers.needsAp) reasons.push('You need Accounts Payable tracking');
  if (answers.needsPayrollReconciliation) reasons.push('You need payroll bookkeeping/reconciliation');
  if (answers.needsIftaSupport) reasons.push('You want IFTA bookkeeping support');
  if (answers.needsTruckProfitability) reasons.push('You want truck-by-truck profitability reporting');
  if (answers.wantsMonthlyReview) reasons.push('You want monthly financial review meetings');
  if (answers.bankAccountCount >= 2) reasons.push('You use multiple business bank accounts');
  if (answers.monthlyTransactionBand === '400_plus') reasons.push('You have high monthly transaction volume');
  if ((answers.entityCount ?? 1) >= 2) reasons.push('You operate multiple business entities');

  if (!reasons.length) {
    if (plan === 'ESSENTIALS') {
      reasons.push('Your operation is straightforward with foundational monthly bookkeeping needs');
    } else if (plan === 'PLUS') {
      reasons.push('Your growing operation benefits from deeper reporting and reconciliation');
    } else {
      reasons.push('Your fleet operation needs comprehensive back-office bookkeeping support');
    }
  }
  return reasons.slice(0, 6);
}

function buildRescueReasons(currentness: BooksCurrentness): string[] {
  switch (currentness) {
    case '3_6_months':
      return ['Your books appear 3–6 months behind', 'Historical cleanup is recommended before recurring service'];
    case '7_12_months':
      return ['Your books appear 7–12 months behind', 'Significant cleanup is needed before monthly bookkeeping'];
    case 'more_than_12':
      return ['Your books appear more than 12 months behind', 'Books Rescue cleanup should come first'];
    default:
      return ['Your books need cleanup before recurring bookkeeping can begin'];
  }
}

/**
 * Transparent configurable recommendation — not an opaque AI model.
 */
export function recommendBookkeepingPlan(
  answers: BookkeepingAssessmentAnswers,
  billingInterval: 'MONTHLY' | 'ANNUAL' = 'MONTHLY',
): BookkeepingRecommendationResult {
  const customReviewRequired = needsCustomReview(answers);
  const booksRescueRequired = booksNeedRescue(answers.booksCurrentness);
  const { plan, score } = scorePlan(answers);
  const reasons = buildReasons(answers, plan);
  const planFit = evaluatePlanFit(answers, plan, score);

  if (booksRescueRequired) {
    return {
      kind: 'books_rescue_first',
      recommendedPlan: plan,
      billingInterval,
      booksRescueRequired: true,
      customReviewRequired,
      reasons,
      rescueReasons: buildRescueReasons(answers.booksCurrentness),
      afterRescuePlan: plan,
      ...planFit,
    };
  }

  if (customReviewRequired) {
    return {
      kind: 'custom_review',
      recommendedPlan: plan,
      billingInterval,
      booksRescueRequired: false,
      customReviewRequired: true,
      reasons: [
        ...reasons,
        'Your setup exceeds standard automated pricing thresholds — staff will confirm final pricing',
      ],
      ...planFit,
    };
  }

  if (planFit.planMayNotFit) {
    return {
      kind: 'plan_escalation',
      recommendedPlan: planFit.suggestedAlternatePlan ?? 'PLUS',
      billingInterval,
      booksRescueRequired: false,
      customReviewRequired: false,
      reasons: [...reasons, planFit.planFitMessage!],
      ...planFit,
    };
  }

  return {
    kind: 'plan',
    recommendedPlan: plan,
    billingInterval,
    booksRescueRequired: false,
    customReviewRequired: false,
    reasons,
  };
}

export function planDisplayName(planId: BookkeepingPlanId): string {
  const names: Record<BookkeepingPlanId, string> = {
    ESSENTIALS: 'Bookkeeping Essentials',
    PLUS: 'Bookkeeping Plus',
    ALL_IN_ONE: 'All In One Bookkeeping',
  };
  return names[planId];
}
