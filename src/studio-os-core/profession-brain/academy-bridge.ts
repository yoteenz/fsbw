import type { AcademyFoundationModule, OrganizationProfessionBrain } from './types';

export function generateAcademyModules(brain: OrganizationProfessionBrain): AcademyFoundationModule[] {
  return [
    {
      id: `academy-${brain.id}-employees`,
      brainId: brain.id,
      title: `${brain.label} · Employee Training Track`,
      audiences: ['employee', 'ai-concierge'],
      summary: 'Onboarding, checklists, and scenario learning from organizational Profession Brain — one source for people and AI.',
    },
    {
      id: `academy-${brain.id}-leadership`,
      brainId: brain.id,
      title: `${brain.label} · Leadership Development`,
      audiences: ['leadership', 'certification'],
      summary: 'Decision intelligence and judgment patterns for managers inheriting institutional wisdom.',
    },
    {
      id: `academy-${brain.id}-customer`,
      brainId: brain.id,
      title: `${brain.label} · Customer Education`,
      audiences: ['customer'],
      summary: 'Optional public knowledge surfaces — learn, ask, prepare before consultations.',
    },
  ];
}

export function generateAllAcademyModules(
  brains: OrganizationProfessionBrain[]
): AcademyFoundationModule[] {
  return brains.flatMap(generateAcademyModules);
}
