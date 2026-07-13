import type { ModLicenseRecord, ModLicenseType } from './contract';

export const MOD_LICENSE_DEFINITIONS: Record<
  ModLicenseType,
  Pick<ModLicenseRecord, 'allowedModifications' | 'resaleRights' | 'derivativeRights' | 'attributionRequired' | 'updateAccess' | 'transferability'>
> = {
  PERSONAL_HEADQUARTERS_LICENSE: {
    allowedModifications: true,
    resaleRights: false,
    derivativeRights: false,
    attributionRequired: true,
    updateAccess: true,
    transferability: false,
  },
  COMMERCIAL_HEADQUARTERS_LICENSE: {
    allowedModifications: true,
    resaleRights: false,
    derivativeRights: false,
    attributionRequired: true,
    updateAccess: true,
    transferability: false,
  },
  MULTI_PROPERTY_LICENSE: {
    allowedModifications: true,
    resaleRights: false,
    derivativeRights: false,
    attributionRequired: true,
    updateAccess: true,
    transferability: false,
  },
  CREATOR_DERIVATIVE_LICENSE: {
    allowedModifications: true,
    resaleRights: false,
    derivativeRights: true,
    attributionRequired: true,
    updateAccess: true,
    transferability: false,
  },
  ENTERPRISE_LICENSE: {
    allowedModifications: true,
    resaleRights: false,
    derivativeRights: false,
    attributionRequired: true,
    updateAccess: true,
    transferability: true,
  },
};

export function issueModLicense(input: {
  licenseId: string;
  licenseType: ModLicenseType;
  modId: string;
  buyerOrganizationId: string;
  allowedInstallations?: number;
  expiresAt?: string | null;
}): ModLicenseRecord {
  const def = MOD_LICENSE_DEFINITIONS[input.licenseType];
  return {
    licenseId: input.licenseId,
    licenseType: input.licenseType,
    modId: input.modId,
    buyerOrganizationId: input.buyerOrganizationId,
    allowedInstallations: input.allowedInstallations ?? 1,
    expiresAt: input.expiresAt ?? null,
    ...def,
  };
}

export function enforceLicenseLimits(
  license: ModLicenseRecord,
  currentInstallations: number
): { ok: true } | { ok: false; code: string; message: string } {
  if (currentInstallations >= license.allowedInstallations) {
    return { ok: false, code: 'LICENSE_INSTALL_LIMIT', message: 'License installation limit exceeded.' };
  }
  if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
    return { ok: false, code: 'LICENSE_EXPIRED', message: 'Mod license has expired.' };
  }
  return { ok: true };
}
