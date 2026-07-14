import type { StudioWorldIconDefinition } from './StudioWorldIconDefinition';
import { STUDIO_WORLD_ICON_CATEGORIES } from './StudioWorldIconCategories';
import { STUDIO_WORLD_ICON_STATES } from './StudioWorldIconState';
import { STUDIO_WORLD_ICON_THEMES } from './StudioWorldIconTheme';
import { listAllIcons } from './StudioWorldIconRegistry';

export const STUDIO_WORLD_ICON_MANIFEST_VERSION = 'studio-world-icon-manifest.v1' as const;

function simpleChecksum(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, '0');
}

export type StudioWorldIconManifestEntry = {
  id: string;
  category: string;
  displayName: string;
  version: string;
  certification: string;
  status: string;
  provider: string;
  defaultAsset: string | null;
  pngPath: string | null;
  svgPath: string | null;
  states: string[];
  themes: string[];
  checksum: string;
  usageCount: number;
};

export type StudioWorldIconManifest = {
  schemaVersion: typeof STUDIO_WORLD_ICON_MANIFEST_VERSION;
  generatedAt: string;
  iconCount: number;
  categories: typeof STUDIO_WORLD_ICON_CATEGORIES;
  states: typeof STUDIO_WORLD_ICON_STATES;
  themes: typeof STUDIO_WORLD_ICON_THEMES;
  icons: StudioWorldIconManifestEntry[];
  checksum: string;
};

function entryChecksum(icon: StudioWorldIconDefinition): string {
  const payload = JSON.stringify({
    id: icon.id,
    defaultAsset: icon.defaultAsset,
    pngPath: icon.pngPath,
    version: icon.version,
    certification: icon.certification,
  });
  return simpleChecksum(payload);
}

export function buildStudioWorldIconManifest(): StudioWorldIconManifest {
  const icons = listAllIcons();
  const entries: StudioWorldIconManifestEntry[] = icons.map((icon) => ({
    id: icon.id,
    category: icon.category,
    displayName: icon.displayName,
    version: icon.version,
    certification: icon.certification,
    status: icon.status,
    provider: icon.provider,
    defaultAsset: icon.defaultAsset,
    pngPath: icon.pngPath,
    svgPath: icon.svgPath,
    states: Object.keys(icon.stateAssets),
    themes: Object.entries(icon.themeCompatibility)
      .filter(([, v]) => v)
      .map(([k]) => k),
    checksum: entryChecksum(icon),
    usageCount: icon.metadata.usageCount,
  }));

  const manifestBody = JSON.stringify({ entries });
  const checksum = simpleChecksum(manifestBody);

  return {
    schemaVersion: STUDIO_WORLD_ICON_MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    iconCount: entries.length,
    categories: STUDIO_WORLD_ICON_CATEGORIES.map((c) => ({
      ...c,
      iconCount: icons.filter((i) => i.category === c.id).length,
    })),
    states: STUDIO_WORLD_ICON_STATES,
    themes: STUDIO_WORLD_ICON_THEMES,
    icons: entries,
    checksum,
  };
}
