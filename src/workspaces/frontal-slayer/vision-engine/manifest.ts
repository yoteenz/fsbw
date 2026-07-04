import { VISION_MODE_CATALOG } from '../../../studio-os-core/vision-engine/modeCatalog';
import { resolveStopsForVisionModeKind } from '../../../studio-os-core/vision-engine/modeResolver';
import { VISION_MODE_LABELS } from '../../../studio-os-core/vision-engine/constants';
import type { VisionChapter, VisionModeDefinition, VisionStop, WorkspaceVisionManifest } from '../../../studio-os-core/vision-engine/types';
import { FRONTAL_SLAYER_VISION_STOPS } from './tourScript';

function buildChapters(stops: VisionStop[]): VisionChapter[] {
  const chapters: VisionChapter[] = [];
  for (const stop of stops) {
    const existing = chapters.find((c) => c.id === stop.chapterId);
    if (existing) {
      existing.stopIds.push(stop.id);
    } else {
      chapters.push({
        id: stop.chapterId,
        title: stop.sectionLabel,
        stopIds: [stop.id],
      });
    }
  }
  return chapters;
}

function buildMode(kind: (typeof VISION_MODE_CATALOG)[number]['kind']): VisionModeDefinition {
  const catalog = VISION_MODE_CATALOG.find((c) => c.kind === kind)!;
  const stops = resolveStopsForVisionModeKind(FRONTAL_SLAYER_VISION_STOPS, kind);
  return {
    id: `frontal-slayer-${kind}`,
    kind,
    name: `Vision Mode — ${VISION_MODE_LABELS[kind]}`,
    description: catalog.description,
    workspaceId: 'frontal-slayer',
    tagline: 'IMMERSIVE LUXURY BEAUTY',
    openingTitle: 'FRONTAL SLAYER',
    endingTagline: 'LUXURY WITHOUT LIMITS.',
    chapters: buildChapters(stops),
    stops,
    presenterModeDefault: catalog.presenterDefault,
    recordOptimized: catalog.recordOptimized,
  };
}

export function buildFrontalSlayerVisionManifest(): WorkspaceVisionManifest {
  const routes = [...new Set(FRONTAL_SLAYER_VISION_STOPS.map((s) => s.route).filter(Boolean))] as string[];
  return {
    workspaceId: 'frontal-slayer',
    brandName: 'Frontal Slayer',
    logoText: 'FRONTAL SLAYER',
    tagline: 'IMMERSIVE LUXURY BEAUTY',
    primaryColor: '#eb1c24',
    routes,
    modes: VISION_MODE_CATALOG.map((c) => buildMode(c.kind)),
  };
}
