/**
 * Founder qualification fixture — circular crystal concierge reception desk.
 */

import type { MaterialRequest } from './resolver';

export const CIRCULAR_CONCIERGE_DESK_SPEC = {
  assetId: 'circular-crystal-concierge-desk',
  description:
    'Circular crystal concierge reception desk — luxury Studio World dimensionality, standalone mountable object, complete object visible, simple seamless background, no room, no surrounding architecture.',
  materialRequests: [
    { slot: 'deskBase', requestedMaterial: 'white polished marble', required: true },
    { slot: 'frontCrystalPanels', requestedMaterial: 'clear crystal acrylic', required: true },
    { slot: 'edgeTrim', requestedMaterial: 'mirror-polished chrome', required: true },
    { slot: 'accentLighting', requestedMaterial: 'subtle crimson illumination', required: true },
    { slot: 'innerArchitecture', requestedMaterial: 'clear crystal acrylic', required: false },
  ] satisfies MaterialRequest[],
  expectedRouteId: 'nano-banana-2-isolated-edit',
  expectedModel: 'fal-ai/nano-banana-2/edit',
  forbiddenReferences: ['environment-shell', 'shell-screenshot', 'full-room'],
};

export const CIRCULAR_CONCIERGE_MATERIAL_MAPPINGS: Record<string, string> = {
  deskBase: 'primary-marble-texture',
  frontCrystalPanels: 'clear-crystal-acrylic',
  edgeTrim: 'mirror-polished-chrome',
  accentLighting: 'Frontal Slayer Red #EB1C24',
  innerArchitecture: 'clear-crystal-acrylic',
};
