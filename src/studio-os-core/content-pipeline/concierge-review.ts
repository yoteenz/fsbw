import type { ConciergeReviewerId, ConciergeReviewResult } from './types';

export const CONCIERGE_REVIEW_BOARD: Array<{ id: ConciergeReviewerId; label: string }> = [
  { id: 'creative-director', label: 'Creative Director Concierge™' },
  { id: 'brand', label: 'Brand Concierge™' },
  { id: 'editorial', label: 'Editorial Concierge™' },
  { id: 'seo', label: 'SEO Concierge™' },
  { id: 'accessibility', label: 'Accessibility Concierge™' },
  { id: 'legal', label: 'Legal Concierge™' },
  { id: 'marketing', label: 'Marketing Concierge™' },
  { id: 'social-media', label: 'Social Media Concierge™' },
  { id: 'visual-design', label: 'Visual Design Concierge™' },
  { id: 'studio-intelligence', label: 'Studio Intelligence™' },
];

export function computeOverallReadinessScore(reviews: ConciergeReviewResult[]): number {
  if (reviews.length === 0) return 0;
  const weighted = reviews.reduce((sum, r) => {
    const multiplier = r.verdict === 'pass' ? 1 : r.verdict === 'warning' ? 0.72 : 0.35;
    return sum + r.scorePct * multiplier;
  }, 0);
  return Math.round(weighted / reviews.length);
}
