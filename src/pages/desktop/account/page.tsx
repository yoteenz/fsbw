import { useEffect, useRef, useState } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopPenthouseSuiteScene } from '../../../components/desktop-account/DesktopPenthouseSuiteScene';
import { getCurrentUser } from '../../../utils/adminAuth';
import { preloadDesktopRoomBackground } from '../../../utils/desktopRoomBackgroundCache';
import { DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL } from '../../../constants/desktopPenthouseSuite';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
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
        height: artboard ? '1080px' : '100vh',
        boxSizing: 'border-box',
        paddingTop: '68px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#0A0A0A',
      }}
    >
      <NavBar />
      <section ref={viewportRef} className="desktop-penthouse-suite-page__viewport">
        <DesktopPenthouseSuiteScene measureRef={viewportRef} user={userData} />
      </section>
    </div>
  );
}
