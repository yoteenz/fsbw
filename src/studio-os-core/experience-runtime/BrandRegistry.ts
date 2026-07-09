import { DDNA_SUBSYSTEM_NAME, DDNA_SUBSYSTEM_VERSION } from '../genesis/studio-os-design-dna/constants';

export type BrandRegistration = {
  brandId: string;
  displayName: string;
  /** Genesis store key for Design DNA / Brand DNA profile */
  designDnaStoreKey: 'studioOsDesignDna';
  designDnaVersion: string;
  designDnaOfficialName: string;
};

const BRAND_REGISTRY: BrandRegistration[] = [
  {
    brandId: 'studio-os',
    displayName: 'Studio OS',
    designDnaStoreKey: 'studioOsDesignDna',
    designDnaVersion: DDNA_SUBSYSTEM_VERSION,
    designDnaOfficialName: DDNA_SUBSYSTEM_NAME,
  },
];

export function listBrandRegistrations(): BrandRegistration[] {
  return [...BRAND_REGISTRY];
}

export function getBrandRegistration(brandId: string): BrandRegistration | undefined {
  return BRAND_REGISTRY.find((b) => b.brandId === brandId);
}

export function registerBrandRegistration(brand: BrandRegistration): void {
  const idx = BRAND_REGISTRY.findIndex((b) => b.brandId === brand.brandId);
  if (idx >= 0) BRAND_REGISTRY[idx] = brand;
  else BRAND_REGISTRY.push(brand);
}
