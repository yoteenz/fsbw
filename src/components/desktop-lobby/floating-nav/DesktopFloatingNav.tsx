import { useCallback, useEffect, useState } from 'react';
import { FloatingNavBackdrop, FloatingNavTrigger } from './FloatingNavTrigger';
import { FloorNavDrawer } from './FloorNavDrawer';
import { RoomNavDrawer, useCurrentFloorHasRooms } from './RoomNavDrawer';
import './FloatingNavTrigger.css';

export type ActiveFloatingDrawer = 'floors' | 'rooms' | null;

export function DesktopFloatingNav() {
  const [activeDrawer, setActiveDrawer] = useState<ActiveFloatingDrawer>(null);
  const hasRooms = useCurrentFloorHasRooms();

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

  return (
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
            label="Open room directory"
            onClick={toggleRooms}
          />
        </div>
      ) : null}

      <FloorNavDrawer isOpen={activeDrawer === 'floors'} onClose={closeDrawer} />
      {hasRooms ? <RoomNavDrawer isOpen={activeDrawer === 'rooms'} onClose={closeDrawer} /> : null}
    </div>
  );
}
