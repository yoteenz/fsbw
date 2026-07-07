import type { ProductionDepartmentId } from '../../content-pipeline/departments';
import type { ProductionConciergeId } from './types';

type RouteResult = {
  concierge: ProductionConciergeId;
  confidence: 'high' | 'medium' | 'low';
  returnDepartment: ProductionDepartmentId;
};

const RULES: Array<{
  concierge: ProductionConciergeId;
  keywords: string[];
  returnDepartment: ProductionDepartmentId;
}> = [
  {
    concierge: 'legal',
    keywords: ['legal', 'claim', 'compliance', 'fact-check', 'fact check', 'lawsuit', 'regulation'],
    returnDepartment: 'development',
  },
  {
    concierge: 'visual-design',
    keywords: ['visual', 'design', 'thumbnail', 'frame', 'color', 'layout', 'off-brand look', 'imagery'],
    returnDepartment: 'production',
  },
  {
    concierge: 'brand',
    keywords: ['brand', 'tone', 'voice', 'generic', 'authoritative', 'on-brand', 'off-brand', 'ndxbook'],
    returnDepartment: 'development',
  },
  {
    concierge: 'editorial',
    keywords: ['hook', 'script', 'rewrite', 'caption', 'copy', 'alarmist', 'wording', 'headline', 'message'],
    returnDepartment: 'development',
  },
  {
    concierge: 'social-media',
    keywords: ['instagram', 'social', 'engagement', 'save rate', 'performance', 'hashtag', 'feed', 'carousel'],
    returnDepartment: 'production',
  },
  {
    concierge: 'strategy',
    keywords: ['strategy', 'objective', 'audience', 'pivot', 'positioning', 'campaign', 'objective'],
    returnDepartment: 'discover',
  },
];

export function routeFounderNoteToConcierge(body: string, instinctFlag = false): RouteResult {
  const text = body.toLowerCase();
  let best: RouteResult | null = null;
  let bestScore = 0;

  for (const rule of RULES) {
    const score = rule.keywords.reduce((sum, kw) => (text.includes(kw) ? sum + 1 : sum), 0);
    if (score > bestScore) {
      bestScore = score;
      best = {
        concierge: rule.concierge,
        confidence: score >= 2 ? 'high' : 'medium',
        returnDepartment: rule.returnDepartment,
      };
    }
  }

  if (best && bestScore > 0) return best;

  if (instinctFlag) {
    return {
      concierge: 'studio-orb',
      confidence: 'low',
      returnDepartment: 'production',
    };
  }

  return {
    concierge: 'studio-orb',
    confidence: 'low',
    returnDepartment: 'production',
  };
}

export function conciergeLabel(id: ProductionConciergeId): string {
  const labels: Record<ProductionConciergeId, string> = {
    brand: 'Brand Concierge™',
    editorial: 'Editorial Concierge™',
    legal: 'Legal Concierge™',
    'social-media': 'Social Media Concierge™',
    'visual-design': 'Visual Design Concierge™',
    strategy: 'Strategy Concierge™',
    'studio-orb': 'Studio Orb · Studio Intelligence™',
  };
  return labels[id];
}
