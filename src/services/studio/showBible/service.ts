import { studioServiceNotConnected, studioServicePhase2, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  exportShowBibleSnapshot,
  getShowBibleChecklist,
  getShowBibleShowById,
} from '../../../hooks/useAdminStudioShowBibleState';
import {
  SHOW_BIBLE_INHERITANCE_CHAIN,
  SHOW_BIBLE_PRODUCTION_CHECKLIST_ITEMS,
} from '../../../utils/adminStudioShowBibleDemo';

export type ShowBibleSnapshot = ReturnType<typeof exportShowBibleSnapshot>;

export type ShowBibleEpisodeInheritance = {
  showId: string;
  showName: string;
  inheritanceChain: readonly string[];
  showSnapshot: NonNullable<ReturnType<typeof getShowBibleShowById>>;
  promptTemplates: {
    video: string;
    image: string;
    thumbnail: string;
    journal: string;
    email: string;
    carousel: string;
    reel: string;
    tiktok: string;
    pinterest: string;
    push: string;
    voiceover: string;
    transcript: string;
  };
  contentRules: {
    minEpisodeLength: string;
    maxEpisodeLength: string;
    requiredAssets: string;
    requiredCtas: string;
    requiredProductMentions: string;
    requiredMembershipMentions: string;
    requiredRewards: string;
  };
  bypassBlocked: true;
  inheritedFrom: string[];
};

export type ShowBibleChecklistValidation = {
  showId: string;
  items: Array<{ id: string; label: string; complete: boolean }>;
  allComplete: boolean;
  readyForGeneration: boolean;
};

function buildInheritedFrom(): string[] {
  return [
    'BRAND BRAIN',
    'CREATIVE DIRECTOR',
    'EDITORIAL RULES',
    'CAMPAIGN FRAMEWORKS',
    'PRODUCT KNOWLEDGE',
  ];
}

export function getShowSnapshot(showId: string): ShowBibleEpisodeInheritance | null {
  const show = getShowBibleShowById(showId);
  if (!show) return null;
  return {
    showId: show.id,
    showName: show.showName,
    inheritanceChain: SHOW_BIBLE_INHERITANCE_CHAIN,
    showSnapshot: show,
    promptTemplates: {
      video: show.promptVideo,
      image: show.promptImage,
      thumbnail: show.promptThumbnail,
      journal: show.promptJournal,
      email: show.promptEmail,
      carousel: show.promptCarousel,
      reel: show.promptReel,
      tiktok: show.promptTiktok,
      pinterest: show.promptPinterest,
      push: show.promptPush,
      voiceover: show.promptVoiceover,
      transcript: show.promptTranscript,
    },
    contentRules: {
      minEpisodeLength: show.minEpisodeLength,
      maxEpisodeLength: show.maxEpisodeLength,
      requiredAssets: show.requiredAssets,
      requiredCtas: show.requiredCtas,
      requiredProductMentions: show.requiredProductMentions,
      requiredMembershipMentions: show.requiredMembershipMentions,
      requiredRewards: show.requiredRewards,
    },
    bypassBlocked: true,
    inheritedFrom: buildInheritedFrom(),
  };
}

export function inheritForEpisode(showId: string): ShowBibleEpisodeInheritance | null {
  return getShowSnapshot(showId);
}

export function validateProductionChecklist(showId: string): ShowBibleChecklistValidation {
  const checklist = getShowBibleChecklist(showId);
  const items = SHOW_BIBLE_PRODUCTION_CHECKLIST_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    complete: checklist[item.id] ?? false,
  }));
  const allComplete = items.every((i) => i.complete);
  return {
    showId,
    items,
    allComplete,
    readyForGeneration: allComplete,
  };
}

export const showBibleStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<ShowBibleSnapshot>>;
  getShowSnapshot(showId: string): Promise<StudioServiceResult<ShowBibleEpisodeInheritance>>;
  inheritForEpisode(showId: string): Promise<StudioServiceResult<ShowBibleEpisodeInheritance>>;
  validateChecklist(showId: string): Promise<StudioServiceResult<ShowBibleChecklistValidation>>;
} = {
  id: 'show-bible',
  label: 'SHOW BIBLE',
  phase: 2,
  enabled: false,
  description:
    'PRODUCTION HANDBOOK — EVERY EPISODE INHERITS SHOW DNA · AI PROVIDERS CANNOT BYPASS',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Show Bible snapshot requires browser localStorage context.');
    }
    return { ok: true, data: exportShowBibleSnapshot() };
  },
  async getShowSnapshot(showId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Show Bible requires browser context.');
    }
    const snapshot = getShowSnapshot(showId);
    if (!snapshot) {
      return studioServicePhase2(`Show Bible entry not found: ${showId}`);
    }
    return { ok: true, data: snapshot };
  },
  async inheritForEpisode(showId) {
    return showBibleStudioService.getShowSnapshot(showId);
  },
  async validateChecklist(showId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Checklist validation requires browser context.');
    }
    return { ok: true, data: validateProductionChecklist(showId) };
  },
};
