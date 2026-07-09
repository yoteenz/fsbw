import { evaluateProductionGate } from '../../narrative-intelligence/engines/production-gate';
import { getNarrativeBlueprint } from '../../narrative-intelligence/engines/narrative-blueprint-generator';
import { listProductionPackages } from '../../studio-production-system/engines/production-coordinator';
import { mutateCreativeOperatingSystemStore, readCreativeOperatingSystemStore } from '../persistence';
import type { XcosGovernanceRecord } from '../types';

/** Creative Governance Engine™ — policy enforcement across creative organization */
export function evaluateCreativeGovernance(): XcosGovernanceRecord[] {
  const packages = listProductionPackages();
  const records: XcosGovernanceRecord[] = [];

  records.push({
    recordId: 'gov-founder-decision',
    policy: 'Founder makes final creative decisions',
    status: 'active',
    summary: 'All board recommendations require founder approval before production authorization',
    recommendation: 'Preserve founder decision gate in Board Meeting workflow',
  });

  records.push({
    recordId: 'gov-evidence-debate',
    policy: 'Executives debate with evidence, not opinion',
    status: 'active',
    summary: 'Executive briefs must cite intelligence sources',
    recommendation: 'Reject council sessions without evidence references',
  });

  const unapprovedBlueprints = packages.filter((p) => {
    const bp = getNarrativeBlueprint(p.blueprintId);
    return bp && bp.status !== 'approved';
  });

  if (unapprovedBlueprints.length > 0) {
    records.push({
      recordId: 'gov-blueprint-approval',
      policy: 'No asset production without approved Narrative Blueprint™',
      status: 'warning',
      summary: `${unapprovedBlueprints.length} production(s) with unapproved blueprints`,
      recommendation: 'Convene council and obtain founder approval before asset generation',
    });
  }

  unapprovedBlueprints.forEach((p) => {
    const gate = evaluateProductionGate(getNarrativeBlueprint(p.blueprintId)!);
    if (!gate.allowed) {
      records.push({
        recordId: `gov-gate-${p.packageId}`,
        policy: 'Production gate enforcement',
        status: 'violation',
        summary: `${p.topic}: ${gate.reason}`,
        recommendation: 'Resolve narrative gate before proceeding',
      });
    }
  });

  mutateCreativeOperatingSystemStore((store) => ({
    ...store,
    governanceRecords: records,
  }));

  return records;
}

export function listGovernanceRecords(): XcosGovernanceRecord[] {
  return readCreativeOperatingSystemStore().governanceRecords;
}

export function hasGovernanceViolations(): boolean {
  return listGovernanceRecords().some((r) => r.status === 'violation');
}
