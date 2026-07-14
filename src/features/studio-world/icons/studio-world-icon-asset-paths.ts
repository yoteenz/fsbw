/**
 * Node- and browser-safe Experience Lab icon asset paths (no PNG imports).
 * Used by Studio World Icon Registry bridge and manifest generation.
 */
import type { ExperienceLabIconName } from './experience-lab-icon-registry';
import { STUDIO_WORLD_ICON_V6_OUTPUT_DIR } from './studio-world-icon-source-manifest';
import parityManifest from './studio-world-icon-runtime-parity.generated.json';

const filenameByKey = new Map<string, string>(
  parityManifest.icons.map((entry) => [entry.key, entry.filename]),
);

/** Logical repo path for a v6 grid-calibrated icon PNG. */
export function resolveExperienceLabIconAssetPath(name: ExperienceLabIconName): string {
  const filename = filenameByKey.get(name);
  if (filename) {
    return `${STUDIO_WORLD_ICON_V6_OUTPUT_DIR}/${filename}`;
  }
  return `${STUDIO_WORLD_ICON_V6_OUTPUT_DIR}/${name}.png`;
}

export const EXPERIENCE_LAB_ICON_BRIDGE_LOCKDOWN_CERTIFIED = false as const;
