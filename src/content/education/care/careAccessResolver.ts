import type { CareEligibilityRule, CareGuide, CarePurchaseProfile } from '../types';
import type { CareProductType, CareTextureFamily } from './productCatalog';

/** Maps Care lessons to qualifying purchase attributes — no component hard-coding. */
export const CARE_ELIGIBILITY_RULES: CareEligibilityRule[] = [
  {
    id: 'rule-universal-store',
    careContentId: 'care-universal-store-unit',
    universal: true,
    requiresPurchase: true,
  },
  {
    id: 'rule-universal-detangle',
    careContentId: 'care-universal-brush-detangle',
    universal: true,
    requiresPurchase: true,
  },
  {
    id: 'rule-unit-wash',
    careContentId: 'care-unit-wash',
    productTypes: ['unit'],
    requiresPurchase: true,
  },
  {
    id: 'rule-unit-dry',
    careContentId: 'care-unit-dry',
    productTypes: ['unit'],
    requiresPurchase: true,
  },
  {
    id: 'rule-texture-straight',
    careContentId: 'care-texture-straight-maintain',
    textureFamilies: ['straight'],
    requiresPurchase: true,
  },
  {
    id: 'rule-texture-wavy',
    careContentId: 'care-texture-wavy-refresh',
    textureFamilies: ['wavy'],
    requiresPurchase: true,
  },
  {
    id: 'rule-texture-curly',
    careContentId: 'care-texture-curly-refresh',
    textureFamilies: ['curly'],
    requiresPurchase: true,
  },
  {
    id: 'rule-bundles',
    careContentId: 'care-bundles-care',
    productTypes: ['bundles'],
    requiresPurchase: true,
  },
  {
    id: 'rule-closures',
    careContentId: 'care-closures-care',
    productTypes: ['closures'],
    requiresPurchase: true,
  },
  {
    id: 'rule-lace-between-wears',
    careContentId: 'care-lace-between-wears',
    productTypes: ['unit', 'frontals', 'closures'],
    requiresPurchase: true,
  },
  {
    id: 'rule-frontals',
    careContentId: 'care-frontals-care',
    productTypes: ['frontals'],
    requiresPurchase: true,
  },
];

const rulesByLesson = new Map<string, CareEligibilityRule[]>();
for (const rule of CARE_ELIGIBILITY_RULES) {
  const list = rulesByLesson.get(rule.careContentId) ?? [];
  list.push(rule);
  rulesByLesson.set(rule.careContentId, list);
}

export function getCareEligibilityRulesForLesson(lessonId: string): CareEligibilityRule[] {
  return rulesByLesson.get(lessonId) ?? [];
}

function profileMatchesRule(profile: CarePurchaseProfile, rule: CareEligibilityRule): boolean {
  if (rule.universal) return true;
  if (rule.productTypes?.length) {
    if (!profile.productType || !rule.productTypes.includes(profile.productType as CareProductType)) {
      return false;
    }
  }
  if (rule.baseUnitIds?.length) {
    if (!profile.baseUnitId || !rule.baseUnitIds.includes(profile.baseUnitId)) return false;
  }
  if (rule.textureFamilies?.length) {
    if (!profile.textureFamily || !rule.textureFamilies.includes(profile.textureFamily as CareTextureFamily)) {
      return false;
    }
  }
  if (rule.productIds?.length) {
    const pid = profile.baseUnitId ?? profile.productName.toLowerCase();
    if (!rule.productIds.includes(pid)) return false;
  }
  return true;
}

export function isCareGuideUnlockedForProfiles(
  guide: CareGuide,
  profiles: CarePurchaseProfile[]
): boolean {
  if (guide.accessType !== 'qualifying-product') return false;
  if (!profiles.length) return false;

  const rules = getCareEligibilityRulesForLesson(guide.id);
  if (!rules.length) return false;

  return rules.some((rule) => {
    if (!rule.requiresPurchase) return true;
    return profiles.some((p) => p.status === 'active' && profileMatchesRule(p, rule));
  });
}

/** @deprecated Use isCareGuideUnlockedForProfiles */
export const isCareLessonUnlockedForProfiles = isCareGuideUnlockedForProfiles;

export function resolveUnlockedCareGuideIds(
  guides: CareGuide[],
  profiles: CarePurchaseProfile[],
  productEntitlements?: import('./ownedUnitModel').ResolvedCareContentEntitlement[]
): string[] {
  if (productEntitlements?.length) {
    const fromProduct = productEntitlements
      .filter((e) => e.contentKind === 'care-guide')
      .map((e) => e.contentId);
    const fromRules = guides
      .filter((g) => g.published !== false && isCareGuideUnlockedForProfiles(g, profiles))
      .map((g) => g.id);
    return [...new Set([...fromProduct, ...fromRules])];
  }
  return guides
    .filter((g) => g.published !== false && isCareGuideUnlockedForProfiles(g, profiles))
    .map((g) => g.id);
}

/** @deprecated Use resolveUnlockedCareGuideIds */
export const resolveUnlockedCareLessonIds = resolveUnlockedCareGuideIds;

export type CareAccessResolution = {
  guideId: string;
  /** @deprecated use guideId */
  lessonId: string;
  unlocked: boolean;
  lockedReason?: 'no-qualifying-purchase' | 'not-applicable' | 'revoked';
};

export function resolveCareAccessForGuides(
  guides: CareGuide[],
  profiles: CarePurchaseProfile[],
  productEntitlements?: import('./ownedUnitModel').ResolvedCareContentEntitlement[]
): CareAccessResolution[] {
  const active = profiles.filter((p) => p.status === 'active');
  const productUnlocked = new Set(
    (productEntitlements ?? [])
      .filter((e) => e.contentKind === 'care-guide')
      .map((e) => e.contentId)
  );
  return guides.map((guide) => {
    if (guide.published === false) {
      return { guideId: guide.id, lessonId: guide.id, unlocked: false, lockedReason: 'not-applicable' };
    }
    if (productUnlocked.has(guide.id)) {
      return { guideId: guide.id, lessonId: guide.id, unlocked: true };
    }
    if (!active.length) {
      return {
        guideId: guide.id,
        lessonId: guide.id,
        unlocked: false,
        lockedReason: 'no-qualifying-purchase',
      };
    }
    const unlocked = isCareGuideUnlockedForProfiles(guide, active);
    return {
      guideId: guide.id,
      lessonId: guide.id,
      unlocked,
      lockedReason: unlocked ? undefined : 'not-applicable',
    };
  });
}

/** @deprecated Use resolveCareAccessForGuides */
export function resolveCareAccessForLessons(
  lessons: CareGuide[],
  profiles: CarePurchaseProfile[],
  productEntitlements?: import('./ownedUnitModel').ResolvedCareContentEntitlement[]
): CareAccessResolution[] {
  return resolveCareAccessForGuides(lessons, profiles, productEntitlements);
}
