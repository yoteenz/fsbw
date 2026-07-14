#!/usr/bin/env node
/** Generates experience-lab-icon-presentation.ts from optical profile + founder tuning. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const profileSrc = readFileSync(
  resolve(ROOT, 'src/features/studio-world/icons/experience-lab-icon-optical-profile.ts'),
  'utf8',
);
const re =
  /(\w+):\s*\{\s*scale:\s*([\d.]+),\s*translateX:\s*(-?\d+),\s*translateY:\s*(-?\d+),[\s\S]*?centeringScore:\s*([\d.]+),[\s\S]*?paddingScore:\s*([\d.]+),/g;

const boosts = {
  materials: { scale: 1.26, offsetY: -2, opticalWeight: 1.08 },
  construction: { scale: 1.18, offsetY: -1, opticalWeight: 1.05 },
  dashboard: { scale: 1.34, offsetY: 0, opticalWeight: 1.1 },
  camera: { scale: 1.16, offsetY: 0, opticalWeight: 1.06 },
  analytics: { scale: 1.14, offsetY: -1, opticalWeight: 1.05 },
  zoomIn: { scale: 1.12, offsetY: -1, opticalWeight: 1.04 },
  permissions: { scale: 1.2, offsetY: -1, opticalWeight: 1.06 },
  playback: { scale: 1.18, offsetY: -1, opticalWeight: 1.05 },
  perspective: { scale: 1.2, offsetY: -1, opticalWeight: 1.06 },
  terminal: { scale: 1.22, offsetY: -1, opticalWeight: 1.07 },
};

const round2 = (n) => Math.round(n * 100) / 100;
const entries = [];
let m;
while ((m = re.exec(profileSrc)) !== null) {
  const key = m[1];
  const b = boosts[key];
  const scale = round2(b?.scale ?? Math.min(1.2, Math.max(0.92, parseFloat(m[2]) * 1.04)));
  const offsetX = b?.offsetX ?? parseInt(m[3], 10);
  const offsetY = b?.offsetY ?? parseInt(m[4], 10);
  const cs = parseFloat(m[5]);
  const ps = parseFloat(m[6]);
  const opticalWeight = round2(b?.opticalWeight ?? scale * 0.98);
  const centering = Math.round(cs * 100);
  const padding = Math.round(ps * 100);
  const scaleScore = scale >= 0.9 && scale <= 1.35 ? 100 : 92;
  const visualWeight = Math.round(opticalWeight * 94);
  const consistency = 98;
  const presentation = Math.round(
    (centering + padding + scaleScore + visualWeight + consistency) / 5,
  );
  const overall = Math.round(
    centering * 0.25 + padding * 0.2 + scaleScore * 0.2 + visualWeight * 0.2 + consistency * 0.15,
  );
  entries.push({
    key,
    scale,
    offsetX,
    offsetY,
    opticalWeight,
    centering,
    padding,
    scaleScore,
    visualWeight,
    consistency,
    presentation,
    overall,
  });
}

const lines = entries
  .map(
    (e) => `  ${e.key}: {
    scale: ${e.scale},
    offsetX: ${e.offsetX},
    offsetY: ${e.offsetY},
    strokeWeight: 1,
    opticalWeight: ${e.opticalWeight},
    padding: 0,
    minimumSize: 10,
    maximumSize: 36,
    baselineAdjust: 0,
    scores: {
      presentation: ${e.presentation},
      centering: ${e.centering},
      scale: ${e.scaleScore},
      padding: ${e.padding},
      visualWeight: ${e.visualWeight},
      consistency: ${e.consistency},
      overall: ${e.overall},
    },
  }`,
  )
  .join(',\n');

const body = `import type { ExperienceLabIconName } from './experience-lab-icon-registry';

/** Canonical Studio World icon presentation — runtime display only (PNG assets frozen). */
export type IconPresentationScores = {
  presentation: number;
  centering: number;
  scale: number;
  padding: number;
  visualWeight: number;
  consistency: number;
  overall: number;
};

export type IconPresentationProfile = {
  scale: number;
  offsetX: number;
  offsetY: number;
  strokeWeight: number;
  opticalWeight: number;
  padding: number;
  minimumSize: number;
  maximumSize: number;
  baselineAdjust: number;
  scores: IconPresentationScores;
};

export const STUDIO_WORLD_ICON_PRESENTATION_VERSION = 'studio-world-icon-presentation-v1';

/** Single source of truth for all Studio World departments and Industry Packs. */
export const StudioWorldIconPresentationRegistry: Record<
  ExperienceLabIconName,
  IconPresentationProfile
> = {
${lines}
} as Record<ExperienceLabIconName, IconPresentationProfile>;

export const ExperienceLabIconPresentationSystem = {
  version: STUDIO_WORLD_ICON_PRESENTATION_VERSION,
  registry: StudioWorldIconPresentationRegistry,
} as const;

export function resolveStudioWorldIconPresentation(
  name: ExperienceLabIconName,
): IconPresentationProfile {
  return StudioWorldIconPresentationRegistry[name];
}
`;

writeFileSync(resolve(ROOT, 'src/features/studio-world/icons/experience-lab-icon-presentation.ts'), body);
console.log(`Generated ${entries.length} presentation profiles`);
