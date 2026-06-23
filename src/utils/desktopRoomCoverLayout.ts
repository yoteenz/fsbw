import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import type { DesktopRoomTitlePlacement } from '../constants/desktopRoomTitlePlacement';
import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
  DESKTOP_ROOM_SUBTITLE_DESIGN_FONT_MAX_PX,
  DESKTOP_ROOM_SUBTITLE_DESIGN_FONT_MIN_PX,
  DESKTOP_ROOM_SUBTITLE_DESIGN_FONT_PX,
  DESKTOP_ROOM_TITLE_DESIGN_FONT_MAX_PX,
  DESKTOP_ROOM_TITLE_DESIGN_FONT_MIN_PX,
  DESKTOP_ROOM_TITLE_DESIGN_FONT_PX,
} from '../constants/desktopRoomHeroArt';
import { mapImagePointToCoverContainer, mapImageRectToCoverContainer } from './sceneCoverHitMap';

export type DesktopRoomCoverImageSpace = {
  width: number;
  height: number;
};

export const DEFAULT_DESKTOP_ROOM_COVER_IMAGE: DesktopRoomCoverImageSpace = {
  width: DESKTOP_ROOM_HERO_ART_WIDTH,
  height: DESKTOP_ROOM_HERO_ART_HEIGHT,
};

/** `object-fit: cover` + `center top` scale for desktop room heroes. */
export function getDesktopRoomCoverScale(
  containerWidth: number,
  containerHeight: number,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): number {
  if (containerWidth <= 0 || containerHeight <= 0) return 1;
  return Math.max(containerWidth / image.width, containerHeight / image.height);
}

export function getDesktopRoomCoverRenderedSize(
  containerWidth: number,
  containerHeight: number,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): { width: number; height: number; offsetX: number; offsetY: number } {
  const scale = getDesktopRoomCoverScale(containerWidth, containerHeight, image);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    width,
    height,
    offsetX: (containerWidth - width) / 2,
    offsetY: 0,
  };
}

/** Normalized image point (0–1) → normalized container point under cover + center top. */
export function mapDesktopRoomImagePointToContainer(
  point: { x: number; y: number },
  containerWidth: number,
  containerHeight: number,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): { left: number; top: number } {
  return mapImagePointToCoverContainer(
    point,
    containerWidth,
    containerHeight,
    image.width,
    image.height,
  );
}

/** Inverse: normalized container point → normalized image point. */
export function mapDesktopRoomContainerPointToImage(
  point: { left: number; top: number },
  containerWidth: number,
  containerHeight: number,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): { x: number; y: number } {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { x: point.left, y: point.top };
  }

  const scale = getDesktopRoomCoverScale(containerWidth, containerHeight, image);
  const renderedW = image.width * scale;
  const offsetX = (containerWidth - renderedW) / 2;

  const containerX = point.left * containerWidth;
  const containerY = point.top * containerHeight;

  return {
    x: (containerX - offsetX) / (image.width * scale),
    y: containerY / (image.height * scale),
  };
}

/** Screen-pixel delta on the container → delta in normalized image space. */
export function desktopRoomContainerPixelDeltaToImageNormalized(
  dxPx: number,
  dyPx: number,
  containerWidth: number,
  containerHeight: number,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): { dx: number; dy: number } {
  const scale = getDesktopRoomCoverScale(containerWidth, containerHeight, image);
  const renderedScale = image.width * scale;
  const renderedHeight = image.height * scale;
  if (renderedScale <= 0 || renderedHeight <= 0) return { dx: 0, dy: 0 };
  return {
    dx: dxPx / renderedScale,
    dy: dyPx / renderedHeight,
  };
}

export function placementToImageAnchorPoint(placement: DesktopRoomTitlePlacement): { x: number; y: number } {
  return {
    x: 0.5 + placement.centerOffsetPct / 100,
    y: placement.titleTopPct / 100,
  };
}

export function mapDesktopRoomTitlePlacementToContainer(
  placement: DesktopRoomTitlePlacement,
  containerWidth: number,
  containerHeight: number,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): { leftPct: number; topPct: number } {
  const mapped = mapDesktopRoomImagePointToContainer(
    placementToImageAnchorPoint(placement),
    containerWidth,
    containerHeight,
    image,
  );
  return { leftPct: mapped.left * 100, topPct: mapped.top * 100 };
}

export function mapDesktopRoomImageRectToContainer(
  rect: FinalSceneHitRect,
  containerWidth: number,
  containerHeight: number,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): FinalSceneHitRect {
  return mapImageRectToCoverContainer(
    rect,
    containerWidth,
    containerHeight,
    image.width,
    image.height,
  );
}

function clampPx(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function desktopRoomCoverTypography(
  containerWidth: number,
  containerHeight: number,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): {
  coverScale: number;
  titleFontPx: number;
  subtitleFontPx: number;
  titleMaxWidthPx: number;
} {
  const coverScale = getDesktopRoomCoverScale(containerWidth, containerHeight, image);
  const rendered = getDesktopRoomCoverRenderedSize(containerWidth, containerHeight, image);

  return {
    coverScale,
    titleFontPx: clampPx(
      DESKTOP_ROOM_TITLE_DESIGN_FONT_PX * coverScale,
      DESKTOP_ROOM_TITLE_DESIGN_FONT_MIN_PX,
      DESKTOP_ROOM_TITLE_DESIGN_FONT_MAX_PX,
    ),
    subtitleFontPx: clampPx(
      DESKTOP_ROOM_SUBTITLE_DESIGN_FONT_PX * coverScale,
      DESKTOP_ROOM_SUBTITLE_DESIGN_FONT_MIN_PX,
      DESKTOP_ROOM_SUBTITLE_DESIGN_FONT_MAX_PX,
    ),
    titleMaxWidthPx: Math.round(rendered.width * 0.92),
  };
}

export function desktopRoomCoverSubtitleGapPx(
  placement: DesktopRoomTitlePlacement,
  containerWidth: number,
  containerHeight: number,
  gapScale = 1,
  image: DesktopRoomCoverImageSpace = DEFAULT_DESKTOP_ROOM_COVER_IMAGE,
): number {
  const coverScale = getDesktopRoomCoverScale(containerWidth, containerHeight, image);
  return placement.subtitleGapPx * gapScale * coverScale;
}
