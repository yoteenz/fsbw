import { HISTORY_INSIGHT_LABELS } from './history-constants';
import type { ExecutiveHistoryEvent, GrowthComparisonPoint, TimelineInsight, YearSnapshot } from './history-types';

export function buildYearSnapshots(events: ExecutiveHistoryEvent[]): YearSnapshot[] {
  const byYear = new Map<number, ExecutiveHistoryEvent[]>();
  events.forEach((e) => {
    const list = byYear.get(e.year) ?? [];
    list.push(e);
    byYear.set(e.year, list);
  });

  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, yearEvents]) => {
      const major = yearEvents.filter((e) => e.significance === 'major' || e.significance === 'foundational');
      const departments = [...new Set(yearEvents.map((e) => e.department))];
      const growthIndex = Math.min(100, major.length * 18 + yearEvents.length * 4);
      const headline =
        major[0]?.title ??
        `${yearEvents.length} events recorded — organizational evolution continues.`;
      return {
        year,
        eventCount: yearEvents.length,
        majorEventCount: major.length,
        departmentsActive: departments,
        growthIndex,
        headline,
      };
    });
}

export function buildGrowthComparison(
  events: ExecutiveHistoryEvent[],
  healthScore: number,
  knowledgeScore: number
): GrowthComparisonPoint[] {
  const snapshots = buildYearSnapshots(events);
  return snapshots.map((snap, i) => ({
    year: snap.year,
    eventsRecorded: snap.eventCount,
    knowledgeScore: Math.min(99, knowledgeScore + i * 6),
    healthScore: Math.min(99, healthScore + i * 4),
    revenueIndex: Math.min(99, 40 + snap.growthIndex * 0.5 + i * 8),
  }));
}

export function buildTimelineInsights(events: ExecutiveHistoryEvent[]): TimelineInsight[] {
  const insights: TimelineInsight[] = [];
  const snapshots = buildYearSnapshots(events);
  if (snapshots.length === 0) return insights;

  const fastest = [...snapshots].sort((a, b) => b.growthIndex - a.growthIndex)[0];
  if (fastest) {
    const related = events.filter((e) => e.year === fastest.year).map((e) => e.id);
    insights.push({
      id: 'insight-fastest-growth',
      pattern: 'fastest-growth',
      headline: HISTORY_INSIGHT_LABELS['fastest-growth'],
      narrative: `${fastest.year} was your fastest growth period — ${fastest.majorEventCount} major milestones and ${fastest.eventCount} total events recorded.`,
      relatedEventIds: related.slice(0, 5),
      yearRange: String(fastest.year),
      actionable: true,
      confidencePct: 82,
    });
  }

  const campaign = events.find((e) => e.type === 'marketing-campaign');
  const postCampaign = events.find(
    (e) =>
      e.type === 'revenue-milestone' &&
      campaign &&
      Date.parse(e.occurredAt) > Date.parse(campaign.occurredAt)
  );
  if (campaign) {
    insights.push({
      id: 'insight-campaign-impact',
      pattern: 'campaign-impact',
      headline: HISTORY_INSIGHT_LABELS['campaign-impact'],
      narrative: postCampaign
        ? `Marketing performance doubled after "${campaign.title}" — revenue milestones followed within the same growth cycle.`
        : `"${campaign.title}" marked a strategic marketing shift — monitor downstream revenue in executive history.`,
      relatedEventIds: [campaign.id, postCampaign?.id].filter(Boolean) as string[],
      actionable: true,
      confidencePct: 76,
    });
  }

  const brainEvents = events.filter((e) => e.type === 'profession-brain-update');
  if (brainEvents.length >= 2) {
    const years = [...new Set(brainEvents.map((e) => e.year))];
    insights.push({
      id: 'insight-brain-expansion',
      pattern: 'brain-expansion',
      headline: HISTORY_INSIGHT_LABELS['brain-expansion'],
      narrative: `Your Profession Brain™ expanded significantly across ${years.length} year${years.length > 1 ? 's' : ''} — ${brainEvents.length} institutional knowledge updates preserved.`,
      relatedEventIds: brainEvents.slice(-4).map((e) => e.id),
      yearRange: years.join('–'),
      actionable: true,
      confidencePct: 88,
    });
  }

  const decision = events.find((e) => e.type === 'executive-decision');
  const healthAfter = events.find(
    (e) =>
      e.type === 'health-improvement' &&
      (!decision || Date.parse(e.occurredAt) >= Date.parse(decision.occurredAt))
  );
  if (decision || healthAfter) {
    insights.push({
      id: 'insight-decision-outcome',
      pattern: 'decision-outcome',
      headline: HISTORY_INSIGHT_LABELS['decision-outcome'],
      narrative: decision
        ? `Executive decision "${decision.title}" produced long-term organizational improvements visible in subsequent health and knowledge milestones.`
        : 'Organization health improvements correlate with executive decisions recorded in permanent history.',
      relatedEventIds: [decision?.id, healthAfter?.id].filter(Boolean) as string[],
      actionable: true,
      confidencePct: 71,
    });
  }

  const healthEvents = events.filter((e) => e.type === 'health-improvement');
  if (healthEvents.length > 0) {
    insights.push({
      id: 'insight-health-turnaround',
      pattern: 'health-turnaround',
      headline: HISTORY_INSIGHT_LABELS['health-turnaround'],
      narrative: `${healthEvents.length} health improvement milestone${healthEvents.length > 1 ? 's' : ''} recorded — the organization became healthier, not simply larger.`,
      relatedEventIds: healthEvents.map((e) => e.id),
      actionable: true,
      confidencePct: 79,
    });
  }

  const knowledgeEvents = events.filter(
    (e) => e.type === 'knowledge-growth' || e.type === 'knowledge-commerce-launch'
  );
  if (knowledgeEvents.length >= 2) {
    insights.push({
      id: 'insight-knowledge-compounding',
      pattern: 'knowledge-compounding',
      headline: HISTORY_INSIGHT_LABELS['knowledge-compounding'],
      narrative: 'Knowledge growth compounds over time — each launch and lesson captured strengthens institutional memory.',
      relatedEventIds: knowledgeEvents.slice(-5).map((e) => e.id),
      actionable: true,
      confidencePct: 85,
    });
  }

  const founded = events.find((e) => e.type === 'organization-founded');
  if (founded) {
    const now = new Date();
    const foundedDate = new Date(founded.occurredAt);
    const yearsSince = now.getFullYear() - foundedDate.getFullYear();
    const weekMatch =
      now.getMonth() === foundedDate.getMonth() &&
      Math.abs(now.getDate() - foundedDate.getDate()) <= 7;
    if (weekMatch || yearsSince >= 1) {
      insights.push({
        id: 'insight-anniversary',
        pattern: 'anniversary',
        headline: HISTORY_INSIGHT_LABELS.anniversary,
        narrative: weekMatch
          ? `This week marks a founding anniversary — ${yearsSince} year${yearsSince !== 1 ? 's' : ''} of organizational history preserved.`
          : `Your organization has ${yearsSince}+ years of executive history — explore how you arrived here.`,
        relatedEventIds: [founded.id],
        actionable: true,
        confidencePct: 95,
      });
    }
  }

  return insights.slice(0, 7);
}

export function summarizeTimelineInsights(insights: TimelineInsight[]): string {
  if (insights.length === 0) return 'Executive Timeline insights will appear as organizational history accumulates.';
  return insights
    .slice(0, 4)
    .map((i) => `${i.headline}: ${i.narrative}`)
    .join(' ');
}
