import type { EducationCollectibleDefinition } from '../types';

/** Placeholder asset slots — final 3D crystal/acrylic artwork ships separately. */
export const EDUCATION_COLLECTIBLE_DEFINITIONS: EducationCollectibleDefinition[] = [
  {
    id: 'collectible-season-cert-lace-s2',
    type: 'season-certification',
    masteryId: 'mastery-lace',
    seasonId: 'season-lace-02-customize-your-lace',
    title: 'Customize Your Lace',
    description: 'Frontal Slayer Season Certification — Lace Mastery Season 2',
    lockedAssetUrl: '',
    earnedAssetUrl: '',
    thumbnailUrl: '',
    transparentAssetUrl: '',
    displayStyle: 'crystal-plaque',
    rarity: 'season-certification',
    metadata: {
      visualLanguage: ['crystal-acrylic', 'white-marble', 'chrome', 'crimson-rose', 'red-foil'],
      certificateLabel: 'CERTIFICATE OF MASTERY',
    },
  },
];

export function getCollectibleDefinitionById(id: string): EducationCollectibleDefinition | undefined {
  return EDUCATION_COLLECTIBLE_DEFINITIONS.find((d) => d.id === id);
}

export function getCollectibleForSeason(seasonId: string): EducationCollectibleDefinition | undefined {
  return EDUCATION_COLLECTIBLE_DEFINITIONS.find((d) => d.seasonId === seasonId);
}
