import { type ReactNode, useEffect } from 'react';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_CTRL_ROOM_DESKTOP_BG_FILE } from '../../config/site00-auth-assets';
import { CtrlRoomSidebar } from './CtrlRoomSidebar';
import { CtrlRoomHeader } from './CtrlRoomHeader';
import { Site00MobileShell } from '../mobile/Site00MobileShell';

type CtrlRoomShellProps = {
  children: ReactNode;
};

const ctrlRoomBgUrl = resolveSite00PublicAsset(SITE00_CTRL_ROOM_DESKTOP_BG_FILE);

export function CtrlRoomShell({ children }: CtrlRoomShellProps) {
  useEffect(() => {
    if (!ctrlRoomBgUrl) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = ctrlRoomBgUrl;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="site00-ctrl-room-shell">
      <div className="site00-ctrl-room-shell__desktop" style={{ ['--site00-ctrl-room-bg' as string]: `url(${ctrlRoomBgUrl})` }}>
        <CtrlRoomSidebar />
        <div className="site00-ctrl-room-shell__main">
          <CtrlRoomHeader />
          <div className="site00-ctrl-room-shell__content">{children}</div>
        </div>
      </div>

      <div className="site00-ctrl-room-shell__mobile">
        <Site00MobileShell activeNav="origin" showEnvironmentBackground={false} shellClassName="site00-ctrl-room-mobile-shell">
          <div className="site00-ctrl-room-mobile">
            <CtrlRoomHeader />
            <div className="site00-ctrl-room-mobile__content">{children}</div>
          </div>
        </Site00MobileShell>
      </div>
    </div>
  );
}
