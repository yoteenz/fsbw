import type { RuntimeConfigCategory, RuntimeConfigurationEntry } from './types';

const CONFIG_SEEDS: Omit<RuntimeConfigurationEntry, 'configId' | 'scoped' | 'affectsOtherOrganizations'>[] = [
  { category: 'installed-modules', label: 'Studio OS Core Modules', value: '42 modules active · M136 sync chain' },
  { category: 'department-packs', label: 'Operations Pack', value: 'Installed · v2.1' },
  { category: 'profession-packs', label: 'Profession Brain Pack', value: 'Custom · organization-scoped' },
  { category: 'industry-packs', label: 'Industry Architecture', value: 'From Organization Genome' },
  { category: 'brand-identity', label: 'Brand Voice', value: 'PRESERVE EXPERTISE. BUILD LEGACY.' },
  { category: 'themes', label: 'Executive IA Theme', value: 'Light · Design Token Engine synced' },
  { category: 'custom-policies', label: 'Policy Engine Layer', value: 'Organization policies active' },
  { category: 'organization-preferences', label: 'Relationship Memory', value: 'Founder preferences applied' },
  { category: 'feature-flags', label: 'Sandbox Preview', value: 'Enabled for testing runtime' },
  { category: 'regional-settings', label: 'Timezone & Locale', value: 'America/New_York · en-US' },
  { category: 'ai-provider-preferences', label: 'Model Orchestrator', value: 'GPT-4o primary · Claude fallback' },
];

/** Runtime configuration — configurable without affecting other organizations. */
export function buildRuntimeConfiguration(): RuntimeConfigurationEntry[] {
  return CONFIG_SEEDS.map((seed, i) => ({
    configId: `cfg-${seed.category}-${i}`,
    scoped: true,
    affectsOtherOrganizations: false,
    ...seed,
  }));
}

export function getConfigByCategory(category: RuntimeConfigCategory): RuntimeConfigurationEntry[] {
  return buildRuntimeConfiguration().filter((c) => c.category === category);
}

export function countModulesRequiringUpdate(): number {
  return 3;
}

export function listModulesRequiringUpdate(): string[] {
  return ['Automation Registry™', 'Prompt Registry™', 'Policy Engine™'];
}
