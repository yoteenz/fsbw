/**
 * OpenArt character support audit — programmatic persistent character NOT available via MCP.
 */

import type { OpenArtCharacterStatus, ProviderIdentityMapping } from './types';

export const OPENART_CHARACTER_AUDIT = {
  status: 'external' as OpenArtCharacterStatus,
  programmaticPersistentCharacter: false,
  mcpCapabilities: [
    'text2image',
    'image2image (reference uploads via visualReferences)',
    'element2video',
    'upload_list / upload_sign / upload_pick',
  ],
  notAvailableViaMcp: [
    'persistent character create',
    'persistent character bind',
    'character ID association API',
  ],
  studioWorldOwnership:
    'Studio World remains canonical owner of Nia identity. OpenArt mappings are provider-specific overlays only.',
  operatorPackage: 'OPENART CHARACTER SETUP / EXTERNAL',
  instructions: [
    'Create or bind Nia in OpenArt Director UI manually if using OpenArt persistent characters.',
    'Record OpenArt character ID in Studio World provider_mappings on the reference pack when known.',
    'Use image2image with PRIMARY IDENTITY ANCHOR upload for programmatic identity-preserving variants.',
    'Do not treat Nia as "the OpenArt character" — she is STUDIO WORLD CHARACTER / NIA.',
  ],
};

export function defaultNiaProviderMappings(): ProviderIdentityMapping[] {
  return [
    {
      providerId: 'openart',
      mappingType: 'openart_character',
      notes: OPENART_CHARACTER_AUDIT.operatorPackage,
    },
    {
      providerId: 'fal',
      mappingType: 'fal_lora',
      notes: 'No FAL LoRA bound yet — SETUP REQUIRED',
    },
  ];
}

export function resolveOpenArtCharacterStatus(): OpenArtCharacterStatus {
  return OPENART_CHARACTER_AUDIT.status;
}
