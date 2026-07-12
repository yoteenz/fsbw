/**
 * ARTICLE-K19 — Scene Graph Before Scene Stack™
 * World Compiler™ — Studio World compiles places, not blended images.
 */

export const ARTICLE_K19 = {
  id: 'ARTICLE-K19',
  title: 'Scene Graph Before Scene Stack™',
  law: 'Scene Assembly™ shall not compose scenes by stacking rendered images. The Scene Graph™ is the source of truth. Rendered images are temporary references only.',
} as const;

export const WORLD_COMPILER_VERSION = 'world-compiler.v1';
export const WORLD_COMPILER_V2_BRIDGE_VERSION = 'world-compiler.v2';

export const WORLD_COMPILER_PHILOSOPHY =
  'Studio World is a world compiler. It assembles environments from validated components. It does not blend images. It constructs places.';

export const REFERENCE_PHILOSOPHY =
  'Approved upstream generations serve as placement references only. They never become part of downstream rendering pixels.';

export const IMMUTABLE_SHELL_LAW =
  'Once the Environment Shell™ is approved, lock it. Furniture never redraws architecture. Lighting never redraws furniture. Atmosphere never redraws lighting.';

/** World Compiler™ pipeline stages — rebuild every render, never alpha-stack full scenes */
export const WORLD_COMPILER_STAGES = [
  'load-shell',
  'lock-shell',
  'mount-landmark',
  'mount-furniture',
  'apply-materials',
  'calculate-lighting',
  'apply-atmosphere',
  'apply-motion',
  'bake-reflections',
  'render-final-scene',
] as const;

export type WorldCompilerStage = (typeof WORLD_COMPILER_STAGES)[number];

export function worldCompilerStageLabel(stage: WorldCompilerStage): string {
  const labels: Record<WorldCompilerStage, string> = {
    'load-shell': 'Load Shell™',
    'lock-shell': 'Lock Shell™',
    'mount-landmark': 'Mount Landmark™',
    'mount-furniture': 'Mount Furniture™',
    'apply-materials': 'Apply Materials™',
    'calculate-lighting': 'Calculate Lighting™',
    'apply-atmosphere': 'Apply Atmosphere™',
    'apply-motion': 'Apply Motion™',
    'bake-reflections': 'Bake Reflections™',
    'render-final-scene': 'Render Final Scene™',
  };
  return labels[stage];
}
