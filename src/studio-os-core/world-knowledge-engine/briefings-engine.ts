import { BRIEFING_TYPE_LABELS } from './constants';
import type { BriefingType, ExecutiveBriefing, WorldKnowledgeSignal } from './types';

function briefingId(type: string, orgId: string): string {
  return `wke-brief-${type}-${orgId}`;
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

export function buildExecutiveBriefings(
  organizationId: string,
  companyName: string,
  industryId: string,
  signals: WorldKnowledgeSignal[]
): ExecutiveBriefing[] {
  const topSignals = signals.slice(0, 6);
  const opportunities = signals.filter((s) => s.impact === 'opportunity');
  const risks = signals.filter((s) => s.impact === 'risk');
  const todayHeadline = topSignals[0]?.headline ?? 'Markets stable in your sector';

  const briefings: ExecutiveBriefing[] = [
    {
      id: briefingId('daily', organizationId),
      type: 'daily',
      title: BRIEFING_TYPE_LABELS.daily,
      generatedAt: hoursAgo(2),
      summary: `Today's developments for ${companyName}: ${todayHeadline}. ${topSignals.length} items monitored · ${signals.filter((s) => s.relevancePct >= 80).length} high-relevance.`,
      whyItMatters: 'Start each day knowing what changed outside your Headquarters — without searching.',
      highlights: topSignals.slice(0, 4).map((s) => s.headline),
      relatedSignalIds: topSignals.slice(0, 4).map((s) => s.id),
    },
    {
      id: briefingId('weekly', organizationId),
      type: 'weekly',
      title: BRIEFING_TYPE_LABELS.weekly,
      generatedAt: hoursAgo(24),
      summary: `Weekly intelligence for ${industryId.replace(/-/g, ' ')}: ${signals.length} filtered signals · ${opportunities.length} opportunities · ${risks.length} risks flagged.`,
      whyItMatters: 'Weekly reports connect external shifts to internal priorities — every item explains why it matters.',
      highlights: [
        opportunities[0]?.headline ?? 'No major opportunities this week',
        risks[0]?.headline ?? 'No critical risks this week',
        topSignals[1]?.headline ?? 'Industry monitoring active',
      ].filter(Boolean),
      relatedSignalIds: [...opportunities, ...risks].slice(0, 5).map((s) => s.id),
    },
    {
      id: briefingId('monthly', organizationId),
      type: 'monthly',
      title: BRIEFING_TYPE_LABELS.monthly,
      generatedAt: hoursAgo(72),
      summary: `Monthly industry outlook — ${companyName} receives intelligence filtered for ${industryId.replace(/-/g, ' ')} context, not generic news feeds.`,
      whyItMatters: 'Strategic planning requires industry outlook — Studio OS delivers it organization-specific.',
      highlights: signals.slice(0, 3).map((s) => `${s.category.replace(/-/g, ' ')}: ${s.headline.slice(0, 60)}…`),
      relatedSignalIds: signals.slice(0, 5).map((s) => s.id),
    },
    {
      id: briefingId('quarterly', organizationId),
      type: 'quarterly',
      title: BRIEFING_TYPE_LABELS.quarterly,
      generatedAt: hoursAgo(168),
      summary: `Quarterly strategic report synthesizes regulations, competitors, technology, and economic indicators affecting ${companyName}.`,
      whyItMatters: 'Board-level decisions need external context — quarterly reports explain implications, not headlines alone.',
      highlights: [
        'Regulatory landscape summary',
        'Competitive positioning shifts',
        'Technology and AI impact assessment',
        'Economic indicator review',
      ],
      relatedSignalIds: signals.slice(0, 8).map((s) => s.id),
    },
    {
      id: briefingId('executive-summary', organizationId),
      type: 'executive-summary',
      title: BRIEFING_TYPE_LABELS['executive-summary'],
      generatedAt: hoursAgo(4),
      summary: `Executive summary: ${topSignals.slice(0, 2).map((s) => s.headline).join(' · ') || 'Monitoring active'}.`,
      whyItMatters: 'Founders receive concise external intelligence — dramatically reducing research time.',
      highlights: topSignals.slice(0, 3).map((s) => s.whyItMatters.slice(0, 80)),
      relatedSignalIds: topSignals.slice(0, 3).map((s) => s.id),
    },
  ];

  if (opportunities[0]) {
    briefings.push({
      id: briefingId('opportunity', organizationId),
      type: 'opportunity-alert',
      title: BRIEFING_TYPE_LABELS['opportunity-alert'],
      generatedAt: opportunities[0].publishedAt,
      summary: opportunities[0].headline,
      whyItMatters: opportunities[0].whyItMatters,
      highlights: opportunities.slice(0, 3).map((s) => s.summary.slice(0, 90)),
      relatedSignalIds: opportunities.slice(0, 3).map((s) => s.id),
    });
  }

  if (risks[0]) {
    briefings.push({
      id: briefingId('risk', organizationId),
      type: 'risk-alert',
      title: BRIEFING_TYPE_LABELS['risk-alert'],
      generatedAt: risks[0].publishedAt,
      summary: risks[0].headline,
      whyItMatters: risks[0].whyItMatters,
      highlights: risks.slice(0, 3).map((s) => s.summary.slice(0, 90)),
      relatedSignalIds: risks.slice(0, 3).map((s) => s.id),
    });
  }

  return briefings;
}

export function summarizeBriefings(briefings: ExecutiveBriefing[]): string {
  const daily = briefings.find((b) => b.type === 'daily');
  const risk = briefings.find((b) => b.type === 'risk-alert');
  const opp = briefings.find((b) => b.type === 'opportunity-alert');
  return [daily?.summary, risk ? `Risk: ${risk.summary.slice(0, 80)}…` : '', opp ? `Opportunity: ${opp.summary.slice(0, 80)}…` : '']
    .filter(Boolean)
    .join(' ');
}

export function getBriefingByType(
  briefings: ExecutiveBriefing[],
  type: BriefingType
): ExecutiveBriefing | undefined {
  return briefings.find((b) => b.type === type);
}
