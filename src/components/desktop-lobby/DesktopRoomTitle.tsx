import { useSyncExternalStore, type CSSProperties } from 'react';
import type { DesktopRoomTitlePlacement } from '../../constants/desktopRoomTitlePlacement';
import { getEffectiveDesktopRoomTitlePlacement } from '../../utils/desktopRoomTitlePlacementOverrides';
import { useDesktopRoomTitleDebugEnabled, useDesktopRoomTitleEditEnabled, useDesktopRoomTitleViewportProfile } from '../../utils/desktopRoomTitlePlacementDebug';
import { DESKTOP_PREVIEW_VIEWPORT_WIDTH, getDesktopLayoutViewportWidth, isDesktopArtboardLayoutActive } from '../../utils/desktopPreview';
import { DesktopRoomTitleMetallicSvg } from './DesktopRoomTitleMetallicSvg';
import { DesktopRoomTitleDebugSquare } from './DesktopRoomTitleDebugSquare';
import { useDesktopRoomTitlePlacementEditor } from './DesktopRoomTitlePlacementEditorContext';
import './DesktopRoomTitle.css';

/** Scales placement row-gap with room label type size (1.43 base × 1.15 type bump). */
const DESKTOP_ROOM_SUBTITLE_GAP_SCALE = 1.43 * 1.15;

/** Extra space between red foil title and black subtitle (not scaled with placement editor). */
const DESKTOP_ROOM_SUBTITLE_BOOST_PX = 0;

export type DesktopRoomTitleProps = {
  zoneId: string;
  title: string;
  subtitle: string;
  placement?: DesktopRoomTitlePlacement;
};

export function DesktopRoomTitle({
  zoneId,
  title,
  subtitle,
  placement: placementProp,
}: DesktopRoomTitleProps) {
  const editor = useDesktopRoomTitlePlacementEditor();
  const debugEnabled = useDesktopRoomTitleDebugEnabled();
  const editEnabledHook = useDesktopRoomTitleEditEnabled();
  const profileHook = useDesktopRoomTitleViewportProfile();
  const layoutWidth = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('resize', onStoreChange);
      return () => window.removeEventListener('resize', onStoreChange);
    },
    () => getDesktopLayoutViewportWidth(),
    () => DESKTOP_PREVIEW_VIEWPORT_WIDTH,
  );
  const placement = editor
    ? editor.getPlacement(zoneId)
    : (placementProp ?? getEffectiveDesktopRoomTitlePlacement(zoneId));

  const hasTitle = title.trim().length > 0;
  const hasSubtitle = subtitle.trim().length > 0;

  if (!hasTitle && !hasSubtitle) return null;

  const scaledSubtitleGapPx = (placement.subtitleGapPx * DESKTOP_ROOM_SUBTITLE_GAP_SCALE * layoutWidth) / 1920;
  const artboardScale =
    typeof window !== 'undefined' && isDesktopArtboardLayoutActive()
      ? window.innerWidth / DESKTOP_PREVIEW_VIEWPORT_WIDTH
      : 1;
  const subtitleBoostPx = DESKTOP_ROOM_SUBTITLE_BOOST_PX / artboardScale;

  const anchorStyle = {
    '--desktop-room-title-top': `${placement.titleTopPct}%`,
    '--desktop-room-title-center-offset': `${placement.centerOffsetPct}%`,
  } as CSSProperties;

  const flexStyle = {
    '--desktop-room-subtitle-gap': `${scaledSubtitleGapPx}px`,
    '--desktop-room-subtitle-boost': `${subtitleBoostPx}px`,
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
    <DesktopRoomTitleDebugSquare zoneId={zoneId} anchorStyle={anchorStyle}>
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
