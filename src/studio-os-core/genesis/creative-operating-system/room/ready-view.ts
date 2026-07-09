import {
  XCOS_DEMO_BRAND_IDS,
  XCOS_ORG_STATE_LABELS,
  XCOS_ROOM_PATHS,
  type XcosDemoBrandId,
  type XcosRoomPath,
} from '../constants';
import { readCreativeOperatingSystemStore } from '../persistence';
import { listBoardMeetings } from '../engines/board-meeting-engine';
import { getExecutiveStatusForPackage, listBoardExecutives } from '../engines/executive-creative-board';
import { listCreativeMemory } from '../engines/creative-memory-engine';
import { listEvolutionProposals } from '../engines/creative-evolution-engine';
import { listEconomyAssets } from '../engines/creative-economy-registry';
import { evaluateCreativeGovernance } from '../engines/creative-governance-engine';
import { listCreativeConsumerBindings } from '../engines/creative-consumer-engine';
import { listProductionPackages } from '../../studio-production-system/engines/production-coordinator';
import { getStudioIntelligenceLayerReadyView } from '../../studio-intelligence-layer/engine';
import type { XcosControlRoomOverlay, XcosReadyView, XcosRuntimeInput } from '../types';

export function isValidXcosRoomPath(slug: string): slug is XcosRoomPath {
  return (XCOS_ROOM_PATHS as readonly string[]).includes(slug);
}

export function xcosRoomPathFromSlug(slug?: string): XcosRoomPath {
  if (slug && isValidXcosRoomPath(slug)) return slug;
  return 'creative-operating-system';
}

export function buildXcosOrbNote(): string {
  return 'Creative Operating System™ — Studio Intelligence™ operates as a continuously learning creative organization. Every production convenes the Executive Creative Board™, compounds Creative Memory™, and evolves future reasoning.';
}

export function buildCreativeOperatingSystemControlRoomOverlay(brandId?: XcosDemoBrandId): XcosControlRoomOverlay {
  const store = readCreativeOperatingSystemStore();
  const packages = listProductionPackages();
  const filtered = brandId ? packages.filter((p) => p.brandId === brandId) : packages;
  const activePkg = filtered[0];
  const meetings = listBoardMeetings();
  const memory = listCreativeMemory(brandId);
  const evolution = listEvolutionProposals(brandId);
  const economy = listEconomyAssets(brandId);

  evaluateCreativeGovernance();

  let studioIntelligenceStatus = 'operational';
  try {
    const sil = getStudioIntelligenceLayerReadyView({ companyId: brandId ?? 'studio-os' });
    studioIntelligenceStatus = sil.constitutionLocked ? 'executive reasoning active' : 'ready';
  } catch {
    studioIntelligenceStatus = 'degraded';
  }

  return {
    orgState: store.orgState,
    orgStateLabel: XCOS_ORG_STATE_LABELS[store.orgState],
    executiveBoard: activePkg
      ? getExecutiveStatusForPackage(activePkg.packageId)
      : listBoardExecutives().map((e) => ({ ...e, status: 'idle' })),
    activeMeetings: meetings.filter((m) => m.founderDecision === 'pending'),
    pendingFounderDecisions: meetings.filter((m) => m.founderDecision === 'pending').length,
    departmentActivity: filtered.flatMap((p) =>
      p.departments.slice(0, 6).map((d) => ({
        department: d.label,
        status: d.status,
        productionId: p.packageId,
      }))
    ),
    liveProductionCount: filtered.length,
    recentMemory: memory.slice(0, 6),
    memoryCount: memory.length,
    evolutionInsights: evolution.slice(0, 5),
    economyAssetCount: economy.length,
    recentEconomyAssets: economy.slice(0, 5),
    studioIntelligenceStatus,
    instituteLinkCount: memory.filter((m) => m.instituteLinked).length,
  };
}

export function buildCreativeOperatingSystemReadyView(input?: XcosRuntimeInput): XcosReadyView {
  const store = readCreativeOperatingSystemStore();
  const activeRoom = xcosRoomPathFromSlug(input?.pathname?.split('/').pop());
  const brandId = input?.brandId ?? 'studio-os';
  const meetings = listBoardMeetings();
  const memory = listCreativeMemory(brandId);
  const evolution = listEvolutionProposals(brandId);
  const economy = listEconomyAssets(brandId);
  const governance = evaluateCreativeGovernance();

  return {
    activeRoom,
    activeBrandId: brandId,
    orgState: store.orgState,
    boardMeetings: meetings,
    pendingMeetings: meetings.filter((m) => m.founderDecision === 'pending'),
    memoryRecords: memory,
    evolutionProposals: evolution,
    economyAssets: economy,
    governanceRecords: governance,
    controlRoomOverlay: buildCreativeOperatingSystemControlRoomOverlay(brandId),
    consumerBindings: listCreativeConsumerBindings(),
    demoBrandIds: [...XCOS_DEMO_BRAND_IDS],
    orbNote: buildXcosOrbNote(),
    constitutionLocked: store.constitutionLocked,
  };
}
