import {
  XPS_DEMO_BRAND_IDS,
  XPS_PRODUCTION_STAGE_LABELS,
  XPS_ROOM_PATHS,
  type XpsRoomPath,
} from '../constants';
import { readStudioProductionSystemStore } from '../persistence';
import { listProductionPackages } from '../engines/production-coordinator';
import { getNarrativeBlueprint } from '../../narrative-intelligence/engines/narrative-blueprint-generator';
import { listProductionConsumerBindings } from '../engines/production-consumer-engine';
import { getLastProductionPreview } from '../engines/production-playground-engine';
import type { XpsControlRoomProduction, XpsReadyView, XpsRuntimeInput } from '../types';
import { buildCreativeOperatingSystemControlRoomOverlay } from '../../creative-operating-system/room/ready-view';

export function isValidXpsRoomPath(slug: string): slug is XpsRoomPath {
  return (XPS_ROOM_PATHS as readonly string[]).includes(slug);
}

export function xpsRoomPathFromSlug(slug?: string): XpsRoomPath {
  if (slug && isValidXpsRoomPath(slug)) return slug;
  return 'studio-production';
}

export function buildXpsOrbNote(): string {
  return 'Studio Production System™ — Studio OS coordinates complete productions through autonomous departments. No isolated assets without a governed Production Package™.';
}

function toControlRoomEntry(
  pkg: import('../types').XpsProductionPackage
): XpsControlRoomProduction {
  const blueprint = getNarrativeBlueprint(pkg.blueprintId);
  return {
    package: pkg,
    blueprint,
    currentStageLabel: XPS_PRODUCTION_STAGE_LABELS[pkg.currentStage],
    assignedDepartments: pkg.departments,
    blockingIssues: pkg.blockingIssues,
    pendingApprovals: pkg.approvals.filter((a) => a.status === 'pending'),
    assets: pkg.assets,
    timeline: pkg.timeline,
    publishing: pkg.publishing,
    performance: pkg.performance,
  };
}

export function buildStudioProductionSystemReadyView(input?: XpsRuntimeInput): XpsReadyView {
  const store = readStudioProductionSystemStore();
  const activeRoom = xpsRoomPathFromSlug(input?.pathname?.split('/').pop());
  const playground = input?.playground ? { ...store.playground, ...input.playground } : store.playground;
  const brandId = input?.brandId ?? playground.brandId;

  const activePackages = listProductionPackages().filter((p) => p.brandId === brandId);
  const allPackages = listProductionPackages();
  const controlRoom = (allPackages.length ? allPackages : activePackages).map(toControlRoomEntry);
  const preview = store.lastPreview ?? getLastProductionPreview();
  const activePkg = preview?.productionPackage ?? controlRoom[0]?.package;

  return {
    activeRoom,
    activeBrandId: brandId,
    activePackages,
    controlRoom,
    playground,
    preview,
    consumerBindings: listProductionConsumerBindings(activePkg),
    organizationOverlay: buildCreativeOperatingSystemControlRoomOverlay(brandId),
    demoBrandIds: [...XPS_DEMO_BRAND_IDS],
    orbNote: buildXpsOrbNote(),
    constitutionLocked: store.constitutionLocked,
  };
}
