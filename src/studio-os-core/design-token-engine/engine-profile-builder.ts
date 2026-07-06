import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { computeComponentTokenCoverage, runDesignGovernanceAudit } from './governance-engine';
import { getAllDesignTokens } from './registration';
import { buildThemeTokenSets } from './theme-engine';
import type { DesignTokenHealthMetric, OrganizationDesignTokenEngineProfile } from './types';

export function buildDockEngineLine(profile: OrganizationDesignTokenEngineProfile): string {
  return `Design Token Engine™ ${profile.engineScore}% — ${profile.totalTokens} tokens · ${profile.themes.filter((t) => t.active).length} active theme · ${profile.componentCoveragePct}% component coverage · Design Bible protected.`;
}

function computeHealthMetrics(
  tokens: ReturnType<typeof getAllDesignTokens>,
  componentCoverage: number,
  findings: ReturnType<typeof runDesignGovernanceAudit>
): DesignTokenHealthMetric[] {
  const categories = new Set(tokens.map((t) => t.category)).size;
  const immutable = tokens.filter((t) => t.immutable).length;
  const warnings = findings.filter((f) => f.severity === 'warning').length;

  return [
    {
      id: 'catalog',
      label: 'Token Catalog',
      scorePct: Math.min(99, Math.round((tokens.length / 45) * 100)),
      detail: `${tokens.length} centralized design tokens`,
      status: tokens.length >= 40 ? 'healthy' : 'warning',
    },
    {
      id: 'categories',
      label: 'Category Coverage',
      scorePct: Math.min(99, Math.round((categories / 19) * 100)),
      detail: `${categories}/19 token categories populated`,
      status: categories >= 15 ? 'healthy' : 'warning',
    },
    {
      id: 'component-binding',
      label: 'Component Inheritance',
      scorePct: componentCoverage,
      detail: `${componentCoverage}% components bind design tokens`,
      status: componentCoverage >= 85 ? 'healthy' : 'warning',
    },
    {
      id: 'immutable',
      label: 'Design Bible',
      scorePct: Math.min(99, Math.round((immutable / Math.max(1, tokens.length)) * 100) + 50),
      detail: `${immutable} immutable brand tokens protected`,
      status: 'healthy',
    },
    {
      id: 'governance',
      label: 'Design Governance',
      scorePct: Math.max(0, 100 - warnings * 8),
      detail: warnings === 0 ? 'No governance warnings' : `${warnings} governance findings`,
      status: warnings === 0 ? 'healthy' : 'warning',
    },
    {
      id: 'themes',
      label: 'Theme Readiness',
      scorePct: 72,
      detail: 'Light active · Dark & Future prepared',
      status: 'healthy',
    },
  ];
}

export function buildOrganizationDesignTokenEngineProfile(
  organizationId: string
): OrganizationDesignTokenEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const tokens = getAllDesignTokens();
  const categoryCounts: Record<string, number> = {};
  const governanceFindings = runDesignGovernanceAudit();
  const componentCoveragePct = computeComponentTokenCoverage();

  for (const t of tokens) {
    categoryCounts[t.category] = (categoryCounts[t.category] ?? 0) + 1;
  }

  const healthMetrics = computeHealthMetrics(tokens, componentCoveragePct, governanceFindings);
  const engineScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((s, m) => s + m.scorePct, 0) / healthMetrics.length)
  );

  const profile: OrganizationDesignTokenEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    engineScore,
    totalTokens: tokens.length,
    categoryCounts,
    tokens,
    themes: buildThemeTokenSets(),
    governanceFindings,
    healthMetrics,
    componentCoveragePct,
    dockEngineLine: '',
    designBibleProtected: true,
    lastSyncedAt: now,
  };

  profile.dockEngineLine = buildDockEngineLine(profile);
  return profile;
}

export function summarizeDesignTokenEngine(profile: OrganizationDesignTokenEngineProfile): string {
  const top = Object.entries(profile.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ');
  return `${profile.dockEngineLine} Categories: ${top}.`;
}
