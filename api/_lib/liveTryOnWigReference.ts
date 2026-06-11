import type { WigPreviewSelections } from './wigPreviewSelectionHash.js';
import {
  wigPreviewLiveAfterColorStylingPaths,
  wigPreviewLiveAnglePaths,
  wigPreviewLiveCrimpsPartFolder,
  wigPreviewLiveCrimpsWithBangsPartFolder,
  wigPreviewLiveFlatIronPartFolder,
  wigPreviewLiveFlatIronWithBangsPartFolder,
  wigPreviewLiveLayersPartFolder,
  wigPreviewLiveLayersWithBangsPartFolder,
  wigPreviewManifestHashLiveColorTier,
} from './wigPreviewSelectionHash.js';

export type LiveTryOnPartSelection = 'MIDDLE' | 'LEFT' | 'RIGHT';

export type LiveTryOnStylingResolution = {
  /** Color-tier hash (styling forced NONE). */
  colorTierHash: string;
  /** `null` when shopper has no salon styling / bangs-only path. */
  afterColorFolderKey: string | null;
  bangsOnly: boolean;
  partSelection: LiveTryOnPartSelection;
};

function readPart(raw: string): LiveTryOnPartSelection {
  const u = String(raw || 'MIDDLE').toUpperCase();
  if (u === 'LEFT' || u === 'RIGHT') return u;
  return 'MIDDLE';
}

/** Map BAW styling CSV + part → Storage `after-color/` folder (same as live-wig-after-color-styling). */
export function resolveLiveTryOnStyling(
  selections: WigPreviewSelections,
  partSelectionRaw: string
): LiveTryOnStylingResolution {
  const partSelection = readPart(partSelectionRaw);
  const colorTierHash = wigPreviewManifestHashLiveColorTier(selections);
  const stylingRaw = String(selections.styling || 'NONE').toUpperCase();
  const hasLayers = stylingRaw.includes('LAYERS');
  const hasCrimps = stylingRaw.includes('CRIMPS');
  const hasFlatIron = stylingRaw.includes('FLAT IRON');
  const hasBangs = stylingRaw.includes('BANGS');
  const salonCount = [hasLayers, hasCrimps, hasFlatIron].filter(Boolean).length;
  const bangsOnly = hasBangs && salonCount === 0;
  const middleLayers = hasLayers && salonCount === 1;
  const middleCrimps = hasCrimps && salonCount === 1;
  const middleFlatIron = hasFlatIron && salonCount === 1;
  const bangsWithSalon = hasBangs && salonCount === 1 && (middleLayers || middleCrimps || middleFlatIron);

  if (salonCount > 1 || (!middleLayers && !middleCrimps && !middleFlatIron && !bangsOnly)) {
    return { colorTierHash, afterColorFolderKey: null, bangsOnly: false, partSelection };
  }

  const afterColorFolderKey = middleLayers
    ? bangsWithSalon
      ? wigPreviewLiveLayersWithBangsPartFolder(partSelection)
      : wigPreviewLiveLayersPartFolder(partSelection)
    : middleCrimps
      ? bangsWithSalon
        ? wigPreviewLiveCrimpsWithBangsPartFolder(partSelection)
        : wigPreviewLiveCrimpsPartFolder(partSelection)
      : middleFlatIron
        ? bangsWithSalon
          ? wigPreviewLiveFlatIronWithBangsPartFolder(partSelection)
          : wigPreviewLiveFlatIronPartFolder(partSelection)
        : 'bangs-only';

  return { colorTierHash, afterColorFolderKey, bangsOnly, partSelection };
}

export function liveTryOnMannequinStoragePaths(
  promptVersion: string,
  unitKey: string,
  styling: LiveTryOnStylingResolution
): { front: string; left: string; right: string } {
  const u = String(unitKey || 'NOIR').toUpperCase();
  if (styling.afterColorFolderKey) {
    return wigPreviewLiveAfterColorStylingPaths(
      promptVersion,
      u,
      styling.colorTierHash,
      styling.afterColorFolderKey
    );
  }
  return wigPreviewLiveAnglePaths(promptVersion, u, styling.colorTierHash);
}

/** Short studio try-on line so Fal matches the styled mannequin reference (not plain color-tier). */
export function liveTryOnStudioStylingPromptLine(
  stylingRaw: string,
  partSelection: LiveTryOnPartSelection
): string | null {
  const styling = String(stylingRaw || 'NONE').toUpperCase();
  const hasLayers = styling.includes('LAYERS');
  const hasCrimps = styling.includes('CRIMPS');
  const hasFlatIron = styling.includes('FLAT IRON');
  const hasBangs = styling.includes('BANGS');
  const salonCount = [hasLayers, hasCrimps, hasFlatIron].filter(Boolean).length;
  if (salonCount > 1) return null;

  const partLabel =
    partSelection === 'LEFT' ? 'left side part' : partSelection === 'RIGHT' ? 'right side part' : 'center part';

  if (hasLayers && salonCount === 1) {
    const bangs = hasBangs ? ' with curtain bangs' : '';
    return `Salon **layered S-wave curls** (${partLabel})${bangs} — match IMAGE 2 layer length, volume, and curl pattern exactly.`;
  }
  if (hasCrimps && salonCount === 1) {
    const bangs = hasBangs ? ' with curtain bangs' : '';
    return `Salon **crimp-iron zig-zag texture** (${partLabel})${bangs} — match IMAGE 2 ridge spacing and gloss exactly.`;
  }
  if (hasFlatIron && salonCount === 1) {
    const bangs = hasBangs ? ' with curtain bangs' : '';
    return `**Bone-straight flat-iron** finish (${partLabel})${bangs} — match IMAGE 2 sleek length and part line.`;
  }
  if (hasBangs && salonCount === 0) {
    return '**Curtain bangs** across the forehead — match IMAGE 2 bang length and blend into the lace front.';
  }
  return null;
}

export function wigPreviewSelectionsFromTryOnBody(body: Record<string, unknown>): WigPreviewSelections {
  const readString = (key: string, fallback: string) => {
    const v = body[key];
    return typeof v === 'string' && v.trim() ? v.trim() : fallback;
  };
  const readStringArray = (key: string): string[] => {
    const v = body[key];
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).toUpperCase()).filter(Boolean);
  };
  return {
    unitKey: readString('unitKey', 'NOIR').toUpperCase(),
    length: readString('length', '24"'),
    density: readString('density', '200%'),
    lace: readString('lace', '13X6'),
    texture: readString('texture', 'SILKY'),
    color: readString('color', 'OFF BLACK').toUpperCase().replace(/\s+/g, ' ').trim(),
    hairline: readString('hairline', 'NATURAL'),
    styling: readString('styling', 'NONE').toUpperCase(),
    addOns: readStringArray('addOns'),
  };
}
