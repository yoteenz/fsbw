import { COLLABORATIVE_DEPARTMENT_LABELS, COLLABORATIVE_DEPARTMENTS } from './constants';
import type { CollaborativeDepartment, CollaborativeReview } from './types';

type IdeaTemplateInput = {
  title: string;
  category: string;
  revenuePotentialScore: number;
  confidencePct: number;
};

function orgSeed(organizationId: string, salt: string): number {
  let h = 0;
  const s = organizationId + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 30;
}

function review(
  department: CollaborativeDepartment,
  evaluation: string,
  scorePct: number,
  recommendation: string
): CollaborativeReview {
  return {
    department,
    label: COLLABORATIVE_DEPARTMENT_LABELS[department],
    evaluation,
    scorePct,
    recommendation,
  };
}

export function buildCollaborativeReviews(idea: IdeaTemplateInput, organizationId: string): CollaborativeReview[] {
  const seed = orgSeed(organizationId, idea.title);
  const base = idea.confidencePct;

  return COLLABORATIVE_DEPARTMENTS.filter((d) => d !== 'chief-concierge').map((dept) => {
    const score = Math.min(99, base + seed - 10 + (dept.length % 8));
    switch (dept) {
      case 'marketing':
        return review(
          dept,
          `Demand signals for ${idea.category.replace(/-/g, ' ')} — market interest ${score}%.`,
          score,
          score >= 70 ? 'Proceed — strong demand indicators.' : 'Validate demand with customer interviews first.'
        );
      case 'finance':
        return review(
          dept,
          `Profitability model ${idea.revenuePotentialScore >= 70 ? 'favorable' : 'requires refinement'} — margin analysis complete.`,
          Math.min(99, idea.revenuePotentialScore),
          idea.revenuePotentialScore >= 75
            ? 'Approve investment — ROI projections positive.'
            : 'Phase investment — start with minimum viable launch.'
        );
      case 'operations':
        return review(
          dept,
          `Execution feasibility ${score}% — resource requirements mapped.`,
          score,
          score >= 65 ? 'Operations can support phased rollout.' : 'Reduce scope or extend timeline before launch.'
        );
      case 'research':
        return review(
          dept,
          `Evidence quality ${base}% — competitive and customer data gathered.`,
          base,
          'Continue research — supporting data strengthens confidence.'
        );
      case 'legal':
        return review(
          dept,
          `Risk assessment complete — regulatory and IP considerations identified.`,
          Math.max(55, 100 - seed),
          seed > 15 ? 'Schedule legal review before public launch.' : 'Low regulatory risk — standard terms apply.'
        );
      case 'customer-experience':
        return review(
          dept,
          `Usability and customer journey evaluated — experience score ${score}%.`,
          score,
          score >= 68 ? 'Customer experience aligned with brand standards.' : 'Refine customer journey before launch.'
        );
      default:
        return review(dept, 'Evaluation complete.', score, 'Review noted.');
    }
  });
}

export function synthesizeChiefConciergeRecommendation(
  reviews: CollaborativeReview[],
  idea: IdeaTemplateInput
): string {
  const avgScore = Math.round(reviews.reduce((sum, r) => sum + r.scorePct, 0) / Math.max(1, reviews.length));
  const finance = reviews.find((r) => r.department === 'finance');
  const marketing = reviews.find((r) => r.department === 'marketing');

  if (avgScore >= 75 && idea.revenuePotentialScore >= 70) {
    return `Executive recommendation: Advance "${idea.title}" to prototype — Marketing (${marketing?.scorePct}%) and Finance (${finance?.scorePct}%) align. Overall confidence ${avgScore}%.`;
  }
  if (avgScore >= 60) {
    return `Executive recommendation: Continue validating "${idea.title}" — promising opportunity (${avgScore}% cross-department score) with phased investment.`;
  }
  return `Executive recommendation: Archive "${idea.title}" for future reference — preserve research; revisit when market conditions shift. Idea remains searchable.`;
}

export function summarizeCollaborativeInnovation(reviews: CollaborativeReview[], recommendation: string): string {
  const avg = Math.round(reviews.reduce((sum, r) => sum + r.scorePct, 0) / Math.max(1, reviews.length));
  return `${reviews.length} department evaluations · avg ${avg}% · Chief Concierge: ${recommendation.slice(0, 120)}…`;
}
