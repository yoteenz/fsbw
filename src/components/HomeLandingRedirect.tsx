import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './base/LoadingScreen';
import { isPremiumMemberForGatedFeatures } from '../utils/premiumMemberAccess';
import { isSupabaseConfigured } from '../utils/supabase';
import { syncAllFromApi } from '../utils/syncFromApi';

const DESKTOP_BREAKPOINT = 1024;

function isDesktop(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= DESKTOP_BREAKPOINT;
}

function homeLandingPath(): '/lobby' | '/home/shop' {
  return isPremiumMemberForGatedFeatures() ? '/lobby' : '/home/shop';
}

/**
 * `/` and index route — desktop → /desktop/penthouse; mobile premium → /lobby; mobile guest → /home/shop.
 */
export default function HomeLandingRedirect() {
  const [target, setTarget] = useState<'/desktop/penthouse' | '/lobby' | '/home/shop' | null>(() => {
    if (typeof window === 'undefined') return null;
    if (isDesktop()) return '/desktop/penthouse';
    if (localStorage.getItem('isSignedIn') !== 'true') return '/home/shop';
    return homeLandingPath();
  });

  useEffect(() => {
    if (isDesktop()) {
      setTarget('/desktop/penthouse');
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
