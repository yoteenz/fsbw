import { listBuildOrderRegistry } from '../build-order/registry';
import type { RiskLevel } from '../constants';
import type { RewriteRiskEntry } from '../types';

/** Rewrite risks from STUDIO_OS_BUILD_ORDER.md §9 */
const REWRITE_RISKS: Omit<RewriteRiskEntry, 'affectedSystemIds'>[] = [
  {
    riskId: 'duplicate-company-models',
    label: 'Duplicate company models',
    trigger: 'Building HQ before Company Registry™',
    prevention: 'Company Registry owns company/department/membership truth.',
    severity: 'high',
  },
  {
    riskId: 'ai-command-rewrite',
    label: 'AI command rewrite',
    trigger: 'Building Orb before Command Center™',
    prevention: 'Orb only routes through command/permission contracts.',
    severity: 'critical',
  },
  {
    riskId: 'analytics-rewrite',
    label: 'Analytics rewrite',
    trigger: 'Tracking metrics before Event Bus™',
    prevention: 'Analytics consumes event contracts only.',
    severity: 'high',
  },
  {
    riskId: 'search-rewrite',
    label: 'Search rewrite',
    trigger: 'Building feature-specific search',
    prevention: 'Search indexes World Graph/Knowledge Graph with permissions filters.',
    severity: 'high',
  },
  {
    riskId: 'marketplace-rewrite',
    label: 'Marketplace rewrite',
    trigger: 'Building commerce before Asset/Identity/Entitlement',
    prevention: 'Studio Exchange owns listings; Marketplace owns transaction adapters.',
    severity: 'critical',
  },
  {
    riskId: 'sdk-rewrite',
    label: 'SDK rewrite',
    trigger: 'Publishing SDK before API contract stability',
    prevention: 'API Layer is the public boundary; SDK is generated/wrapped from it.',
    severity: 'critical',
  },
  {
    riskId: 'experience-rewrite',
    label: 'Experience rewrite',
    trigger: 'Building scenes without Scene Engine™',
    prevention: 'Experience Engine consumes scene/asset/world references.',
    severity: 'high',
  },
  {
    riskId: 'automation-rewrite',
    label: 'Automation rewrite',
    trigger: 'Automating without workflow/permission/audit',
    prevention: 'Automation executes only approved Command Center/Workflow steps.',
    severity: 'critical',
  },
];

const RISK_SYSTEM_MAP: Record<string, string[]> = {
  'duplicate-company-models': ['executive-headquarters', 'company-registry'],
  'ai-command-rewrite': ['orb', 'command-center'],
  'analytics-rewrite': ['analytics', 'event-bus'],
  'search-rewrite': ['search', 'world-graph', 'knowledge-graph'],
  'marketplace-rewrite': ['marketplace', 'studio-exchange', 'asset-registry', 'identity-engine'],
  'sdk-rewrite': ['developer-sdk', 'api-layer', 'codex'],
  'experience-rewrite': ['experience-engine', 'scene-engine'],
  'automation-rewrite': ['automation-engine', 'command-center', 'workflow-engine', 'permissions-engine'],
};

/** Rewrite Risk Analyzer™ */
export function getRewriteRiskAnalysis(): RewriteRiskEntry[] {
  const registry = listBuildOrderRegistry();
  const byId = new Map(registry.map((s) => [s.systemId, s]));

  return REWRITE_RISKS.map((risk) => {
    const affectedSystemIds = (RISK_SYSTEM_MAP[risk.riskId] ?? []).filter((id) => byId.has(id));
    return { ...risk, affectedSystemIds };
  });
}

export function getHighRewriteRiskSystems(): ReturnType<typeof listBuildOrderRegistry> {
  return listBuildOrderRegistry()
    .filter((s) => s.rewriteRisk === 'high' || s.rewriteRisk === 'critical')
    .sort((a, b) => {
      const order: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.rewriteRisk] - order[b.rewriteRisk];
    });
}

export function getRewriteRiskSummary(): Record<RiskLevel, number> {
  const systems = listBuildOrderRegistry();
  return {
    low: systems.filter((s) => s.rewriteRisk === 'low').length,
    medium: systems.filter((s) => s.rewriteRisk === 'medium').length,
    high: systems.filter((s) => s.rewriteRisk === 'high').length,
    critical: systems.filter((s) => s.rewriteRisk === 'critical').length,
  };
}
