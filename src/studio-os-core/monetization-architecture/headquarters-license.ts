import {
  HEADQUARTERS_LICENSE_INCLUDES,
  HEADQUARTERS_LICENSE_MONTHLY,
} from './constants';
import type { HeadquartersLicense } from './types';

export function buildDefaultHeadquartersLicense(): HeadquartersLicense {
  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);
  return {
    status: 'active',
    monthlyAmount: HEADQUARTERS_LICENSE_MONTHLY,
    renewsAt: renewsAt.toISOString(),
    includes: [...HEADQUARTERS_LICENSE_INCLUDES],
  };
}

export function formatHeadquartersLicenseLabel(license: HeadquartersLicense): string {
  if (license.status === 'trial') return 'HEADQUARTERS LICENSE · TRIAL';
  if (license.status === 'paused') return 'HEADQUARTERS LICENSE · PAUSED';
  return 'HEADQUARTERS LICENSE · ACTIVE';
}
