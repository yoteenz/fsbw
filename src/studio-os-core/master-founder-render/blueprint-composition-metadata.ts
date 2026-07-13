import type { BlueprintCompositionMetadata, HeroObjectAnchor, SafeCropRegion } from './contract';
import { MASTER_FOUNDER_RENDER_VERSION } from './contract';
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export function buildBlueprintCompositionMetadata(plan: ConstructionPlan): BlueprintCompositionMetadata {
  const heroObjects: HeroObjectAnchor[] = [];

  for (const asset of plan.heroAssets) {
    const socket = plan.assetSockets.find((s) => s.socketId === asset.socketId);
    const label = socket?.label ?? asset.assetId;
    let role: HeroObjectAnchor['role'] = 'furniture-hero';
    const lower = label.toLowerCase();
    if (lower.includes('reception')) role = 'reception-desk';
    else if (lower.includes('logo') || lower.includes('brand')) role = 'brand-wall';
    else if (lower.includes('crystal')) role = 'crystal';
    else if (lower.includes('landmark') || lower.includes('hero')) role = 'hero-landmark';
    else if (lower.includes('waiting')) role = 'waiting-area';
    else if (lower.includes('entrance')) role = 'entrance';

    heroObjects.push({
      objectId: asset.assetId,
      label,
      role,
      priority: asset.tier === 'hero' ? 1 : 2,
    });
  }

  heroObjects.sort((a, b) => a.priority - b.priority);

  const primaryFocus = heroObjects[0]?.label ?? plan.room.displayName;
  const secondaryFocus = heroObjects[1]?.label ?? plan.room.purpose;

  const safeCropAreas: SafeCropRegion[] = [
    { regionId: 'center-hero', x: 0.25, y: 0.2, width: 0.5, height: 0.6, label: 'Hero safe crop' },
    { regionId: 'mobile-tight', x: 0.3, y: 0.15, width: 0.4, height: 0.7, label: 'Mobile tight crop' },
  ];

  const camera = plan.cameraAnchors.find((c) => c.purpose === 'hero' || c.purpose === 'overview') ?? plan.cameraAnchors[0];

  return {
    metadataVersion: MASTER_FOUNDER_RENDER_VERSION,
    blueprintId: plan.planId,
    heroObjects,
    primaryFocus,
    secondaryFocus,
    safeCropAreas,
    visualPriority: heroObjects.map((h) => h.label),
    architecturalAnchors: [
      plan.architecture.architectureId,
      plan.building.buildingId,
      plan.floor.floorId,
      camera?.label ?? 'hero-camera',
      ...plan.collisionZones.slice(0, 3),
    ],
    walkingDirection: plan.navigationGraph.walkPaths[0] ?? 'entry-to-hero',
    cameraHeightM: 1.65,
    cameraOrbitRadiusM: 4.5,
    recommendedFocalLengthMm: 24,
    recommendedComposition: 'desktop-hero',
    sceneFocusGraph: heroObjects.map((h, i) => ({
      nodeId: h.objectId,
      label: h.label,
      weight: 1 / (i + 1),
    })),
  };
}
