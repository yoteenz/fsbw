/**
 * Generation Recipes™ — reusable manufacturing definitions for Studio Foundry™.
 */

import type { GenerationRecipeId } from '../../studio-os-core/asset-compiler';

export type FoundryGenerationRecipe = {
  id: GenerationRecipeId;
  label: string;
  assetClass: string;
  aspectRatio: string;
  outputFormats: Array<'png' | 'webp'>;
  qualityTarget: string;
  materialLanguage: string[];
  lightingLanguage: string[];
  negativeRules: string[];
  registryDestination: string;
  falModel: string;
  defaultPromptPrefix: string;
};

/** Hero Icon™ — first Studio Foundry product line (ARTICLE-D08 + A02). */
export const HERO_ICON_RECIPE: FoundryGenerationRecipe = {
  id: 'hero-icon',
  label: 'Hero Icon™',
  assetClass: 'hero-icon',
  aspectRatio: '1:1',
  outputFormats: ['png', 'webp'],
  qualityTarget: '4K-ready',
  materialLanguage: ['optical acrylic', 'chrome', 'crystal', 'internal glow'],
  lightingLanguage: ['bright luxury studio lighting', 'museum spotlight', 'soft rim glow'],
  negativeRules: [
    'no emojis',
    'no flat glyphs',
    'no SF Symbols',
    'no generic line icons',
    'no UI screenshots',
    'no text labels',
    'no watermarks',
  ],
  registryDestination: 'hero-icons',
  falModel: 'openai/gpt-image-2/edit',
  defaultPromptPrefix:
    'Studio World collectible hero icon, iconic single architectural object, optical acrylic and crystal, chrome accents, internal glow, luxury industrial design language.',
};

export const FOUNDRY_GENERATION_RECIPES: Record<GenerationRecipeId, FoundryGenerationRecipe | undefined> = {
  'hero-icon': HERO_ICON_RECIPE,
  environment: undefined,
  furniture: undefined,
  orb: undefined,
  'glass-ui': undefined,
  room: undefined,
  architecture: undefined,
  material: undefined,
  particle: undefined,
  animation: undefined,
  portrait: undefined,
  'brand-asset': undefined,
};

export function getFoundryRecipe(recipeId: GenerationRecipeId): FoundryGenerationRecipe | undefined {
  return FOUNDRY_GENERATION_RECIPES[recipeId];
}
