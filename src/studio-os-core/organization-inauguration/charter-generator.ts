import type { OrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/types';
import { parseServiceList } from '../business-discovery-blueprint/progress';
import type { OrganizationCharter } from './types';

function answer(blueprint: OrganizationDiscoveryBlueprint, promptId: string): string {
  return blueprint.responses.find((r) => r.promptId === promptId)?.answer.trim() ?? '';
}

function parseList(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildOrganizationCharter(
  blueprint: OrganizationDiscoveryBlueprint,
  founderName: string,
  primaryDepartments: string[],
  digitalWorkforceSummary: string
): OrganizationCharter {
  const servicesRaw = answer(blueprint, 'identity-core-services');
  const coreServices = parseServiceList(servicesRaw);
  const valuesRaw =
    answer(blueprint, 'wisdom-new-employee') ||
    answer(blueprint, 'decision-unwritten') ||
    'Documented through Business Discovery Blueprint™';

  return {
    organizationName: answer(blueprint, 'identity-company-name') || blueprint.companyName,
    mission: answer(blueprint, 'identity-mission') || 'Mission preserved in organizational memory.',
    vision: answer(blueprint, 'identity-vision') || 'Vision evolving with the organization.',
    coreServices: coreServices.length > 0 ? coreServices : ['Core services documented in Blueprint'],
    founder: founderName,
    dateEstablished: new Date().toISOString().slice(0, 10),
    coreValues: valuesRaw,
    primaryDepartments:
      primaryDepartments.length > 0
        ? primaryDepartments
        : parseList(answer(blueprint, 'people-departments')).slice(0, 6),
    growthObjectives:
      answer(blueprint, 'growth-vision') ||
      answer(blueprint, 'growth-future-goals') ||
      'Growth objectives captured in Discovery Blueprint.',
    digitalWorkforceSummary,
  };
}

export function resolveFounderName(blueprint: OrganizationDiscoveryBlueprint): string {
  const fromPeople = answer(blueprint, 'people-employees');
  const firstLine = fromPeople.split('\n')[0]?.trim();
  if (firstLine && firstLine.length < 40 && !firstLine.includes(',')) {
    return firstLine.split(/\s+/)[0] ?? 'Founder';
  }
  if (blueprint.organizationId === 'frontal-slayer') return 'Kateena';
  if (blueprint.organizationId === 'ai-media') return 'Kateena';
  return 'Founder';
}
