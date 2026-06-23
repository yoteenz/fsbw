import type { CSSProperties } from 'react';
import type { DesktopRoomTitlePlacement } from '../../constants/desktopRoomTitlePlacement';
import { getEffectiveDesktopRoomTitlePlacement } from '../../utils/desktopRoomTitlePlacementOverrides';
import { useDesktopRoomTitleDebugEnabled } from '../../utils/desktopRoomTitlePlacementDebug';
import { DesktopRoomTitleMetallicSvg } from './DesktopRoomTitleMetallicSvg';
import { DesktopRoomTitleDebugSquare } from './DesktopRoomTitleDebugSquare';
import { useDesktopRoomTitlePlacementEditor } from './DesktopRoomTitlePlacementEditorContext';
import './DesktopRoomTitle.css';

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
  const placement = editor
    ? editor.getPlacement(zoneId)
    : (placementProp ?? getEffectiveDesktopRoomTitlePlacement(zoneId));

  const hasTitle = title.trim().length > 0;
  const hasSubtitle = subtitle.trim().length > 0;

  if (!hasTitle && !hasSubtitle) return null;

  const anchorStyle = {
    '--desktop-room-title-top': `${placement.titleTopPct}%`,
    '--desktop-room-title-center-offset': `${placement.centerOffsetPct}%`,
    '--desktop-room-subtitle-gap': `calc(${placement.subtitleGapPx * 1.43} * 100vw / 1920 + 8px)`,
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

  const showDebugChrome = Boolean((editor?.editEnabled || debugEnabled) && editor?.profile);

  if (!showDebugChrome) {
    return (
      <div className="desktop-room-title" style={anchorStyle} aria-hidden>
        {labelBody}
      </div>
    );
  }

  return (
    <DesktopRoomTitleDebugSquare zoneId={zoneId} anchorStyle={anchorStyle}>
      <div className="desktop-room-title desktop-room-title--anchored-inner" aria-hidden>
        {labelBody}
      </div>
    </DesktopRoomTitleDebugSquare>
  );
}
