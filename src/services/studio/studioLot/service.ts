import { studioServiceNotConnected, studioServicePhase2, type StudioServiceStub, type StudioServiceResult } from '../types';
import { exportStudioLotSnapshot, getStudioLotById } from '../../../hooks/useAdminStudioStudioLotState';
import { STUDIO_LOT_INHERITANCE_CHAIN } from '../../../utils/adminStudioStudioLotDemo';

export type StudioLotSnapshot = ReturnType<typeof exportStudioLotSnapshot>;

export type StudioLotInheritance = {
  studioId: string;
  studioName: string;
  inheritanceChain: readonly string[];
  studioSnapshot: NonNullable<ReturnType<typeof getStudioLotById>>;
  visualDna: {
    masterEnvironment: string;
    colorGrading: string;
    mood: string;
    luxuryLevel: string;
    materialLibrary: string;
  };
  camera: {
    presets: string;
    lens: string;
    movement: string;
    aspectRatios: string;
  };
  lighting: {
    presets: string;
    profile: string;
  };
  prompts: {
    fal: string;
    openArt: string;
    imageGen: string;
    videoGen: string;
    backgroundPlates: string;
  };
  continuityVersion: string;
  bypassBlocked: true;
  inheritedFrom: string[];
  mansionMapping: {
    floor: string;
    room: string;
    status: string;
    notes: string;
  };
};

function buildInheritedFrom(): string[] {
  return ['BRAND BRAIN', 'CREATIVE DIRECTOR', 'SHOW BIBLE', 'EDITORIAL RULES', 'PRODUCT KNOWLEDGE'];
}

export function getStudioSnapshot(studioId: string): StudioLotInheritance | null {
  const studio = getStudioLotById(studioId);
  if (!studio) return null;
  return {
    studioId: studio.id,
    studioName: studio.studioName,
    inheritanceChain: STUDIO_LOT_INHERITANCE_CHAIN,
    studioSnapshot: studio,
    visualDna: {
      masterEnvironment: studio.masterEnvironment,
      colorGrading: studio.colorGrading,
      mood: studio.mood,
      luxuryLevel: studio.luxuryLevel,
      materialLibrary: studio.materialLibrary,
    },
    camera: {
      presets: studio.cameraPresets,
      lens: studio.cameraLens,
      movement: studio.cameraMovement,
      aspectRatios: studio.aspectRatios,
    },
    lighting: {
      presets: studio.lightingPresets,
      profile: studio.lightingProfileSummary,
    },
    prompts: {
      fal: studio.promptFal,
      openArt: studio.promptOpenArt,
      imageGen: studio.promptImageGen,
      videoGen: studio.promptVideoGen,
      backgroundPlates: studio.promptBackgroundPlates,
    },
    continuityVersion: studio.continuityVersion,
    bypassBlocked: true,
    inheritedFrom: buildInheritedFrom(),
    mansionMapping: {
      floor: studio.mansionFloor,
      room: studio.mansionRoom,
      status: studio.mansionStatus,
      notes: studio.mansionMappingNotes,
    },
  };
}

export function inheritForGeneration(studioId: string): StudioLotInheritance | null {
  return getStudioSnapshot(studioId);
}

export const studioLotStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<StudioLotSnapshot>>;
  getStudioSnapshot(studioId: string): Promise<StudioServiceResult<StudioLotInheritance>>;
  inheritForGeneration(studioId: string): Promise<StudioServiceResult<StudioLotInheritance>>;
} = {
  id: 'studio-lot',
  label: 'STUDIO LOT',
  phase: 2,
  enabled: false,
  description:
    'VIRTUAL PRODUCTION CAMPUS — ONE REUSABLE ENVIRONMENT PER STUDIO · AI NEVER GENERATES INDEPENDENTLY',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Studio Lot snapshot requires browser localStorage context.');
    }
    return { ok: true, data: exportStudioLotSnapshot() };
  },
  async getStudioSnapshot(studioId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Studio Lot requires browser context.');
    }
    const snapshot = getStudioSnapshot(studioId);
    if (!snapshot) {
      return studioServicePhase2(`Studio Lot entry not found: ${studioId}`);
    }
    return { ok: true, data: snapshot };
  },
  async inheritForGeneration(studioId) {
    return studioLotStudioService.getStudioSnapshot(studioId);
  },
};
