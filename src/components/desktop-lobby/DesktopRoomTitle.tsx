import type { CSSProperties, RefObject } from 'react';
import type { DesktopRoomTitlePlacement } from '../../constants/desktopRoomTitlePlacement';
import { getEffectiveDesktopRoomTitlePlacement } from '../../utils/desktopRoomTitlePlacementOverrides';
import {
  useDesktopRoomTitleDebugEnabled,
  useDesktopRoomTitleEditEnabled,
  useDesktopRoomTitleViewportProfile,
} from '../../utils/desktopRoomTitlePlacementDebug';
import {
  desktopRoomCoverSubtitleGapPx,
  desktopRoomCoverTypography,
  mapDesktopRoomTitlePlacementToContainer,
} from '../../utils/desktopRoomCoverLayout';
import { useDesktopRoomCoverMeasure } from '../../hooks/useDesktopRoomCoverMeasure';
import { DesktopRoomTitleMetallicSvg } from './DesktopRoomTitleMetallicSvg';
import { DesktopRoomTitleDebugSquare } from './DesktopRoomTitleDebugSquare';
import { useDesktopRoomTitlePlacementEditor } from './DesktopRoomTitlePlacementEditorContext';
import './DesktopRoomTitle.css';

/** Scales placement row-gap with room label type size (1.43 base × 1.15 type bump). */
const DESKTOP_ROOM_SUBTITLE_GAP_SCALE = 1.43 * 1.15;

export type DesktopRoomTitleProps = {
  zoneId: string;
  title: string;
  subtitle: string;
  placement?: DesktopRoomTitlePlacement;
  /** Scene layer that matches the cover background box (`DesktopZoneRoomScene` layer ref). */
  measureRef: RefObject<HTMLElement | null>;
};

export function DesktopRoomTitle({
  zoneId,
  title,
  subtitle,
  placement: placementProp,
  measureRef,
}: DesktopRoomTitleProps) {
  const editor = useDesktopRoomTitlePlacementEditor();
  const debugEnabled = useDesktopRoomTitleDebugEnabled();
  const editEnabledHook = useDesktopRoomTitleEditEnabled();
  const profileHook = useDesktopRoomTitleViewportProfile();
  const { width, height } = useDesktopRoomCoverMeasure(measureRef);

  const placement = editor
    ? editor.getPlacement(zoneId)
    : (placementProp ?? getEffectiveDesktopRoomTitlePlacement(zoneId));

  const hasTitle = title.trim().length > 0;
  const hasSubtitle = subtitle.trim().length > 0;

  if (!hasTitle && !hasSubtitle) return null;

  const mapped =
    width > 0 && height > 0
      ? mapDesktopRoomTitlePlacementToContainer(placement, width, height)
      : { leftPct: 50 + placement.centerOffsetPct, topPct: placement.titleTopPct };

  const typography =
    width > 0 && height > 0
      ? desktopRoomCoverTypography(width, height)
      : {
          coverScale: 1,
          titleFontPx: 79,
          subtitleFontPx: 30,
          titleMaxWidthPx: 1400,
        };

  const scaledSubtitleGapPx =
    width > 0 && height > 0
      ? desktopRoomCoverSubtitleGapPx(placement, width, height, DESKTOP_ROOM_SUBTITLE_GAP_SCALE)
      : placement.subtitleGapPx * DESKTOP_ROOM_SUBTITLE_GAP_SCALE;

  const anchorStyle = {
    '--desktop-room-title-left': `${mapped.leftPct}%`,
    '--desktop-room-title-top': `${mapped.topPct}%`,
    '--desktop-room-subtitle-gap': `${scaledSubtitleGapPx}px`,
    '--desktop-room-title-font-size': `${typography.titleFontPx}px`,
    '--desktop-room-subtitle-font-size': `${typography.subtitleFontPx}px`,
    '--desktop-room-title-max-width': `${typography.titleMaxWidthPx}px`,
  } as CSSProperties;

  const flexStyle = {
    '--desktop-room-subtitle-gap': `${scaledSubtitleGapPx}px`,
  } as CSSProperties;

  const labelBody = (
    <>
      {hasTitle ? (
        <div className="desktop-room-title__line desktop-room-title__line--title">
          <div className="desktop-room-title__foil-slot" aria-hidden>
            <DesktopRoomTitleMetallicSvg text={title} />
          </div>
        </div>
      ) : null}
      {hasSubtitle ? (
        <div
          className={`desktop-room-title__line desktop-room-title__line--subtitle${
            hasTitle ? '' : ' desktop-room-title__line--subtitle-only'
          }`}
        >
          <p className="desktop-room-title__subtitle">{subtitle}</p>
        </div>
      ) : null}
    </>
  );

  const showDebugChrome = Boolean(
    ((editor?.editEnabled ?? editEnabledHook) || debugEnabled) && (editor?.profile ?? profileHook),
  );

  if (!showDebugChrome) {
    return (
      <div className="desktop-room-title" style={{ ...anchorStyle, ...flexStyle }} aria-hidden>
        {labelBody}
      </div>
    );
  }

  return (
    <DesktopRoomTitleDebugSquare
      zoneId={zoneId}
      measureRef={measureRef}
      anchorStyle={anchorStyle}
    >
      <div
        className="desktop-room-title desktop-room-title--anchored-inner"
        style={flexStyle}
        aria-hidden
      >
        {labelBody}
      </div>
    </DesktopRoomTitleDebugSquare>
  );
}
