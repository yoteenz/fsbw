import type { MarketplaceCertificationTier } from './contract';
import type { MunicipalValidationResult } from './contract';

export const DEPARTMENT_MOD_REGISTRY_VERSION = 'department-mod-registry.v1' as const;

export type DepartmentModPublicationStatus =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'certified'
  | 'rejected'
  | 'deprecated';

export type DepartmentModRecord = {
  modId: string;
  modVersion: string;
  baseDepartmentId: string;
  baseDepartmentVersion: string;
  creatorOrganizationId: string;
  creatorDisplayName: string;
  dependencies: string[];
  modifiedComponents: string[];
  compatibility: string[];
  license: string;
  marketplaceMetadata: {
    title: string;
    description: string;
    category: string;
  };
  approvalStatus: DepartmentModPublicationStatus;
  certificationTier: MarketplaceCertificationTier | null;
  supportStatus: 'supported' | 'community' | 'deprecated';
  upgradePath: string | null;
  registryVersion: typeof DEPARTMENT_MOD_REGISTRY_VERSION;
};

const FORBIDDEN_MOD_CONTENT_PATTERNS = [
  'private-asset',
  'customer-data',
  'hardcoded-tenant',
  'secret',
  'organization-only-resource',
  'restricted-media',
] as const;

export type ModPublicationRejectionCode =
  | 'PRIVATE_ASSETS'
  | 'CUSTOMER_DATA'
  | 'HARDCODED_TENANT'
  | 'SECRETS'
  | 'ORG_ONLY_RESOURCE'
  | 'RESTRICTED_MEDIA'
  | 'MISSING_BASE_DEPARTMENT'
  | 'INCOMPATIBLE_VERSION';

export function validateDepartmentModPublication(mod: DepartmentModRecord): MunicipalValidationResult {
  if (!mod.baseDepartmentId || !mod.baseDepartmentVersion) {
    return { ok: false, code: 'MISSING_BASE_DEPARTMENT', message: 'Mod must reference a base department and version.' };
  }

  const haystack = [
    ...mod.modifiedComponents,
    ...mod.dependencies,
    mod.marketplaceMetadata.description,
    mod.license,
  ]
    .join(' ')
    .toLowerCase();

  for (const pattern of FORBIDDEN_MOD_CONTENT_PATTERNS) {
    if (haystack.includes(pattern.replace(/-/g, ' ')) || haystack.includes(pattern)) {
      const code = pattern.toUpperCase().replace(/-/g, '_') as ModPublicationRejectionCode;
      return {
        ok: false,
        code,
        message: `Department mod publication rejected — forbidden content pattern: ${pattern}.`,
      };
    }
  }

  if (mod.modifiedComponents.some((c) => /secret|api[_-]?key|password/i.test(c))) {
    return { ok: false, code: 'SECRETS', message: 'Department mod cannot include secrets or credentials.' };
  }

  return { ok: true };
}
