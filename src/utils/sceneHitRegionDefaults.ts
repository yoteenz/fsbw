import {
  FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX,
  FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX,
  LOUNGE_TV_BAKED_HIT_LAYOUT,
  LOUNGE_TV_PLAY_TAP_LAYOUT,
} from '../constants/finalLobbySceneAssets';
import {
  LOBBY_DISPLAY_CASE_HIT_LAYOUT,
  LOBBY_DISPLAY_CASE_LAYOUT_OFFSET,
} from '../constants/lobbyDisplayCaseLayout';
import { LOUNGE_TV_MENU_SCREEN_LAYOUT } from '../constants/loungeTvSceneLayout';
import type { SceneHitLayoutOptions } from './sceneHitLayout';

export type SceneHitRegionId =
  | 'lounge-tv-baked'
  | 'lounge-tv-content-popup'
  | 'lounge-tv-play-tap'
  | 'lobby-display-case';

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
  'lobby-display-case',
];

export const SCENE_HIT_REGION_LABELS: Record<SceneHitRegionId, string> = {
  'lounge-tv-baked': 'Blue — baked TV',
  'lounge-tv-content-popup': 'Magenta — content pop-up',
  'lounge-tv-play-tap': 'Green — play tap',
  'lobby-display-case': 'Orange — display case',
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
    case 'lobby-display-case':
      return {
        coverOffset: { x: LOBBY_DISPLAY_CASE_LAYOUT_OFFSET.x, y: LOBBY_DISPLAY_CASE_LAYOUT_OFFSET.y },
        layout: cloneLayout(LOBBY_DISPLAY_CASE_HIT_LAYOUT),
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
