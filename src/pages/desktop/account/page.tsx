import { useEffect, useRef, useState } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopPenthouseSuiteScene } from '../../../components/desktop-account/DesktopPenthouseSuiteScene';
import { getCurrentUser } from '../../../utils/adminAuth';
import { preloadDesktopRoomBackground } from '../../../utils/desktopRoomBackgroundCache';
import { DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL } from '../../../constants/desktopPenthouseSuite';
import { DESKTOP_ROOM_SHELL_BACKGROUND } from '../../../constants/desktopRoomHeroArt';
import {
  DESKTOP_PREVIEW_VIEWPORT_HEIGHT,
  isDesktopArtboardLayoutActive,
} from '../../../utils/desktopPreview';
import '../../../components/desktop-account/DesktopPenthouseSuiteScene.css';
import '../../../components/desktop-lobby/panel-text/DesktopPanelTextOverlay.css';

export default function DesktopAccountPage() {
  const viewportRef = useRef<HTMLElement>(null);
  const artboard = isDesktopArtboardLayoutActive();
  const [userData, setUserData] = useState(() => getCurrentUser());

  useEffect(() => {
    void preloadDesktopRoomBackground(DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL);
  }, []);

  useEffect(() => {
    const syncUser = () => setUserData(getCurrentUser());
    syncUser();
    window.addEventListener('signInStateChanged', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('signInStateChanged', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  return (
    <div
      className={`desktop-penthouse-suite-page${artboard ? ' desktop-penthouse-suite-page--artboard' : ''}`}
      style={{
        height: artboard ? `${DESKTOP_PREVIEW_VIEWPORT_HEIGHT}px` : '100dvh',
        boxSizing: 'border-box',
        paddingTop: '68px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: DESKTOP_ROOM_SHELL_BACKGROUND,
        position: 'relative',
      }}
    >
      <NavBar />
      <section
        ref={viewportRef}
        className="desktop-penthouse-suite-page__viewport"
        style={{
          position: 'relative',
          flex: artboard ? 'none' : 1,
          height: artboard ? '1012px' : undefined,
          minHeight: artboard ? '1012px' : 0,
          overflow: 'hidden',
          background: DESKTOP_ROOM_SHELL_BACKGROUND,
        }}
      >
        <DesktopPenthouseSuiteScene measureRef={viewportRef} user={userData} />
      </section>
    </div>
  );
}
