import type {
  BusinessArchetypeId,
  IndustryPack,
  IndustryPackDepartmentSlot,
  IndustryPackRegistry,
  IndustryPackValidationResult,
} from './contract';
import { INDUSTRY_PACKS_VERSION } from './contract';

function slot(
  slotId: string,
  templateId: IndustryPackDepartmentSlot['templateId'],
  pinnedVersion: string,
  displayName: string,
  floor: string,
  dependencies: string[] = []
): IndustryPackDepartmentSlot {
  return {
    slotId,
    templateId,
    pinnedVersion,
    displayName,
    floor,
    dependencies,
    customizationLayerId: null,
  };
}

function pack(
  packId: string,
  name: string,
  description: string,
  archetypeId: BusinessArchetypeId,
  packVersion: string,
  official: boolean,
  defaultDepartments: IndustryPackDepartmentSlot[],
  overrides?: Partial<Pick<IndustryPack, 'lightingProfileId' | 'materialLibraryId' | 'renderPromptId'>>
): IndustryPack {
  return {
    packId,
    name,
    description,
    archetypeId,
    packVersion,
    official,
    defaultDepartments,
    defaultAssets: [],
    lightingProfileId: overrides?.lightingProfileId ?? 'founder-lighting-pack',
    materialLibraryId: overrides?.materialLibraryId ?? 'founder-material-library',
    cameraPackId: 'founder-camera-pack',
    blueprintTemplateId: `hq-blueprint.${packId}`,
    constructionTemplateId: `hq-construction.${packId}`,
    renderPromptId: overrides?.renderPromptId ?? `hq-render-prompt.${packId}`,
    founderPermissions: {
      canCustomizeDepartments: true,
      canCustomizeAssets: true,
      canCustomizeMaterials: true,
      canCustomizeLighting: true,
      canPublishMods: true,
      canPublishToMarketplace: official ? false : true,
    },
    marketplaceEligibility: {
      eligible: official,
      tier: official ? 'official' : null,
      requiresCityCouncilApproval: !official,
    },
    revisionHistory: [packVersion],
    registryVersion: INDUSTRY_PACKS_VERSION,
  };
}

/** Official Studio World Industry Packs™ — admin-founder canonical headquarters. */
export const OFFICIAL_INDUSTRY_PACKS: IndustryPack[] = [
  pack(
    'official-hair-salon',
    'Official Hair Salon Pack',
    'Canonical beauty headquarters — salon operations',
    'beauty',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
      slot('office', 'office', 'v9', 'Office', 'first', ['lobby']),
      slot('training', 'training-room', 'v4', 'Training Room', 'first', ['office']),
      slot('inventory', 'inventory', 'v3', 'Inventory', 'basement', ['office']),
      slot('checkout', 'checkout', 'v2', 'Checkout', 'ground', ['lobby']),
      slot('storage', 'storage', 'v2', 'Storage', 'basement', ['inventory']),
      slot('photo-studio', 'photo-studio', 'v2', 'Photo Studio', 'first', ['office']),
    ]
  ),
  pack(
    'official-law-firm',
    'Official Law Firm Pack',
    'Canonical professional services headquarters',
    'professional-services',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
      slot('conference', 'conference-room', 'v5', 'Conference Room', 'first', ['lobby']),
      slot('office', 'office', 'v9', 'Office', 'first', ['lobby']),
      slot('break-room', 'break-room', 'v2', 'Break Room', 'first', ['office']),
      slot('executive', 'executive-office', 'v3', 'Executive Office', 'penthouse', ['office']),
    ]
  ),
  pack(
    'official-doctor',
    'Official Doctor Pack',
    'Canonical healthcare headquarters',
    'healthcare',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('waiting', 'waiting-area', 'v3', 'Waiting Area', 'ground', ['reception']),
      slot('office', 'office', 'v9', 'Office', 'first', ['waiting']),
      slot('storage', 'storage', 'v2', 'Storage', 'basement', ['office']),
      slot('conference', 'conference-room', 'v5', 'Conference Room', 'first', ['office']),
      slot('exam', 'exam-room', 'v2', 'Exam Room', 'first', ['waiting']),
    ]
  ),
  pack(
    'official-realtor',
    'Official Realtor Pack',
    'Canonical real estate headquarters',
    'real-estate',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
      slot('office', 'office', 'v9', 'Office', 'first', ['lobby']),
      slot('conference', 'conference-room', 'v5', 'Conference Room', 'first', ['office']),
    ]
  ),
  pack(
    'official-restaurant',
    'Official Restaurant Pack',
    'Canonical food & beverage headquarters',
    'food-beverage',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('dining', 'dining-area', 'v2', 'Dining Area', 'ground', ['reception']),
      slot('kitchen', 'kitchen', 'v2', 'Kitchen', 'basement', ['dining']),
      slot('storage', 'storage', 'v2', 'Storage', 'basement', ['kitchen']),
      slot('office', 'office', 'v9', 'Office', 'first', ['reception']),
    ]
  ),
  pack(
    'official-fitness',
    'Official Fitness Pack',
    'Canonical fitness headquarters',
    'fitness',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
      slot('studio-floor', 'studio-floor', 'v2', 'Studio Floor', 'first', ['lobby']),
      slot('training', 'training-room', 'v4', 'Training Room', 'first', ['studio-floor']),
      slot('locker-storage', 'storage', 'v2', 'Storage', 'basement', ['studio-floor']),
    ]
  ),
  pack(
    'official-marketing-agency',
    'Official Marketing Agency Pack',
    'Canonical creative agency headquarters',
    'creative',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
      slot('studio', 'studio-floor', 'v2', 'Creative Studio', 'first', ['lobby']),
      slot('conference', 'conference-room', 'v5', 'Conference Room', 'first', ['studio']),
      slot('office', 'office', 'v9', 'Office', 'first', ['studio']),
    ]
  ),
  pack(
    'official-boutique',
    'Official Boutique Pack',
    'Canonical retail boutique headquarters',
    'retail',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('boutique', 'retail-boutique', 'v2', 'Boutique Floor', 'ground', ['reception']),
      slot('inventory', 'inventory', 'v3', 'Inventory', 'basement', ['boutique']),
      slot('office', 'office', 'v9', 'Office', 'first', ['boutique']),
    ]
  ),
  pack(
    'official-coffee-shop',
    'Official Coffee Shop Pack',
    'Canonical cafe headquarters',
    'food-beverage',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('dining', 'dining-area', 'v2', 'Seating Area', 'ground', ['reception']),
      slot('kitchen', 'kitchen', 'v2', 'Barista Station', 'ground', ['dining']),
      slot('storage', 'storage', 'v2', 'Storage', 'basement', ['kitchen']),
    ]
  ),
  pack(
    'official-tattoo-shop',
    'Official Tattoo Shop Pack',
    'Canonical tattoo studio headquarters',
    'beauty',
    '1.0.0',
    true,
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
      slot('treatment', 'treatment-room', 'v3', 'Tattoo Stations', 'first', ['lobby']),
      slot('office', 'office', 'v9', 'Office', 'first', ['lobby']),
      slot('inventory', 'inventory', 'v3', 'Supply Inventory', 'basement', ['treatment']),
    ]
  ),
];

