import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  computeTotalReuseScore,
  getAllRegisteredComponents,
  validateComponentEntry,
} from './registration';
import type { ComponentRegistryHealthMetric, OrganizationComponentRegistryProfile } from './types';

export function buildDockRegistryLine(profile: OrganizationComponentRegistryProfile): string {
  return `Component Registry™ ${profile.registryScore}% — ${profile.totalComponents} components · avg reuse ${profile.totalReuseScore}% · assemble interfaces, never recreate.`;
}

function computeHealthMetrics(components: ReturnType<typeof getAllRegisteredComponents>): ComponentRegistryHealthMetric[] {
  const total = components.length;
  const withDocs = components.filter((c) => c.documentation.length > 0).length;
  const withA11y = components.filter((c) => c.accessibility.length > 0).length;
  const withTokens = components.filter((c) => c.designTokens.length > 0).length;
  const broken = components.filter((c) => validateComponentEntry(c).length > 0).length;
  const highReuse = components.filter((c) => c.reuseScore >= 90).length;

  return [
    {
      id: 'catalog',
      label: 'Component Catalog',
      scorePct: Math.min(99, Math.round((total / 40) * 100)),
      detail: `${total} reusable components registered`,
      status: total >= 30 ? 'healthy' : 'warning',
    },
    {
      id: 'reuse',
      label: 'Reuse Score',
      scorePct: computeTotalReuseScore(components),
      detail: `${highReuse}/${total} components above 90% reuse`,
      status: highReuse >= total * 0.8 ? 'healthy' : 'warning',
    },
    {
      id: 'documentation',
      label: 'Component Docs',
      scorePct: Math.round((withDocs / Math.max(1, total)) * 100),
      detail: `${withDocs}/${total} link documentation`,
      status: withDocs >= total * 0.85 ? 'healthy' : 'warning',
    },
    {
      id: 'accessibility',
      label: 'Accessibility Rules',
      scorePct: Math.round((withA11y / Math.max(1, total)) * 100),
      detail: `${withA11y}/${total} declare accessibility rules`,
      status: 'healthy',
    },
    {
      id: 'design-tokens',
      label: 'Design Tokens',
      scorePct: Math.round((withTokens / Math.max(1, total)) * 100),
      detail: `${withTokens}/${total} bind design tokens`,
      status: withTokens >= total * 0.9 ? 'healthy' : 'warning',
    },
    {
      id: 'integrity',
      label: 'Registry Integrity',
      scorePct: Math.max(0, 100 - broken * 15),
      detail: broken === 0 ? 'All components validated' : `${broken} need metadata`,
      status: broken === 0 ? 'healthy' : 'warning',
    },
  ];
}

export function buildOrganizationComponentRegistryProfile(
  organizationId: string
): OrganizationComponentRegistryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const components = getAllRegisteredComponents();
  const categoryCounts: Record<string, number> = {};

  for (const c of components) {
    categoryCounts[c.category] = (categoryCounts[c.category] ?? 0) + 1;
  }

  const healthMetrics = computeHealthMetrics(components);
  const registryScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((s, m) => s + m.scorePct, 0) / healthMetrics.length)
  );

  const profile: OrganizationComponentRegistryProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    registryScore,
    totalComponents: components.length,
    categoryCounts,
    components,
    healthMetrics,
    totalReuseScore: computeTotalReuseScore(components),
    dockRegistryLine: '',
    lastIndexedAt: now,
  };

  profile.dockRegistryLine = buildDockRegistryLine(profile);
  return profile;
}

export function summarizeComponentRegistry(profile: OrganizationComponentRegistryProfile): string {
  const top = Object.entries(profile.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ');
  return `${profile.dockRegistryLine} Categories: ${top}.`;
}
