/** Measured geometry for Experience Lab labeled icon sprite — auto-updated by build script. */
export const EXPERIENCE_LAB_ICON_SPRITE_CONFIG = {
  sourcePath: 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png',
  runtimeAtlasPath: 'src/assets/studio-world/experience-lab/experience-lab-icon-runtime-atlas.png',
  sourceWidth: 1024,
  sourceHeight: 1024,
  rows: 8,
  columns: 8,
  cellWidth: 128,
  cellHeight: 128,
  runtimeGlyphCell: 96,
  runtimeAtlasWidth: 768,
  runtimeAtlasHeight: 768,
  blackThreshold: 40,
  whiteThreshold: 180,
  sourceSha256: 'dd8fd6cb3544266f46c8870e9e389da9c2f16c28975805e1bc6e8edc1c72240a',
  iconCount: 64,
  mode: 'transparent-atlas' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