export const INDUSTRY_PACK_REGISTRY: IndustryPackRegistry = {
  registryVersion: INDUSTRY_PACKS_VERSION,
  packs: [...OFFICIAL_INDUSTRY_PACKS],
};

export function getIndustryPack(packId: string): IndustryPack | undefined {
  return INDUSTRY_PACK_REGISTRY.packs.find((p) => p.packId === packId);
}

export function listIndustryPacksForArchetype(archetypeId: BusinessArchetypeId): IndustryPack[] {
  return INDUSTRY_PACK_REGISTRY.packs.filter((p) => p.archetypeId === archetypeId);
}

export function listOfficialIndustryPacks(): IndustryPack[] {
  return INDUSTRY_PACK_REGISTRY.packs.filter((p) => p.official);
}

export function validateIndustryPack(pack: IndustryPack): IndustryPackValidationResult {
  if (!pack.packId || !pack.name) {
    return { ok: false, code: 'PACK_INCOMPLETE', message: 'Industry pack requires id and name.' };
  }
  if (pack.defaultDepartments.length === 0) {
    return { ok: false, code: 'PACK_NO_DEPARTMENTS', message: 'Industry pack must declare at least one department slot.' };
  }
  const slotIds = new Set(pack.defaultDepartments.map((s) => s.slotId));
  for (const slot of pack.defaultDepartments) {
    for (const dep of slot.dependencies) {
      if (!slotIds.has(dep)) {
        return {
          ok: false,
          code: 'PACK_INVALID_DEPENDENCY',
          message: `Department ${slot.slotId} depends on unknown slot ${dep}.`,
        };
      }
    }
  }
  return { ok: true };
}

export function registerIndustryPack(pack: IndustryPack): IndustryPackRegistry {
  const validation = validateIndustryPack(pack);
  if (!validation.ok) throw new Error(validation.message);
  const existing = INDUSTRY_PACK_REGISTRY.packs.findIndex((p) => p.packId === pack.packId);
  const packs = [...INDUSTRY_PACK_REGISTRY.packs];
  if (existing >= 0) packs[existing] = pack;
  else packs.push(pack);
  return { registryVersion: INDUSTRY_PACKS_VERSION, packs };
}
