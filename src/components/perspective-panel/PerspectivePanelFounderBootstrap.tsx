import { useEffect } from 'react';
import { canAccessPageDebugMode } from '../../utils/adminAuth';
import {
  fetchAndMergePerspectivePanelConfigFromCloud,
  notifyPerspectivePanelMapUpdated,
} from '../../utils/perspectivePanelSync';

/** Pull perspective panel map from Supabase when founder is signed in. */
export function PerspectivePanelFounderBootstrap() {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!canAccessPageDebugMode()) return;
      await fetchAndMergePerspectivePanelConfigFromCloud();
      if (!cancelled) notifyPerspectivePanelMapUpdated();
    };

    void run();

    const onAuth = () => {
      void run();
    };
    window.addEventListener('signInStateChanged', onAuth);
    window.addEventListener('focus', onAuth);

    return () => {
      cancelled = true;
      window.removeEventListener('signInStateChanged', onAuth);
      window.removeEventListener('focus', onAuth);
    };
  }, []);

  return null;
}
