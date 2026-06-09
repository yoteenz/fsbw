import {
  FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX,
  FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX,
  LOUNGE_TV_BAKED_HIT_LAYOUT,
  LOUNGE_TV_PLAY_TAP_LAYOUT,
} from '../constants/finalLobbySceneAssets';
import {
  LOBBY_CASE_PROP_PHONE_LAYOUT_OFFSET,
  LOBBY_CASE_PROP_REGISTER_LAYOUT_OFFSET,
} from '../constants/finalLobbyCasePropOverlays';
import {
  LOBBY_DISPLAY_CASE_HIT_LAYOUT,
  LOBBY_DISPLAY_CASE_LAYOUT_OFFSET,
} from '../constants/lobbyDisplayCaseLayout';
import { LOUNGE_TV_MENU_SCREEN_LAYOUT } from '../constants/loungeTvSceneLayout';
import {
  LOUNGE_TV_WATCH_LEARN_VIDEO_MAX_HEIGHT_EXTRA_PX,
  LOUNGE_TV_WATCH_LEARN_VIDEO_WIDTH_EXTRA_PX,
} from '../components/lounge/loungeTvAssets';
import type { SceneHitLayoutOptions } from './sceneHitLayout';

const LOUNGE_TV_MEDIA_PANEL_DEFAULT = {} as const satisfies SceneHitLayoutOptions;

const LOUNGE_TV_VIDEO_FRAME_DEFAULT = {
  layoutWidthExtraPx: LOUNGE_TV_WATCH_LEARN_VIDEO_WIDTH_EXTRA_PX,
  layoutHeightExtraPx: LOUNGE_TV_WATCH_LEARN_VIDEO_MAX_HEIGHT_EXTRA_PX,
  layoutScale: { x: 1, y: 1 },
} as const satisfies SceneHitLayoutOptions;

export type SceneHitRegionId =
  | 'lounge-tv-baked'
  | 'lounge-tv-content-popup'
  | 'lounge-tv-play-tap'
  | 'lounge-tv-media-panel'
  | 'lounge-tv-video-frame'
  | 'lobby-display-case'
  | 'lobby-display-case-register'
  | 'lobby-display-case-phone';

export type SceneHitCoverOffset = { x: number; y: number };

export type SceneHitRegionConfig = {
  coverOffset?: SceneHitCoverOffset;
  screenOffset?: SceneHitCoverOffset;
  layout: SceneHitLayoutOptions;
};

export const SCENE_HIT_REGION_IDS: SceneHitRegionId[] = [
  'lounge-tv-baked',
  'lounge-tv-content-popup',
  'lounge-tv-play-tap',
  'lounge-tv-media-panel',
  'lounge-tv-video-frame',
  'lobby-display-case',
  'lobby-display-case-register',
  'lobby-display-case-phone',
];

export const SCENE_HIT_REGION_LABELS: Record<SceneHitRegionId, string> = {
  'lounge-tv-baked': 'Blue — baked TV',
  'lounge-tv-content-popup': 'Magenta — content pop-up (glass)',
  'lounge-tv-play-tap': 'Green — play tap',
  'lounge-tv-media-panel': 'Yellow — TV media panel (open)',
  'lounge-tv-video-frame': 'Cyan — Watch+Learn video (open)',
  'lobby-display-case': 'Orange — display case',
  'lobby-display-case-register': 'Cyan — register',
  'lobby-display-case-phone': 'Yellow — phone',
};

function cloneLayout(layout: SceneHitLayoutOptions): SceneHitLayoutOptions {
  return {
    ...layout,
    ...(layout.layoutScale
      ? { layoutScale: { x: layout.layoutScale.x, y: layout.layoutScale.y } }
      : {}),
  };
}

/** Code defaults — overridden by saved localStorage tuning when present. */
export function getDefaultSceneHitRegionConfig(id: SceneHitRegionId): SceneHitRegionConfig {
  switch (id) {
    case 'lounge-tv-baked':
      return { layout: cloneLayout(LOUNGE_TV_BAKED_HIT_LAYOUT) };
    case 'lounge-tv-content-popup':
      return { layout: cloneLayout(LOUNGE_TV_MENU_SCREEN_LAYOUT) };
    case 'lounge-tv-play-tap':
      return {
        screenOffset: {
          x: FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX,
          y: FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX,
        },
        layout: cloneLayout(LOUNGE_TV_PLAY_TAP_LAYOUT),
      };
    case 'lounge-tv-media-panel':
      return { layout: cloneLayout(LOUNGE_TV_MEDIA_PANEL_DEFAULT) };
    case 'lounge-tv-video-frame':
      return { layout: cloneLayout(LOUNGE_TV_VIDEO_FRAME_DEFAULT) };
    case 'lobby-display-case':
      return {
        coverOffset: { x: LOBBY_DISPLAY_CASE_LAYOUT_OFFSET.x, y: LOBBY_DISPLAY_CASE_LAYOUT_OFFSET.y },
        layout: cloneLayout(LOBBY_DISPLAY_CASE_HIT_LAYOUT),
      };
    case 'lobby-display-case-register':
      return {
        coverOffset: {
          x: LOBBY_CASE_PROP_REGISTER_LAYOUT_OFFSET.x,
          y: LOBBY_CASE_PROP_REGISTER_LAYOUT_OFFSET.y,
        },
        layout: {},
      };
    case 'lobby-display-case-phone':
      return {
        coverOffset: {
          x: LOBBY_CASE_PROP_PHONE_LAYOUT_OFFSET.x,
          y: LOBBY_CASE_PROP_PHONE_LAYOUT_OFFSET.y,
        },
        layout: {},
      };
    default:
      return { layout: {} };
  }
}

export function getAllDefaultSceneHitRegionConfigs(): Record<SceneHitRegionId, SceneHitRegionConfig> {
  return SCENE_HIT_REGION_IDS.reduce(
    (acc, id) => {
      acc[id] = getDefaultSceneHitRegionConfig(id);
      return acc;
    },
    {} as Record<SceneHitRegionId, SceneHitRegionConfig>,
  );
}
