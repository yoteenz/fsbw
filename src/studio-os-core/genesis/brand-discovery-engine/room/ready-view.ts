import { XBD_DEMO_BRAND_IDS, XBD_ROOM_PATHS, type XbdRoomPath } from '../constants';
import { readBrandDiscoveryEngineStore } from '../persistence';
import { listConsumerBindings } from '../engines/brand-application-engine';
import { scoreBrandConsistency } from '../engines/brand-consistency-checker';
import {
  buildDirectionsForBrand,
  getOrbPromptForStep,
} from '../engines/brand-discovery-engine';
import { getLatestElevationReport } from '../engines/brand-elevation-engine';
import { getBrandDnaById, getDefaultBrandDna } from '../engines/brand-dna-registry';
import { evaluateBrandIntelligence } from '../engines/brand-intelligence-layer';
import { buildPlaygroundAsset } from '../engines/brand-playground-engine';
import type { XbdReadyView, XbdRuntimeInput } from '../types';

export function isValidXbdRoomPath(slug: string): slug is XbdRoomPath {
  return (XBD_ROOM_PATHS as readonly string[]).includes(slug);
}

export function xbdRoomPathFromSlug(slug?: string): XbdRoomPath {
  if (slug && isValidXbdRoomPath(slug)) return slug;
  return 'brand-discovery-engine';
}

export function buildXbdOrbNote(): string {
  return 'Brand Discovery Engine™ treats brand as strategic living intelligence — every creative output inherits Brand DNA™ automatically.';
}

export function buildBrandDiscoveryEngineReadyView(input?: XbdRuntimeInput): XbdReadyView {
  const store = readBrandDiscoveryEngineStore();
  const activeRoom = xbdRoomPathFromSlug(input?.pathname?.split('/').pop());
  const playground = input?.playground
    ? { ...store.playground, ...input.playground }
    : store.playground;

  const brandId = input?.brandId ?? playground.brandId;
  const activeBrand = getBrandDnaById(brandId) ?? getDefaultBrandDna();
  const directions =
    store.discoverySession.generatedDirections ?? buildDirectionsForBrand(activeBrand);
  const playgroundAsset = buildPlaygroundAsset(activeBrand, playground.assetType);
  const consistencyPreview = scoreBrandConsistency(
    activeBrand,
    playground.sampleArtifactSummary,
    playground.assetType
  );
  const elevationReport = getLatestElevationReport(activeBrand.brandId) ?? {
    reportId: `elev-${activeBrand.brandId}-preview`,
    brandId: activeBrand.brandId,
    overallHealth: activeBrand.status === 'canonical' ? 92 : 68,
    findings: [
      {
        findingId: 'preview',
        category: 'Preview',
        severity: 'info' as const,
        summary: 'Run Brand Elevation Engine™ for a full audit report.',
        recommendation: 'Open Brand Elevation room and generate report.',
      },
    ],
    generatedAt: new Date().toISOString(),
  };
  const intelligencePreview = evaluateBrandIntelligence({
    brandId: activeBrand.brandId,
    artifactType: playground.assetType,
    artifactSummary: playground.sampleArtifactSummary,
  });

  return {
    activeRoom,
    brands: store.brandRegistry,
    activeBrand,
    discoverySession: {
      ...store.discoverySession,
      orbPrompt: getOrbPromptForStep(store.discoverySession),
    },
    directions,
    playground,
    playgroundAsset,
    consistencyPreview,
    elevationReport,
    intelligencePreview,
    consumerBindings: listConsumerBindings(activeBrand.brandId),
    demoBrandIds: [...XBD_DEMO_BRAND_IDS],
    orbNote: buildXbdOrbNote(),
    constitutionLocked: store.constitutionLocked,
  };
}
