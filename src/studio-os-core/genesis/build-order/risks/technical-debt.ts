import { listBuildOrderRegistry } from '../build-order/registry';
import type { RiskLevel } from '../constants';
import type { TechnicalDebtEntry } from '../types';

/** Technical debt risks from STUDIO_OS_BUILD_ORDER.md §10 */
const TECHNICAL_DEBT_RISKS: Omit<TechnicalDebtEntry, 'affectedSystemIds'>[] = [
  {
    debtId: 'feature-specific-stores',
    label: 'Feature-specific stores',
    consequence: 'State fragmentation and migrations later.',
    governanceRule: 'Every store declares owning system and canonical object type.',
    severity: 'high',
  },
  {
    debtId: 'hidden-event-side-effects',
    label: 'Hidden event side effects',
    consequence: 'Debugging and audit failures.',
    governanceRule: 'Cross-system behavior emits Universal Interaction events.',
    severity: 'high',
  },
  {
    debtId: 'direct-permission-checks-ui',
    label: 'Direct permission checks in UI',
    consequence: 'Security drift.',
    governanceRule: 'UI asks Permissions Engine/API Layer, never owns policy.',
    severity: 'critical',
  },
  {
    debtId: 'ai-memory-knowledge-truth',
    label: 'AI memory mixed with knowledge truth',
    consequence: 'Hallucinated source-of-truth.',
    governanceRule: 'Memory candidates go through Knowledge Retention/Professional Memory review.',
    severity: 'high',
  },
  {
    debtId: 'components-as-architecture',
    label: 'Components as architecture',
    consequence: 'UI becomes source of platform semantics.',
    governanceRule: 'UI is projection; registries own semantics.',
    severity: 'medium',
  },
  {
    debtId: 'premature-public-api',
    label: 'Premature public API',
    consequence: 'External compatibility locks bad internals.',
    governanceRule: 'API Layer comes after permission and core contracts stabilize.',
    severity: 'critical',
  },
  {
    debtId: 'marketplace-before-entitlement',
    label: 'Marketplace before entitlement truth',
    consequence: 'Revenue, licensing, and fulfillment ambiguity.',
    governanceRule: 'Entitlement model ships before marketplace transactions.',
    severity: 'critical',
  },
];

const DEBT_SYSTEM_MAP: Record<string, string[]> = {
  'feature-specific-stores': ['company-registry', 'knowledge-core', 'asset-registry'],
  'hidden-event-side-effects': ['event-bus', 'universal-interaction-engine', 'workflow-engine'],
  'direct-permission-checks-ui': ['permissions-engine', 'api-layer', 'executive-headquarters'],
  'ai-memory-knowledge-truth': ['professional-memory', 'knowledge-retention', 'knowledge-core'],
  'components-as-architecture': ['executive-headquarters', 'workspace-framework', 'experience-engine'],
  'premature-public-api': ['api-layer', 'developer-sdk', 'integration-framework'],
  'marketplace-before-entitlement': ['marketplace', 'studio-exchange'],
};

/** Technical Debt Analyzer™ */
export function getTechnicalDebtForecast(): TechnicalDebtEntry[] {
  const registry = listBuildOrderRegistry();
  const byId = new Map(registry.map((s) => [s.systemId, s]));

  return TECHNICAL_DEBT_RISKS.map((debt) => {
    const affectedSystemIds = (DEBT_SYSTEM_MAP[debt.debtId] ?? []).filter((id) => byId.has(id));
    return { ...debt, affectedSystemIds };
  });
}

export function getHighTechnicalDebtSystems(): ReturnType<typeof listBuildOrderRegistry> {
  return listBuildOrderRegistry()
    .filter((s) => s.technicalDebtRisk === 'high' || s.technicalDebtRisk === 'critical')
    .sort((a, b) => {
      const order: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.technicalDebtRisk] - order[b.technicalDebtRisk];
    });
}

export function getTechnicalDebtSummary(): Record<RiskLevel, number> {
  const systems = listBuildOrderRegistry();
  return {
    low: systems.filter((s) => s.technicalDebtRisk === 'low').length,
    medium: systems.filter((s) => s.technicalDebtRisk === 'medium').length,
    high: systems.filter((s) => s.technicalDebtRisk === 'high').length,
    critical: systems.filter((s) => s.technicalDebtRisk === 'critical').length,
  };
}
