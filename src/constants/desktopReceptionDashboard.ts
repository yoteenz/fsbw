import type { FinalSceneHitRect } from './finalLobbySceneAssets';
import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
} from './desktopRoomHeroArt';
import { DESKTOP_NO_TEXT_ROOM_BACKGROUNDS } from './desktopNoTextBackgrounds';

/** Full-bleed 21:9 Reception mansion dashboard — do not crop or edit. */
export const DESKTOP_RECEPTION_BACKGROUND_URL = DESKTOP_NO_TEXT_ROOM_BACKGROUNDS.reception;

export const RECEPTION_DASHBOARD_IMAGE = {
  width: DESKTOP_ROOM_HERO_ART_WIDTH,
  height: DESKTOP_ROOM_HERO_ART_HEIGHT,
} as const;

export type ReceptionLeftPanelId =
  | 'loungeContent'
  | 'slayCamUploads'
  | 'newCollectible'
  | 'bawTrends'
  | 'communitySpotlight';

export type ReceptionRightPanelId =
  | 'hairAnalysisLab'
  | 'bawAtelier'
  | 'theLounge'
  | 'rewardsGallery'
  | 'slayCam';

export type ReceptionDashboardPanelId =
  | ReceptionLeftPanelId
  | ReceptionRightPanelId
  | 'featuredExperience';

export type ReceptionDashboardPanelRects = Record<ReceptionDashboardPanelId, FinalSceneHitRect>;

/** Tune panel alignment with `?receptionDashboardDebug=1`. */
const LEFT_COLUMN: FinalSceneHitRect = {
  left: 0.062,
  top: 0.128,
  width: 0.158,
  height: 0.748,
};

const RIGHT_COLUMN: FinalSceneHitRect = {
  left: 0.78,
  top: 0.128,
  width: 0.158,
  height: 0.748,
};

const CENTER_BILLBOARD: FinalSceneHitRect = {
  left: 0.248,
  top: 0.142,
  width: 0.504,
  height: 0.568,
};

const STACK_GAP_Y = 0.011;

function stackColumnRects(
  column: FinalSceneHitRect,
  count: number,
): FinalSceneHitRect[] {
  const gap = column.height * STACK_GAP_Y;
  const rowHeight = (column.height - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, index) => ({
    left: column.left,
    top: column.top + index * (rowHeight + gap),
    width: column.width,
    height: rowHeight,
  }));
}

function buildPanelRects(): ReceptionDashboardPanelRects {
  const left = stackColumnRects(LEFT_COLUMN, 5);
  const right = stackColumnRects(RIGHT_COLUMN, 5);

  return {
    loungeContent: left[0],
    slayCamUploads: left[1],
    newCollectible: left[2],
    bawTrends: left[3],
    communitySpotlight: left[4],
    featuredExperience: CENTER_BILLBOARD,
    hairAnalysisLab: right[0],
    bawAtelier: right[1],
    theLounge: right[2],
    rewardsGallery: right[3],
    slayCam: right[4],
  };
}

export const RECEPTION_DASHBOARD_PANEL_RECTS = buildPanelRects();

export function isReceptionDashboardDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('receptionDashboardDebug') === '1';
  } catch {
    return false;
  }
}
