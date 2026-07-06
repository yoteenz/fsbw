import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildAccessibilitySpecs } from './accessibility-engine';
import { computeComponentInteractionCompliance, runInteractionGovernanceAudit } from './governance-engine';
import { buildMotionStandards } from './motion-engine';
import { getAllInteractionPatterns } from './registration';
import { buildInteractionStateSpecs } from './state-engine';
import type { InteractionHealthMetric, OrganizationInteractionEngineProfile } from './types';

export function buildDockEngineLine(profile: OrganizationInteractionEngineProfile): string {
  return `Interaction Engine™ ${profile.engineScore}% — ${profile.totalPatterns} patterns · ${profile.totalStates} states · ${profile.componentCompliancePct}% component compliance · behavioral cohesion protected.`;
}

function computeHealthMetrics(
  patterns: ReturnType<typeof getAllInteractionPatterns>,
  compliance: number,
  findings: ReturnType<typeof runInteractionGovernanceAudit>
): InteractionHealthMetric[] {
  const types = new Set(patterns.map((p) => p.type)).size;
  const standard = patterns.filter((p) => p.platformStandard).length;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const a11y = buildAccessibilitySpecs().filter((s) => s.mandatory).length;

  return [
    {
      id: 'catalog',
      label: 'Pattern Catalog',
      scorePct: Math.min(99, Math.round((patterns.length / 40) * 100)),
      detail: `${patterns.length} standardized interaction patterns`,
      status: patterns.length >= 35 ? 'healthy' : 'warning',
    },
    {
      id: 'types',
      label: 'Pattern Types',
      scorePct: Math.min(99, Math.round((types / 8) * 100)),
      detail: `${types}/8 interaction pattern types covered`,
      status: types >= 6 ? 'healthy' : 'warning',
    },
    {
      id: 'states',
      label: 'State Coverage',
      scorePct: Math.min(99, Math.round((buildInteractionStateSpecs().filter((s) => s.required).length / 8) * 100)),
      detail: `${buildInteractionStateSpecs().length} interaction states defined`,
      status: 'healthy',
    },
    {
      id: 'motion',
      label: 'Motion Standards',
      scorePct: Math.min(99, Math.round((buildMotionStandards().length / 18) * 100)),
      detail: `${buildMotionStandards().length} motion standards active`,
      status: 'healthy',
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      scorePct: Math.min(99, Math.round((a11y / 7) * 100)),
      detail: `${a11y} mandatory accessibility requirements`,
      status: a11y >= 7 ? 'healthy' : 'warning',
    },
    {
      id: 'compliance',
      label: 'Component Compliance',
      scorePct: compliance,
      detail: `${compliance}% components declare interaction rules`,
      status: compliance >= 80 ? 'healthy' : 'warning',
    },
    {
      id: 'governance',
      label: 'Behavior Governance',
      scorePct: Math.max(0, 100 - warnings * 8),
      detail: warnings === 0 ? 'No governance warnings' : `${warnings} governance findings`,
      status: warnings === 0 ? 'healthy' : 'warning',
    },
    {
      id: 'cohesion',
      label: 'Platform Cohesion',
      scorePct: Math.min(99, Math.round((standard / Math.max(1, patterns.length)) * 100)),
      detail: `${standard} platform-standard patterns`,
      status: 'healthy',
    },
  ];
}

export function buildOrganizationInteractionEngineProfile(
  organizationId: string
): OrganizationInteractionEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const patterns = getAllInteractionPatterns();
  const patternTypeCounts: Record<string, number> = {};
  const governanceFindings = runInteractionGovernanceAudit();
  const componentCompliancePct = computeComponentInteractionCompliance();

  for (const p of patterns) {
    patternTypeCounts[p.type] = (patternTypeCounts[p.type] ?? 0) + 1;
  }

  const healthMetrics = computeHealthMetrics(patterns, componentCompliancePct, governanceFindings);
  const engineScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((s, m) => s + m.scorePct, 0) / healthMetrics.length)
  );

  const profile: OrganizationInteractionEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    engineScore,
    totalPatterns: patterns.length,
    totalStates: buildInteractionStateSpecs().length,
    patternTypeCounts,
    patterns,
    states: buildInteractionStateSpecs(),
    motionStandards: buildMotionStandards(),
    accessibilitySpecs: buildAccessibilitySpecs(),
    governanceFindings,
    healthMetrics,
    componentCompliancePct,
    dockEngineLine: '',
    behavioralCohesion: true,
    lastSyncedAt: now,
  };

  profile.dockEngineLine = buildDockEngineLine(profile);
  return profile;
}

export function summarizeInteractionEngine(profile: OrganizationInteractionEngineProfile): string {
  const top = Object.entries(profile.patternTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ');
  return `${profile.dockEngineLine} Types: ${top}.`;
}
