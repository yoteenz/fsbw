import type { IndustryPack } from './contract';
import type { IndustryPackDepartmentSlot } from './contract';

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

function extensionPack(
  packId: string,
  name: string,
  description: string,
  archetypeId: IndustryPack['archetypeId'],
  defaultDepartments: IndustryPackDepartmentSlot[]
): IndustryPack {
  return {
    packId,
    name,
    description,
    archetypeId,
    packVersion: '1.0.0',
    official: true,
    defaultDepartments,
    defaultAssets: [],
    lightingProfileId: 'founder-lighting-pack',
    materialLibraryId: 'founder-material-library',
    cameraPackId: 'founder-composition-pack',
    blueprintTemplateId: `hq-blueprint.${packId}`,
    constructionTemplateId: `hq-construction.${packId}`,
    renderPromptId: `hq-render-prompt.${packId}`,
    founderPermissions: {
      canCustomizeDepartments: true,
      canCustomizeAssets: true,
      canCustomizeMaterials: true,
      canCustomizeLighting: true,
      canPublishMods: true,
      canPublishToMarketplace: false,
    },
    marketplaceEligibility: { eligible: true, tier: 'official', requiresCityCouncilApproval: false },
    revisionHistory: ['1.0.0'],
    registryVersion: 'industry-packs.v1',
  };
}

/** Canonical Industry Pack extensions for Experience Lab entry options. */
export const CANONICAL_INDUSTRY_PACK_EXTENSIONS: IndustryPack[] = [
  extensionPack(
    'official-hair-brand',
    'Official Hair Brand Pack',
    'Full beauty brand headquarters — Showroom, Atelier, Content Studio',
    'beauty',
    [
      slot('reception', 'reception', 'v6', 'Reception', 'ground'),
      slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
      slot('showroom', 'retail-boutique', 'v2', 'Showroom', 'ground', ['lobby']),
      slot('consultation', 'treatment-room', 'v3', 'Consultation', 'first', ['showroom']),
      slot('private-office', 'executive-office', 'v3', 'Private Office', 'penthouse', ['lobby']),
      slot('inventory', 'inventory', 'v3', 'Inventory', 'basement', ['showroom']),
      slot('shipping', 'storage', 'v2', 'Shipping', 'basement', ['inventory']),
      slot('photography', 'photo-studio', 'v2', 'Photography', 'first', ['showroom']),
      slot('content-studio', 'studio-floor', 'v2', 'Content Studio', 'first', ['photography']),
      slot('customer-lounge', 'waiting-area', 'v3', 'Customer Lounge', 'ground', ['reception']),
      slot('atelier', 'studio-floor', 'v2', 'Build-A-Wig Atelier', 'first', ['showroom']),
    ]
  ),
  extensionPack('official-architecture-firm', 'Official Architecture Firm Pack', 'Design practice HQ', 'professional-services', [
    slot('reception', 'reception', 'v6', 'Reception', 'ground'),
    slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
    slot('studio', 'studio-floor', 'v2', 'Design Studio', 'first', ['lobby']),
    slot('conference', 'conference-room', 'v5', 'Conference Room', 'first', ['studio']),
    slot('office', 'office', 'v9', 'Office', 'first', ['studio']),
  ]),
  extensionPack('official-education-campus', 'Official Education Campus Pack', 'Academy HQ', 'education', [
    slot('reception', 'reception', 'v6', 'Reception', 'ground'),
    slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
    slot('training', 'training-room', 'v4', 'Training Room', 'first', ['lobby']),
    slot('office', 'office', 'v9', 'Office', 'first', ['training']),
  ]),
  extensionPack('official-technology-campus', 'Official Technology Campus Pack', 'Tech HQ', 'technology', [
    slot('reception', 'reception', 'v6', 'Reception', 'ground'),
    slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
    slot('office', 'office', 'v9', 'Office', 'first', ['lobby']),
    slot('conference', 'conference-room', 'v5', 'Conference Room', 'first', ['office']),
    slot('server', 'mechanical-room', 'v1', 'Server Room', 'basement', ['office']),
  ]),
  extensionPack('official-nonprofit-hq', 'Official Nonprofit HQ Pack', 'Mission-driven HQ', 'non-profit', [
    slot('reception', 'reception', 'v6', 'Reception', 'ground'),
    slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
    slot('office', 'office', 'v9', 'Office', 'first', ['lobby']),
    slot('training', 'training-room', 'v4', 'Training Room', 'first', ['office']),
  ]),
  extensionPack('official-hospitality-hq', 'Official Hospitality HQ Pack', 'Hotel and venue HQ', 'hospitality', [
    slot('reception', 'reception', 'v6', 'Reception', 'ground'),
    slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
    slot('dining', 'dining-area', 'v2', 'Dining', 'ground', ['lobby']),
    slot('kitchen', 'kitchen', 'v2', 'Kitchen', 'basement', ['dining']),
    slot('office', 'office', 'v9', 'Office', 'first', ['reception']),
  ]),
  extensionPack('official-corporate-hq', 'Official Corporate HQ Pack', 'Corporate headquarters', 'professional-services', [
    slot('reception', 'reception', 'v6', 'Reception', 'ground'),
    slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
    slot('office', 'office', 'v9', 'Office', 'first', ['lobby']),
    slot('executive', 'executive-office', 'v3', 'Executive Office', 'penthouse', ['office']),
    slot('conference', 'conference-room', 'v5', 'Conference Room', 'first', ['office']),
  ]),
  extensionPack('official-government-hq', 'Official Government HQ Pack', 'Civic operations', 'government', [
    slot('reception', 'reception', 'v6', 'Reception', 'ground'),
    slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
    slot('office', 'office', 'v9', 'Office', 'first', ['lobby']),
    slot('conference', 'conference-room', 'v5', 'Conference Room', 'first', ['office']),
    slot('storage', 'storage', 'v2', 'Records Storage', 'basement', ['office']),
  ]),
  extensionPack('official-custom-blank', 'Custom Blank Pack', 'Empty canonical shell — founder defines HQ', 'custom', [
    slot('reception', 'reception', 'v6', 'Reception', 'ground'),
    slot('lobby', 'lobby', 'v4', 'Lobby', 'ground', ['reception']),
  ]),
];
