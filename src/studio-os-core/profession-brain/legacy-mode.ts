import type { OrganizationProfessionBrainProfile } from './types';

export const LEGACY_MODE_PHILOSOPHY = [
  'Knowledge preserves across generations — future owners, employees, family, leadership.',
  'The Profession Brain becomes institutional memory that never dies with one person.',
  'Every correction, success, failure, and lesson strengthens the Brain over decades.',
];

export function buildLegacySummary(profile: OrganizationProfessionBrainProfile): string {
  const brainCount = profile.brains.length;
  const knowledgeCount = profile.brains.reduce((s, b) => s + b.knowledgeEntries.length, 0);
  return `${profile.companyName} · ${brainCount} Profession Brain${brainCount === 1 ? '' : 's'} · ${knowledgeCount} preserved knowledge entries · ${profile.overallMaturityPct}% institutional maturity. Your business no longer exists only inside your head.`;
}

export function listEvolutionSignals(profile: OrganizationProfessionBrainProfile): string[] {
  return [
    `Every project strengthens ${profile.brains[0]?.label ?? 'your Profession Brain'}.`,
    'Every correction updates living knowledge without erasing founding wisdom.',
    'Every customer interaction teaches Customer Experience Brain.',
    'Every regulation change updates compliance judgment — not just checklists.',
    'Studio OS becomes more valuable every year your organization exists.',
  ];
}
