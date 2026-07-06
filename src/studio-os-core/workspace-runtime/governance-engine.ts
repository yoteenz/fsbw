import { buildRuntimeComponents } from './runtime-catalog';
import type { RuntimeIsolationFinding } from './types';

export function runRuntimeGovernanceAudit(): RuntimeIsolationFinding[] {
  const components = buildRuntimeComponents();
  const findings: RuntimeIsolationFinding[] = [];

  const updating = components.filter((c) => c.status === 'updating');
  if (updating.length > 0) {
    findings.push({
      id: 'components-updating',
      severity: 'info',
      message: `${updating.length} runtime component(s) syncing — ${updating.map((c) => c.name).join(', ')}.`,
      recommendation: 'Allow sync chain to complete before production publish.',
    });
  }

  findings.push({
    id: 'independent-headquarters',
    severity: 'info',
    message: `${components.length} isolated runtime components — independent digital headquarters.`,
    recommendation: 'Every organization feels like it owns its own operating system.',
  });

  return findings;
}
