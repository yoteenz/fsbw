import { COACHING_CATEGORY_LABELS } from './constants';
import type { ExecutiveCoachingInsight, FounderIntelligenceSnapshot } from './types';

function coachingId(category: string, suffix: string): string {
  return `fos-coach-${category}-${suffix}`;
}

export function buildExecutiveCoachingInsights(
  organizationId: string,
  intelligence: FounderIntelligenceSnapshot[]
): ExecutiveCoachingInsight[] {
  const insights: ExecutiveCoachingInsight[] = [];
  const strategic = intelligence.find((s) => s.dimension === 'strategic-time');
  const decisions = intelligence.find((s) => s.dimension === 'decision-fatigue');
  const creative = intelligence.find((s) => s.dimension === 'creative-cycles');
  const meetings = intelligence.find((s) => s.dimension === 'meeting-load');
  const stress = intelligence.find((s) => s.dimension === 'stress-indicators');
  const growth = intelligence.find((s) => s.dimension === 'growth-areas');
  const leadership = intelligence.find((s) => s.dimension === 'leadership-development');
  const communication = intelligence.find((s) => s.dimension === 'communication-habits');

  if (strategic && strategic.scorePct < 60) {
    insights.push({
      id: coachingId('strategic', organizationId),
      category: 'strategic-reflection',
      headline: COACHING_CATEGORY_LABELS['strategic-reflection'],
      observation: strategic.insight,
      recommendation: 'Block 2 hours Friday for strategic planning — no operational meetings.',
      confidencePct: 84,
    });
  }

  if (decisions && decisions.scorePct >= 70) {
    insights.push({
      id: coachingId('decisions', organizationId),
      category: 'decision-quality',
      headline: COACHING_CATEGORY_LABELS['decision-quality'],
      observation: decisions.insight,
      recommendation: "I'll postpone non-critical approvals until tomorrow — protect decision quality.",
      confidencePct: 88,
    });
  }

  if (creative) {
    insights.push({
      id: coachingId('creative', organizationId),
      category: 'focus-improvement',
      headline: COACHING_CATEGORY_LABELS['focus-improvement'],
      observation: creative.insight,
      recommendation: 'Protect evening creative blocks — batch operational work before 6 PM.',
      confidencePct: 79,
    });
  }

  if (meetings && meetings.scorePct < 55) {
    insights.push({
      id: coachingId('meetings', organizationId),
      category: 'meeting-recommendation',
      headline: COACHING_CATEGORY_LABELS['meeting-recommendation'],
      observation: meetings.insight,
      recommendation: 'Convert two status meetings to async briefings — reclaim 90 minutes.',
      confidencePct: 76,
    });
  }

  insights.push({
    id: coachingId('delegation', organizationId),
    category: 'delegation-opportunity',
    headline: COACHING_CATEGORY_LABELS['delegation-opportunity'],
    observation: 'Routine approvals and scheduling consume founder capacity.',
    recommendation: 'Delegate recurring operational approvals to Digital Staff with your approval thresholds.',
    confidencePct: 81,
  });

  if (communication) {
    insights.push({
      id: coachingId('communication', organizationId),
      category: 'communication-improvement',
      headline: COACHING_CATEGORY_LABELS['communication-improvement'],
      observation: communication.insight,
      recommendation: 'Lead with executive summary in cross-department updates — detail on request.',
      confidencePct: 74,
    });
  }

  if (leadership) {
    insights.push({
      id: coachingId('leadership', organizationId),
      category: 'leadership-observation',
      headline: COACHING_CATEGORY_LABELS['leadership-observation'],
      observation: leadership.insight,
      recommendation: 'Schedule monthly leadership reflection — what worked, what to strengthen.',
      confidencePct: 77,
    });
  }

  insights.push({
    id: coachingId('learning', organizationId),
    category: 'learning-recommendation',
    headline: COACHING_CATEGORY_LABELS['learning-recommendation'],
    observation: 'Continuous learning compounds leadership effectiveness.',
    recommendation: 'One Studio Institute™ module this month — aligned with your growth areas.',
    confidencePct: 72,
  });

  if (stress && stress.scorePct < 60) {
    insights.push({
      id: coachingId('stress', organizationId),
      category: 'founder-development',
      headline: COACHING_CATEGORY_LABELS['founder-development'],
      observation: stress.insight,
      recommendation: 'Schedule recovery time — calmer founders make wiser decisions.',
      confidencePct: 85,
    });
  }

  insights.push({
    id: coachingId('habit', organizationId),
    category: 'executive-habit',
    headline: COACHING_CATEGORY_LABELS['executive-habit'],
    observation: growth?.insight ?? 'Executive habits shape organizational culture.',
    recommendation: 'Morning strategic block before operational email — 60 minutes protected.',
    confidencePct: 80,
  });

  return insights.slice(0, 8);
}

export function summarizeCoachingInsights(insights: ExecutiveCoachingInsight[]): string {
  return insights
    .slice(0, 3)
    .map((i) => `${i.headline}: ${i.recommendation}`)
    .join(' ');
}
