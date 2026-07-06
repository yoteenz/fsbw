import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { computeRegistrationCoveragePct, runPromptGovernanceAudit } from './governance-engine';
import { getAllPrompts } from './registration';
import { buildSeedTestResults, computeAverageQualityScore } from './testing-engine';
import { buildSeedVersionHistory, comparePromptVersions } from './version-history';
import type { PromptHealthMetric, OrganizationPromptRegistryProfile, PromptImprovementRecommendation } from './types';

export function buildDockRegistryLine(profile: OrganizationPromptRegistryProfile): string {
  return `Prompt Registry™ ${profile.registryScore}% — ${profile.totalPrompts} registered · ${profile.activeCount} active · ${profile.avgQualityScorePct}% avg quality · prompts are code.`;
}

function buildImprovementRecommendations(
  prompts: ReturnType<typeof getAllPrompts>
): PromptImprovementRecommendation[] {
  const recs: PromptImprovementRecommendation[] = [];

  const lowQuality = prompts.filter((p) => p.qualityScorePct < 80);
  for (const p of lowQuality.slice(0, 2)) {
    recs.push({
      id: `improve-${p.promptId}`,
      promptId: p.promptId,
      title: `Improve ${p.name} quality (${p.qualityScorePct}%)`,
      detail: 'Run prompt testing and compare version history before next deployment.',
      priority: 'high',
    });
  }

  const drafts = prompts.filter((p) => p.status === 'draft');
  if (drafts.length > 0) {
    recs.push({
      id: 'approve-drafts',
      title: `${drafts.length} draft prompt(s) awaiting test and approval`,
      detail: 'Use Prompt Testing environment before promoting to active.',
      priority: 'medium',
    });
  }

  recs.push({
    id: 'version-review',
    title: 'Review Executive Council prompt v6 pending approval',
    detail: 'Compare v5 vs v6 — improved action item extraction.',
    priority: 'medium',
  });

  recs.push({
    id: 'fallback-coverage',
    title: 'Define fallback prompts for system prompts',
    detail: 'Enable graceful degradation via Model Orchestrator failover.',
    priority: 'low',
  });

  return recs;
}

function computeHealthMetrics(
  prompts: ReturnType<typeof getAllPrompts>,
  coverage: number,
  avgQuality: number,
  findings: ReturnType<typeof runPromptGovernanceAudit>
): PromptHealthMetric[] {
  const categories = new Set(prompts.map((p) => p.category)).size;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const critical = findings.filter((f) => f.severity === 'critical').length;

  return [
    {
      id: 'catalog',
      label: 'Prompt Catalog',
      scorePct: Math.min(99, Math.round((prompts.length / 20) * 100)),
      detail: `${prompts.length} registered prompts`,
      status: prompts.length >= 18 ? 'healthy' : 'warning',
    },
    {
      id: 'registration',
      label: 'Registration Gate',
      scorePct: coverage,
      detail: `${coverage}% prompts registered before AI execution`,
      status: coverage >= 95 ? 'healthy' : 'warning',
    },
    {
      id: 'categories',
      label: 'Category Coverage',
      scorePct: Math.min(99, Math.round((categories / 16) * 100)),
      detail: `${categories}/16 prompt categories`,
      status: categories >= 12 ? 'healthy' : 'warning',
    },
    {
      id: 'quality',
      label: 'Prompt Quality',
      scorePct: avgQuality,
      detail: `${avgQuality}% average quality score from testing`,
      status: avgQuality >= 88 ? 'healthy' : avgQuality >= 75 ? 'warning' : 'critical',
    },
    {
      id: 'versioning',
      label: 'Version History',
      scorePct: 95,
      detail: 'Complete history — compare, restore, test, approve',
      status: 'healthy',
    },
    {
      id: 'testing',
      label: 'Prompt Testing',
      scorePct: 93,
      detail: 'Quality · consistency · latency · cost · tokens · trust',
      status: 'healthy',
    },
    {
      id: 'governance',
      label: 'Registry Governance',
      scorePct: Math.max(0, 100 - warnings * 8 - critical * 15),
      detail: critical === 0 && warnings === 0 ? 'No governance violations' : `${critical} critical · ${warnings} warnings`,
      status: critical === 0 && warnings === 0 ? 'healthy' : warnings > 0 ? 'warning' : 'critical',
    },
    {
      id: 'transparency',
      label: 'AI Transparency',
      scorePct: 97,
      detail: 'No hidden prompt text — first-class platform assets',
      status: 'healthy',
    },
  ];
}

export function buildOrganizationPromptRegistryProfile(organizationId: string): OrganizationPromptRegistryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const prompts = getAllPrompts();
  const categoryCounts: Record<string, number> = {};
  const governanceFindings = runPromptGovernanceAudit();
  const coveragePct = computeRegistrationCoveragePct();
  const versionHistory = buildSeedVersionHistory();
  const testResults = buildSeedTestResults();

  for (const p of prompts) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }

  const avgQualityScorePct =
    prompts.length === 0
      ? 0
      : Math.round(prompts.reduce((s, p) => s + p.qualityScorePct, 0) / prompts.length);

  const testAvg = computeAverageQualityScore(testResults);
  const healthMetrics = computeHealthMetrics(prompts, coveragePct, testAvg || avgQualityScorePct, governanceFindings);
  const registryScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((s, m) => s + m.scorePct, 0) / healthMetrics.length)
  );

  const councilCompare = comparePromptVersions(
    'executive-council.meeting-synthesis',
    '5.0.0',
    '6.0.0',
    versionHistory
  );

  const profile: OrganizationPromptRegistryProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    registryScore,
    totalPrompts: prompts.length,
    activeCount: prompts.filter((p) => p.status === 'active').length,
    draftCount: prompts.filter((p) => p.status === 'draft').length,
    pendingApprovalCount: versionHistory.filter((v) => v.status === 'pending-approval').length,
    categoryCounts,
    prompts,
    versionHistory,
    testResults,
    versionComparisons: councilCompare ? [councilCompare] : [],
    recommendations: buildImprovementRecommendations(prompts),
    governanceFindings,
    healthMetrics,
    avgQualityScorePct: testAvg || avgQualityScorePct,
    dockRegistryLine: '',
    firstClassPrompts: true,
    lastSyncedAt: now,
  };

  profile.dockRegistryLine = buildDockRegistryLine(profile);
  return profile;
}

export function summarizePromptRegistry(profile: OrganizationPromptRegistryProfile): string {
  const top = Object.entries(profile.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ');
  return `${profile.dockRegistryLine} Categories: ${top}.`;
}
