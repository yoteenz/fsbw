import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './base/LoadingScreen';
import { isPremiumMemberForGatedFeatures } from '../utils/premiumMemberAccess';
import { isSupabaseConfigured } from '../utils/supabase';
import { syncAllFromApi } from '../utils/syncFromApi';
import { DESKTOP_PENTHOUSE_PATH } from '../constants/desktopFloors';
import { DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID } from '../constants/desktopLobbyPanorama';
import { buildDesktopElevatorHref } from '../constants/desktopNavQuickRoutes';

const DESKTOP_BREAKPOINT = 1024;
const DESKTOP_ENTRY = buildDesktopElevatorHref(DESKTOP_PENTHOUSE_PATH, DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID);

function isDesktop(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;
}

function homeLandingPath(): '/lobby' | '/home/shop' {
  return isPremiumMemberForGatedFeatures() ? '/lobby' : '/home/shop';
}

/**
 * `/` and index route — desktop → penthouse showroom; mobile premium → /lobby; mobile guest → /home/shop.
 */
export default function HomeLandingRedirect() {
  const [target, setTarget] = useState<string | '/lobby' | '/home/shop' | null>(() => {
    if (typeof window === 'undefined') return null;
    if (isDesktop()) return DESKTOP_ENTRY;
    if (localStorage.getItem('isSignedIn') !== 'true') return '/home/shop';
    return homeLandingPath();
  });

  useEffect(() => {
    if (isDesktop()) {
      setTarget(DESKTOP_ENTRY);
      return;
    }

    if (localStorage.getItem('isSignedIn') !== 'true') {
      setTarget('/home/shop');
      return;
    }

    let cancelled = false;
    const run = async () => {
      if (isSupabaseConfigured()) {
        try {
          await syncAllFromApi();
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;
      setTarget(homeLandingPath());
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) return <LoadingScreen />;
  return <Navigate to={target} replace />;
}
