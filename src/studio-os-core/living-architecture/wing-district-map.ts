/**
 * Map contextual wing ids to district themes for Living Architecture™ badges.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';

const WING_DISTRICT: Record<string, DistrictThemeId> = {
  'asset-gallery': 'warehouse',
  'blueprint-hall': 'knowledge-library',
  'prototype-vault': 'warehouse',
  'material-library': 'warehouse',
  'innovation-gallery': 'innovation-district',
  'museum-wing': 'museum',
  'hall-of-innovation': 'innovation-district',
  'company-genome-vault': 'knowledge-library',
  'blueprint-archive': 'knowledge-library',
  'marketplace-imports': 'marketplace',
  'future-expansion-wings': 'innovation-district',
  'central-atrium': 'command-center',
};

export function districtForContextualWing(wingId: string): DistrictThemeId | null {
  return WING_DISTRICT[wingId] ?? null;
}
