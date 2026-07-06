import type { KnowledgeOwnershipRecord, OrganizationProfessionBrainProfile } from './types';

export function exportProfessionBrainSnapshot(
  profile: OrganizationProfessionBrainProfile
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      organizationId: profile.organizationId,
      version: profile.ownership.versionLabel,
      brains: profile.brains,
      memoryGraph: profile.memoryGraph,
      humanKnowledge: profile.humanKnowledge,
    },
    null,
    2
  );
}

export function recordBrainBackup(profile: OrganizationProfessionBrainProfile): KnowledgeOwnershipRecord {
  return {
    ...profile.ownership,
    backupAt: new Date().toISOString(),
    versionLabel: `v1-backup-${new Date().toISOString().slice(0, 10)}`,
    protected: true,
  };
}

export function recordBrainExport(profile: OrganizationProfessionBrainProfile): KnowledgeOwnershipRecord {
  return {
    ...profile.ownership,
    exportedAt: new Date().toISOString(),
    protected: true,
  };
}

export const OWNERSHIP_CAPABILITIES = [
  'Export complete Profession Brain snapshot',
  'Back up institutional memory',
  'Version knowledge over time',
  'Transfer ownership to future leadership',
  'Archive retired brains',
  'Protect sensitive operational knowledge',
  'Restore from backup',
] as const;
