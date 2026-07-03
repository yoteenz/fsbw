import { studioServiceNotConnected, studioServicePhase2, type StudioServiceStub, type StudioServiceResult } from '../types';
import { exportTalentAgencySnapshot, getTalentAgencyById } from '../../../hooks/useAdminStudioTalentAgencyState';
import { TALENT_INHERITANCE_CHAIN } from '../../../utils/adminStudioTalentAgencyDemo';

export type TalentAgencySnapshot = ReturnType<typeof exportTalentAgencySnapshot>;

export type TalentInheritance = {
  talentId: string;
  talentName: string;
  inheritanceChain: readonly string[];
  talentSnapshot: NonNullable<ReturnType<typeof getTalentAgencyById>>;
  visual: {
    masterAppearance: string;
    hair: string;
    wardrobe: string;
    colorPalette: string;
    luxuryStyle: string;
    version: string;
  };
  voice: {
    profile: string;
    accent: string;
    energy: string;
    luxuryTone: string;
    catchphrases: string;
  };
  personality: {
    mission: string;
    teachingStyle: string;
    topicsOfExpertise: string;
    brandValues: string;
  };
  prompts: {
    image: string;
    video: string;
    voice: string;
    portrait: string;
    hero: string;
  };
  productionRules: {
    appearance: string;
    voice: string;
    wardrobe: string;
    personality: string;
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
  return ['BRAND BRAIN', 'CREATIVE DIRECTOR', 'SHOW BIBLE', 'STUDIO LOT', 'EDITORIAL RULES'];
}

export function getTalentSnapshot(talentId: string): TalentInheritance | null {
  const t = getTalentAgencyById(talentId);
  if (!t) return null;
  return {
    talentId: t.id,
    talentName: t.name,
    inheritanceChain: TALENT_INHERITANCE_CHAIN,
    talentSnapshot: t,
    visual: {
      masterAppearance: t.masterAppearance,
      hair: t.hair,
      wardrobe: t.wardrobe,
      colorPalette: t.colorPalette,
      luxuryStyle: t.luxuryStyle,
      version: t.visualVersion,
    },
    voice: {
      profile: t.voice,
      accent: t.accent,
      energy: t.energy,
      luxuryTone: t.luxuryTone,
      catchphrases: t.catchphrases,
    },
    personality: {
      mission: t.mission,
      teachingStyle: t.teachingStyle,
      topicsOfExpertise: t.topicsOfExpertise,
      brandValues: t.brandValues,
    },
    prompts: {
      image: t.promptImage,
      video: t.promptVideo,
      voice: t.promptVoice,
      portrait: t.promptPortrait,
      hero: t.promptHero,
    },
    productionRules: {
      appearance: t.ruleAppearance,
      voice: t.ruleVoice,
      wardrobe: t.ruleWardrobe,
      personality: t.rulePersonality,
    },
    continuityVersion: t.continuityVersion,
    bypassBlocked: true,
    inheritedFrom: buildInheritedFrom(),
    mansionMapping: {
      floor: t.mansionFloor,
      room: t.mansionRoom,
      status: t.mansionStatus,
      notes: t.mansionMappingNotes,
    },
  };
}

export function inheritForGeneration(talentId: string): TalentInheritance | null {
  return getTalentSnapshot(talentId);
}

export const talentAgencyStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<TalentAgencySnapshot>>;
  getTalentSnapshot(talentId: string): Promise<StudioServiceResult<TalentInheritance>>;
  inheritForGeneration(talentId: string): Promise<StudioServiceResult<TalentInheritance>>;
} = {
  id: 'talent-agency',
  label: 'TALENT AGENCY',
  phase: 2,
  enabled: false,
  description:
    'MASTER CAST LIBRARY — ONE PROFILE PER PERSONALITY · AI NEVER RECREATES TALENT INDEPENDENTLY',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Talent Agency snapshot requires browser localStorage context.');
    }
    return { ok: true, data: exportTalentAgencySnapshot() };
  },
  async getTalentSnapshot(talentId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Talent Agency requires browser context.');
    }
    const snapshot = getTalentSnapshot(talentId);
    if (!snapshot) {
      return studioServicePhase2(`Talent Agency entry not found: ${talentId}`);
    }
    return { ok: true, data: snapshot };
  },
  async inheritForGeneration(talentId) {
    return talentAgencyStudioService.getTalentSnapshot(talentId);
  },
};
