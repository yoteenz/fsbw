import { CONTRIBUTION_TIMELINE_LABELS } from './constants';
import type { ContributionTimelineDomain, ContributionTimelineEntry } from './types';

function uid(): string {
  return `ct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildContributionTimeline(
  innovationTitle: string,
  contributors: { founderId: string; founderName: string; domain: ContributionTimelineDomain; note: string }[]
): ContributionTimelineEntry[] {
  const now = Date.now();
  return contributors.map((c, i) => ({
    id: uid(),
    founderId: c.founderId,
    founderName: c.founderName,
    domain: c.domain,
    domainLabel: CONTRIBUTION_TIMELINE_LABELS[c.domain],
    contribution: `${c.note} — permanent attribution on "${innovationTitle}"`,
    at: new Date(now - (contributors.length - i) * 7 * 86_400_000).toISOString(),
    permanent: true,
  }));
}

export function buildDemoContributionTimeline(innovationTitle: string): ContributionTimelineEntry[] {
  return buildContributionTimeline(innovationTitle, [
    { founderId: 'f-arch', founderName: 'James Whitfield', domain: 'architecture', note: 'Campus spatial spine' },
    { founderId: 'f-cd', founderName: 'Elena Voss', domain: 'creative-direction', note: 'Luxury retail narrative' },
    { founderId: 'f-story', founderName: 'Dr. Amara Okonkwo', domain: 'storytelling', note: 'Customer journey arcs' },
    { founderId: 'f-auto', founderName: 'Marcus Chen', domain: 'automation', note: 'Operations automation layer' },
    { founderId: 'f-brand', founderName: 'Founder', domain: 'brand-strategy', note: 'Executive brand alignment' },
    { founderId: 'f-cx', founderName: 'Founder', domain: 'customer-experience', note: 'Concierge touchpoints' },
    { founderId: 'f-ai', founderName: 'Marcus Chen', domain: 'ai-logic', note: 'Intelligent workflow routing' },
    { founderId: 'f-genome', founderName: 'Founder', domain: 'genome-design', note: 'Organization Genome integration' },
  ]);
}

export function summarizeContributionTimeline(entries: ContributionTimelineEntry[]): string {
  return entries.map((e) => `${e.founderName} (${e.domainLabel})`).join(' · ');
}
