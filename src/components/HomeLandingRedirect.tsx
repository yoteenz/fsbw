import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './base/LoadingScreen';
import { DESKTOP_PENTHOUSE_PATH } from '../constants/desktopFloors';
import { DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID } from '../constants/desktopLobbyPanorama';
import { buildDesktopElevatorHref } from '../constants/desktopNavQuickRoutes';

const DESKTOP_BREAKPOINT = 1024;
const DESKTOP_ENTRY = buildDesktopElevatorHref(DESKTOP_PENTHOUSE_PATH, DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID);
const MOBILE_ENTRY = '/lobby';

function isDesktop(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;
}

/**
 * `/` and index route — desktop → penthouse showroom; mobile → /lobby (lobby landing carousel).
 */
export default function HomeLandingRedirect() {
  const [target, setTarget] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    if (isDesktop()) return DESKTOP_ENTRY;
    return MOBILE_ENTRY;
  });

  useEffect(() => {
    setTarget(isDesktop() ? DESKTOP_ENTRY : MOBILE_ENTRY);
  }, []);

  if (!target) return <LoadingScreen source="HomeLandingRedirect" />;
  return <Navigate to={target} replace />;
}
