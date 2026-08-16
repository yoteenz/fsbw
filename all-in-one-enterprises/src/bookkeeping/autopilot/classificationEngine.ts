import type { ClassificationConfidence, ClassificationSource, TransactionReviewState } from './autopilotTypes';
import { DEFAULT_MERCHANT_RULES, type MerchantRule, type TruckingChartCategory } from './chartOfAccounts';

export interface ClassifyInput {
  merchantName?: string;
  providerDescription?: string;
  amountMinor: number;
  organizationId: string;
  customerRules?: MerchantRule[];
}

export interface ClassifyResult {
  category: TruckingChartCategory;
  source: ClassificationSource;
  confidence: ClassificationConfidence;
  ruleReference?: string;
  reason: string;
  reviewState: TransactionReviewState;
}

const CONFIDENCE_TO_REVIEW: Record<ClassificationConfidence, TransactionReviewState> = {
  VERY_HIGH: 'AUTO_APPROVABLE',
  HIGH: 'AUTO_APPROVABLE',
  MEDIUM: 'REVIEW_REQUIRED',
  LOW: 'STAFF_APPROVAL_REQUIRED',
  UNCLASSIFIED: 'CUSTOMER_CLARIFICATION',
};

function matchRule(text: string, rules: MerchantRule[]): MerchantRule | undefined {
  const lower = text.toLowerCase();
  return rules.find((r) => lower.includes(r.pattern.toLowerCase()));
}

/**
 * classifyBookkeepingTransaction — trucking-specific rules with confidence + explanation.
 */
export function classifyBookkeepingTransaction(input: ClassifyInput): ClassifyResult {
  const text = [input.merchantName, input.providerDescription].filter(Boolean).join(' ');
  const orgRules = (input.customerRules ?? []).filter((r) => r.organizationId === input.organizationId);
  const rules = [...orgRules, ...DEFAULT_MERCHANT_RULES.filter((r) => r.scope === 'global')];

  const hit = text ? matchRule(text, rules) : undefined;
  if (hit) {
    const confidence: ClassificationConfidence = hit.confidence === 'VERY_HIGH' ? 'VERY_HIGH' : 'HIGH';
    return {
      category: hit.category,
      source: hit.scope === 'organization' ? 'CUSTOMER_RULE' : 'MERCHANT_RULE',
      confidence,
      ruleReference: hit.id,
      reason: `Merchant rule — ${hit.pattern}`,
      reviewState: CONFIDENCE_TO_REVIEW[confidence],
    };
  }

  if (Math.abs(input.amountMinor) >= 500000) {
    return {
      category: 'Other — Review Required',
      source: 'TRANSACTION_PATTERN',
      confidence: 'LOW',
      reason: 'Large transaction — materiality review',
      reviewState: 'STAFF_APPROVAL_REQUIRED',
    };
  }

  return {
    category: 'Other — Review Required',
    source: 'PROVIDER_CATEGORY',
    confidence: 'UNCLASSIFIED',
    reason: 'No matching merchant rule — clarification may be required',
    reviewState: 'CUSTOMER_CLARIFICATION',
  };
}

export function confidenceAllowsAutoPost(confidence: ClassificationConfidence, threshold: ClassificationConfidence = 'HIGH'): boolean {
  const order: ClassificationConfidence[] = ['UNCLASSIFIED', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
  return order.indexOf(confidence) >= order.indexOf(threshold);
}
