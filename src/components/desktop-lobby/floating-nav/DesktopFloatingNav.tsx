import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FloatingNavBackdrop, FloatingNavTrigger } from './FloatingNavTrigger';
import { FloorNavDrawer } from './FloorNavDrawer';
import { RoomNavDrawer, useCurrentFloorHasRooms } from './RoomNavDrawer';
import { isDesktopPreviewActive, isMobileDesktopBypassActive } from '../../../utils/desktopPreview';
import './FloatingNavTrigger.css';

export type ActiveFloatingDrawer = 'floors' | 'rooms' | null;

export function DesktopFloatingNav() {
  const [activeDrawer, setActiveDrawer] = useState<ActiveFloatingDrawer>(null);
  const [mounted, setMounted] = useState(false);
  const hasRooms = useCurrentFloorHasRooms();

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeDrawer = useCallback(() => setActiveDrawer(null), []);

  const toggleFloors = useCallback(() => {
    setActiveDrawer((current) => (current === 'floors' ? null : 'floors'));
  }, []);

  const toggleRooms = useCallback(() => {
    setActiveDrawer((current) => (current === 'rooms' ? null : 'rooms'));
  }, []);

  useEffect(() => {
    if (!activeDrawer) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDrawer, closeDrawer]);

  useEffect(() => {
    if (!hasRooms && activeDrawer === 'rooms') {
      setActiveDrawer(null);
    }
  }, [activeDrawer, hasRooms]);

  if (!mounted) return null;

  const navContent = (
    <div className="floating-nav-system" aria-label="Tower navigation controls">
      {activeDrawer ? <FloatingNavBackdrop onClose={closeDrawer} /> : null}

      <div className="floating-nav-system__trigger floating-nav-system__trigger--floors">
        <FloatingNavTrigger
          kind="floors"
          isActive={activeDrawer === 'floors'}
          label="Open floor directory"
          onClick={toggleFloors}
        />
      </div>

      {hasRooms ? (
        <div className="floating-nav-system__trigger floating-nav-system__trigger--rooms">
          <FloatingNavTrigger
            kind="rooms"
            isActive={activeDrawer === 'rooms'}
            label="Open station directory"
            onClick={toggleRooms}
          />
        </div>
      ) : null}

      <FloorNavDrawer isOpen={activeDrawer === 'floors'} onClose={closeDrawer} />
      {hasRooms ? <RoomNavDrawer isOpen={activeDrawer === 'rooms'} onClose={closeDrawer} /> : null}
    </div>
  );

  /**
   * Live phone `/desktop/*` (scaled artboard, not the `/desktop-preview` designer tool):
   * render inline so the nav lives inside the transformed stage — it then scales and positions
   * with the artboard (bottom corners of the 1920×1080 frame) instead of sticking to the device
   * viewport via a body portal. `position: fixed` resolves against the transformed stage, so it
   * anchors to the artboard corners and is not clipped by intermediate overflow.
   */
  if (isMobileDesktopBypassActive() && !isDesktopPreviewActive()) {
    return navContent;
  }

  return createPortal(navContent, document.body);
}
