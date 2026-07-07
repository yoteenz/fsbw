import { explainPersonTimeline, explainTimelineEvent, getSelectedTimeline } from './timeline-builder';
import type { IdentityTimelineSearchHit, OrganizationIdentityTimelineProfile } from './types';

export function queryIdentityTimeline(
  query: string,
  profile: OrganizationIdentityTimelineProfile,
  limit = 8
): IdentityTimelineSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: IdentityTimelineSearchHit[] = [];

  for (const timeline of profile.timelines) {
    const hay = `${timeline.displayName} ${timeline.role} ${timeline.department} ${timeline.headline}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'person',
        id: timeline.personId,
        label: timeline.displayName,
        score: timeline.journeyScore,
        matchReason: `${timeline.role} · ${timeline.eventsCount} events · ${timeline.department}`,
      });
    }

    for (const evt of timeline.events) {
      if (`${evt.title} ${evt.description} ${evt.eventTypeLabel}`.toLowerCase().includes(q)) {
        hits.push({
          type: 'event',
          id: evt.id,
          label: `${timeline.displayName}: ${evt.title}`,
          score: evt.impactScore,
          matchReason: `${evt.eventTypeLabel} · permanent record`,
        });
      }
    }
  }

  for (const insight of profile.insights) {
    if (insight.insight.toLowerCase().includes(q)) {
      hits.push({
        type: 'insight',
        id: insight.id,
        label: insight.insight.slice(0, 72),
        score: insight.severity === 'celebration' ? 95 : 70,
        matchReason: `${insight.category} · ${insight.personName}`,
      });
    }
  }

  const seen = new Set<string>();
  return hits
    .filter((h) => {
      const key = `${h.type}-${h.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getMentorshipSummary(profile: OrganizationIdentityTimelineProfile): string {
  const top = [...profile.timelines].sort((a, b) => b.stats.mentorshipCount - a.stats.mentorshipCount)[0];
  if (!top?.stats.mentorshipCount) return 'No mentorship records yet.';
  return `You've mentored ${top.stats.mentorshipCount} employees — ${top.displayName}'s permanent Identity Timeline™.`;
}

export function getKnowledgeSummary(profile: OrganizationIdentityTimelineProfile): string {
  const top = [...profile.timelines].sort((a, b) => b.stats.knowledgeAssetsPublished - a.stats.knowledgeAssetsPublished)[0];
  if (!top?.stats.knowledgeAssetsPublished) return 'No knowledge assets published yet.';
  return `You've published ${top.stats.knowledgeAssetsPublished} knowledge assets — preserved in Identity Timeline™.`;
}

export function getTopContributorSummary(profile: OrganizationIdentityTimelineProfile): string {
  const top = profile.timelines.find((t) => t.topContributorThisYear);
  if (!top) return 'Top contributor recognition pending.';
  return `This year ${top.displayName} became the organization's top contributor.`;
}

export function getSelectedTimelineSummary(profile: OrganizationIdentityTimelineProfile): string | null {
  const timeline = getSelectedTimeline(profile);
  if (!timeline) return null;
  return explainPersonTimeline(timeline.personId, profile);
}

export function explainIdentityTimelineEvent(eventId: string, profile: OrganizationIdentityTimelineProfile): string | null {
  return explainTimelineEvent(eventId, profile);
}
