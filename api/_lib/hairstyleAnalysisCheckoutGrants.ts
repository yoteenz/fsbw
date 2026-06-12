import type { QuoteLineInput } from './pricing/resolveQuote.js';
import { parseHairstyleAnalysisComparisonTier } from './hairstyleAnalysisPricing.js';
import type { HairstyleAnalysisComparisonTier } from './hairstyleAnalysisPricing.js';

export function hairstyleAnalysisGrantsFromQuoteLines(lines: QuoteLineInput[]): HairstyleAnalysisComparisonTier[] {
  const grants: HairstyleAnalysisComparisonTier[] = [];
  for (const line of lines) {
    if ((line.type || '').trim() !== 'hairstyle-analysis') continue;
    const tier = parseHairstyleAnalysisComparisonTier(line.hairstyleAnalysisComparisonCount);
    if (!tier) continue;
    const q = Math.max(1, Math.floor(line.quantity || 1));
    for (let i = 0; i < q; i++) grants.push(tier);
  }
  return grants;
}
