import type { OrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/types';
import type { FounderWelcomeMessage } from './types';
import { resolveFounderName } from './charter-generator';

function answer(blueprint: OrganizationDiscoveryBlueprint, promptId: string): string {
  return blueprint.responses.find((r) => r.promptId === promptId)?.answer.trim() ?? '';
}

export function buildFounderWelcomeMessage(blueprint: OrganizationDiscoveryBlueprint): FounderWelcomeMessage {
  const founderName = resolveFounderName(blueprint);
  const mission = answer(blueprint, 'identity-mission');
  const uvp = answer(blueprint, 'identity-uvp');
  const stress = answer(blueprint, 'founder-stress');
  const vision = answer(blueprint, 'growth-vision') || answer(blueprint, 'identity-vision');
  const company = answer(blueprint, 'identity-company-name') || blueprint.companyName;

  const purposeLine = mission
    ? `Your organization exists to ${mission.charAt(0).toLowerCase()}${mission.slice(1).replace(/\.$/, '')}.`
    : uvp
      ? `Your organization exists to deliver on a promise: ${uvp.replace(/\.$/, '')}.`
      : `${company} now has a documented foundation inside Studio OS.`;

  const paragraphs: string[] = [
    `${founderName},`,
    purposeLine,
    'We\'ve documented the foundation of your company — how you think, decide, serve customers, and grow.',
    'Your Headquarters is now operational. Mission Control, departments, and Digital Staff are awakening for the first time.',
  ];

  if (stress) {
    paragraphs.push(`Studio OS heard what keeps you up at night: ${stress.replace(/\.$/, '')}. We will learn alongside you as that evolves.`);
  }

  if (vision) {
    paragraphs.push(`Your vision — ${vision.replace(/\.$/, '')} — is now part of your organization's permanent memory.`);
  }

  return {
    founderName,
    paragraphs,
    closingLine: 'As your organization grows, I will continue learning alongside you.',
  };
}
