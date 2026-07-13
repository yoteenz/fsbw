import type { CanonicalDepartment, CanonicalDepartmentId } from './contract';
import { CANONICAL_STUDIO_WORLD_VERSION } from './contract';

function dept(
  departmentId: CanonicalDepartmentId,
  displayName: string,
  purpose: string,
  routePath: string
): CanonicalDepartment {
  return {
    departmentId,
    displayName,
    purpose,
    routePath,
    scope: 'studio-world-global',
    registryVersion: CANONICAL_STUDIO_WORLD_VERSION,
  };
}

/** Canonical departments exist once globally — companies never own copies. */
export const CANONICAL_DEPARTMENT_REGISTRY: CanonicalDepartment[] = [
  dept('experience-lab', 'Experience Lab™', 'Master architecture department — Industry Pack planning', '/admin/studio/experience-lab'),
  dept('creative-director-studio', 'Creative Director Studio™', 'Asset manufacturing on approved HQ', '/admin/studio/department/creative-direction'),
  dept('construction-mode', 'Construction Mode™', 'Assembly-only — approved assets', '/admin/studio/world/construction-mode'),
  dept('marketplace', 'Marketplace™', 'Industry packs · departments · headquarters commerce', '/admin/studio/marketplace'),
  dept('permit-office', 'Permit Office™', 'Municipal construction permits', '/admin/studio/constitution-hall'),
  dept('city-council', 'City Council™', 'Governance and mod approval', '/admin/studio/constitution-hall'),
  dept('composition-studio', 'Composition Studio™', 'Device framing — not redesign', '/admin/studio/experience-lab'),
  dept('asset-registry', 'Asset Registry™', 'Global asset registry vault', '/admin/studio/asset-registry'),
  dept('lighting-studio', 'Lighting Studio™', 'Lighting profiles and tests', '/admin/studio/studio-warehouse'),
  dept('material-library', 'Material Library™', 'Founder material library', '/admin/studio/brand-assets'),
  dept('blueprint-author', 'Blueprint Author™', 'Deterministic construction specifications', '/admin/studio/experience-lab'),
  dept('ai-workforce', 'AI Workforce™', 'Manufacturing workers and queue', '/admin/studio/render-queue'),
  dept('immune-system', 'Immune System™', 'Routing and boundary enforcement', '/admin/studio/governance'),
  dept('quality-guard', 'Quality Guard™', 'Composition and asset parity enforcement', '/admin/studio/qa-headquarters'),
  dept('world-compiler', 'World Compiler™', 'Living experience assembly', '/admin/studio/experience-engine'),
  dept('asset-vault', 'Asset Vault™', 'Media vault and archives', '/admin/studio/asset-library'),
  dept('command-center', 'Command Center™', 'Studio World executive bridge', '/admin/studio/overview'),
];

export function getCanonicalDepartment(id: CanonicalDepartmentId): CanonicalDepartment | undefined {
  return CANONICAL_DEPARTMENT_REGISTRY.find((d) => d.departmentId === id);
}

export function isCanonicalDepartment(id: string): id is CanonicalDepartmentId {
  return CANONICAL_DEPARTMENT_REGISTRY.some((d) => d.departmentId === id);
}

export function assertNotCompanyOwnedInfrastructure(departmentId: string): { ok: true } | { ok: false; code: string; message: string } {
  if (isCanonicalDepartment(departmentId)) {
    return {
      ok: false,
      code: 'CANONICAL_DEPARTMENT_NOT_TENANT_SCOPED',
      message: `${departmentId} is Studio World canonical infrastructure — companies cannot generate their own version.`,
    };
  }
  return { ok: true };
}
