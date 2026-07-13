import type { FounderCreatedModRecord } from './contract';

export type BrandNeutralMarketplacePackage = {
  packageId: string;
  modId: string;
  neutralDisplayName: string;
  strippedBranding: string[];
  retainedArchitecture: string[];
  buyerInjectionSlots: string[];
  privateDataRemoved: boolean;
};

const STRIP_LIST = [
  'Frontal Slayer name',
  'Frontal Slayer logo',
  'proprietary customer data',
  'private product catalog',
  'private workflows',
  'private material assets',
  'private images',
  'tenant IDs',
  'organization-specific database references',
];

const RETAIN_LIST = [
  'department concept',
  'architecture',
  'room blueprint',
  'socket system',
  'permitted workflows',
  'neutral assets',
  'customizable signage zones',
  'material slots',
  'lighting structure',
  'reusable interaction logic',
  'construction dependencies',
  'installation rules',
];

const BUYER_INJECTION = [
  'buyer brand name',
  'buyer logo',
  'buyer materials',
  'buyer product catalog',
  'buyer permissions',
  'buyer content',
  'buyer-specific integrations',
];

export function buildBrandNeutralMarketplacePackage(mod: FounderCreatedModRecord): BrandNeutralMarketplacePackage {
  return {
    packageId: `neutral-pkg-${mod.customSceneId}-v1`,
    modId: mod.customSceneId,
    neutralDisplayName: 'Custom Wig Configuration Atelier',
    strippedBranding: STRIP_LIST,
    retainedArchitecture: RETAIN_LIST,
    buyerInjectionSlots: BUYER_INJECTION,
    privateDataRemoved: true,
  };
}

export function validateNeutralPackage(pkg: BrandNeutralMarketplacePackage): { ok: true } | { ok: false; code: string; message: string } {
  if (!pkg.privateDataRemoved) {
    return { ok: false, code: 'PRIVATE_DATA_LEAK', message: 'Marketplace package must strip private founder data.' };
  }
  if (!pkg.strippedBranding.some((s) => s.toLowerCase().includes('frontal slayer'))) {
    return { ok: false, code: 'BRAND_NOT_STRIPPED', message: 'Frontal Slayer branding must be stripped.' };
  }
  if (pkg.buyerInjectionSlots.length < 5) {
    return { ok: false, code: 'BUYER_INJECTION_MISSING', message: 'Buyer brand injection slots required.' };
  }
  return { ok: true };
}
