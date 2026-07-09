import type { XbdBrandDnaRecord } from '../types';

/** Content Direction Engine™ — content strategy from strategic Brand DNA */
export function buildContentDirection(brand: XbdBrandDnaRecord): string {
  return [
    brand.contentStyle,
    `Voice: ${brand.writingVoice.tone} · ${brand.writingVoice.cadence}`,
    `Sample line: "${brand.writingVoice.sampleLine}"`,
    `Emotional territory: ${brand.emotionalTerritory.join(', ')}`,
    `Forbidden: ${brand.writingVoice.forbiddenLanguage.slice(0, 3).join(', ')}`,
  ].join(' · ');
}

export function buildWebsiteDirection(brand: XbdBrandDnaRecord): string {
  return `Hero expresses ${brand.visualPersonality.slice(0, 2).join(' + ')} with ${brand.photographyStyle}. Typography: ${brand.typography.displayFont} headlines, ${brand.typography.bodyFont} body. One primary action per viewport. ${brand.positioning}.`;
}

export function buildHeadquartersDirection(brand: XbdBrandDnaRecord): string {
  return `HQ rooms inherit ${brand.emotionalTerritory.join(', ')} emotional territory. Materials: ${brand.materials.slice(0, 3).join(', ')}. Orb speaks with ${brand.writingVoice.tone}. Department color before body copy.`;
}
