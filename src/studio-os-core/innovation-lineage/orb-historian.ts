/**
 * Innovation Lineage™ — Orb Innovation Historian.
 */

import type { FounderInnovationLegacy, LineageGalleryExhibit } from './types';

export type InnovationHistorianLine = {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
};

function uid(): string {
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const INNOVATION_HISTORIAN_ROLE = 'Innovation Historian';
export const INNOVATION_HISTORIAN_GREETING =
  'Innovation Lineage Gallery™ — every invention has a family tree. I help you understand the legacy of your work.';
export const INNOVATION_HISTORIAN_ACCENT = '#e8a84c';

export function buildInnovationHistorianWelcomeLines(): InnovationHistorianLine[] {
  return [
    {
      id: uid(),
      message:
        'Studio OS remembers not only who created something — but how every innovation evolved through collaboration.',
      priority: 'high',
    },
    {
      id: uid(),
      message: 'Innovation Graph™ connects Original Creator™, Inspired By™, Forked From™, and Enhanced By™ forever.',
      priority: 'medium',
    },
    {
      id: uid(),
      message: 'Intellectual Equity™ compounds — Influence Score™, Innovation Reach™, Creative Equity™.',
      priority: 'medium',
    },
  ];
}

export function buildInnovationHistorianExhibitLines(exhibit: LineageGalleryExhibit): InnovationHistorianLine[] {
  const gens = exhibit.graph.nodes.length;
  return [
    {
      id: uid(),
      message: `"${exhibit.title}" traces back through ${gens} generations of innovation.`,
      priority: 'high',
    },
    {
      id: uid(),
      message: `${exhibit.companiesUsing.toLocaleString()} companies use this invention — Marketplace Bestseller™ lineage preserved.`,
      priority: 'high',
    },
    {
      id: uid(),
      message: exhibit.currentEvolution,
      priority: 'medium',
    },
  ];
}

export function buildInnovationHistorianLegacyLines(legacy: FounderInnovationLegacy): InnovationHistorianLine[] {
  return [
    {
      id: uid(),
      message: `You've become one of the leading contributors in ${legacy.topDomains[0]}.`,
      priority: 'high',
    },
    {
      id: uid(),
      message: `This workflow has influenced over ${legacy.companiesHelped.toLocaleString()} companies.`,
      priority: 'medium',
    },
    {
      id: uid(),
      message: `Innovation Score ${legacy.innovationScore} · Creative Equity ${legacy.creativeEquity} — lasting recognition.`,
      priority: 'medium',
    },
  ];
}
