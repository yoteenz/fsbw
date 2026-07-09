import type { XbdBrandDnaRecord } from '../types';

/** Packaging Strategy Engine™ — packaging direction from strategic Brand DNA */
export function buildPackagingDirection(brand: XbdBrandDnaRecord): string {
  return [
    brand.packagingStyle,
    `Materials: ${brand.materials.slice(0, 4).join(', ')}`,
    `Photography: ${brand.photographyStyle}`,
    `Luxury floor: ${brand.luxuryLevel}/100`,
    `Primary accent ${brand.colorSystem.primary} used sparingly`,
  ].join(' · ');
}

export function buildPackagingRules(brand: XbdBrandDnaRecord): string[] {
  return [
    ...brand.brandRules.filter((r) => r.toLowerCase().includes('packaging') || r.toLowerCase().includes('product')),
    `Never use anti-patterns: ${brand.antiPatterns.slice(0, 2).join(', ')}`,
    `Packaging voice: ${brand.writingVoice.tone}`,
  ];
}
