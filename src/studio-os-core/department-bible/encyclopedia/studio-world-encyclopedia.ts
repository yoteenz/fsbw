import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { getCanonicalDepartmentRecord } from '../../canonical-studio-world/canonical-department-registry';
import { DEPARTMENT_BIBLE_REGISTRY } from '../registry/bible-registry';
import { resolveAiWorkersForDepartment } from '../registry/ai-workforce-directory';
import { queryDownstream, queryUpstream } from '../relationships/relationship-graph';
import { resolveDepartmentPermissionModel } from '../permissions/permission-model';
import { resolveDepartmentLifecycleModel } from '../lifecycles/lifecycle-model';
import { resolveArchitecturalDna } from '../../architectural-dna/registry/dna-registry';
import { resolveGoldenReferencePack } from '../../architectural-dna/references/golden-reference-library';

export const STUDIO_WORLD_ENCYCLOPEDIA_VERSION = 'studio-world-encyclopedia.v1' as const;

export type EncyclopediaEntry = {
  entryVersion: typeof STUDIO_WORLD_ENCYCLOPEDIA_VERSION;
  departmentId: CanonicalMainDepartmentId;
  officialName: string;
  purpose: string;
  mission: string;
  history: string;
  owner: string;
  version: string;
  architecture: {
    dnaVersion: string;
    blueprintRevision: number;
    goldenReferencePackId: string;
  };
  aiWorkers: string[];
  dependencies: string[];
  upstream: CanonicalMainDepartmentId[];
  downstream: CanonicalMainDepartmentId[];
  flows: string[];
  permissions: string[];
  marketplaceRules: string[];
  knownIssues: string[];
  futurePlans: string;
};

export type StudioWorldEncyclopedia = {
  encyclopediaVersion: typeof STUDIO_WORLD_ENCYCLOPEDIA_VERSION;
  encyclopediaRevision: number;
  entries: EncyclopediaEntry[];
};

function buildEntry(departmentId: CanonicalMainDepartmentId): EncyclopediaEntry {
  const bible = DEPARTMENT_BIBLE_REGISTRY[departmentId];
  const record = getCanonicalDepartmentRecord(departmentId)!;
  const workers = resolveAiWorkersForDepartment(departmentId);
  const permissions = resolveDepartmentPermissionModel(departmentId);
  const lifecycle = resolveDepartmentLifecycleModel(departmentId);
  const dna = resolveArchitecturalDna(departmentId);
  const goldenPack = resolveGoldenReferencePack(departmentId);

  return {
    entryVersion: STUDIO_WORLD_ENCYCLOPEDIA_VERSION,
    departmentId,
    officialName: bible.officialName,
    purpose: bible.purpose,
    mission: bible.mission,
    history: `Canonical department registered in ${record.category} category — blueprint revision ${record.blueprintRevision}.`,
    owner: record.adminOnly ? 'Studio World Admin' : 'Studio World',
    version: `${bible.bibleVersion} r${bible.bibleRevision}`,
    architecture: {
      dnaVersion: dna.dnaVersion,
      blueprintRevision: record.blueprintRevision,
      goldenReferencePackId: goldenPack.packId,
    },
    aiWorkers: workers.map((w) => w.displayName),
    dependencies: bible.dependencies,
    upstream: queryUpstream(departmentId),
    downstream: queryDownstream(departmentId),
    flows: [...bible.responsibilities, ...lifecycle.states.map((s) => `lifecycle:${s}`)],
    permissions: permissions.grants.map((g) => `${g.role}:${g.capabilities.join(',')}`),
    marketplaceRules: bible.marketplaceParticipation
      ? ['marketplace-eligible', ...bible.auditRules]
      : ['canonical-only', ...bible.auditRules],
    knownIssues: bible.failureModes,
    futurePlans: bible.futureVision,
  };
}

export function buildStudioWorldEncyclopedia(): StudioWorldEncyclopedia {
  const entries = Object.keys(DEPARTMENT_BIBLE_REGISTRY).map((id) =>
    buildEntry(id as CanonicalMainDepartmentId)
  );
  return { encyclopediaVersion: STUDIO_WORLD_ENCYCLOPEDIA_VERSION, encyclopediaRevision: 1, entries };
}

export function searchEncyclopedia(query: string): EncyclopediaEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return buildStudioWorldEncyclopedia().entries;
  return buildStudioWorldEncyclopedia().entries.filter(
    (e) =>
      e.officialName.toLowerCase().includes(q) ||
      e.departmentId.includes(q) ||
      e.mission.toLowerCase().includes(q) ||
      e.purpose.toLowerCase().includes(q) ||
      e.aiWorkers.some((w) => w.toLowerCase().includes(q))
  );
}

export function getEncyclopediaEntry(departmentId: CanonicalMainDepartmentId): EncyclopediaEntry {
  return buildEntry(departmentId);
}
