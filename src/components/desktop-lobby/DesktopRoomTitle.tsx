import type { CSSProperties } from 'react';
import type { DesktopRoomTitlePlacement } from '../../constants/desktopRoomTitlePlacement';
import { DESKTOP_ROOM_TITLE_DEFAULT_PLACEMENT } from '../../constants/desktopRoomTitlePlacement';
import './DesktopRoomTitle.css';

export type DesktopRoomTitleProps = {
  title: string;
  subtitle: string;
  placement?: DesktopRoomTitlePlacement;
};

export function DesktopRoomTitle({
  title,
  subtitle,
  placement = DESKTOP_ROOM_TITLE_DEFAULT_PLACEMENT,
}: DesktopRoomTitleProps) {
  const hasTitle = title.trim().length > 0;
  const hasSubtitle = subtitle.trim().length > 0;

  if (!hasTitle && !hasSubtitle) return null;

  const style = {
    '--desktop-room-title-top': `${placement.titleTopPct}%`,
    '--desktop-room-title-center-offset': `${placement.centerOffsetPct}%`,
    '--desktop-room-subtitle-gap': `calc(${placement.subtitleGapPx} * 100vw / 1920)`,
  } as CSSProperties;

  return (
    <div className="desktop-room-title" style={style} aria-hidden>
      {hasTitle ? <p className="desktop-room-title__title">{title}</p> : null}
      {hasSubtitle ? <p className="desktop-room-title__subtitle">{subtitle}</p> : null}
    </div>
  );
}
