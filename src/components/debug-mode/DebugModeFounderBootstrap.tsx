import { useEffect, useState } from 'react';
import { canAccessPageDebugMode } from '../../utils/adminAuth';
import { fetchAndMergePageDebugConfigFromCloud, notifyPageDebugOverridesUpdated } from '../../utils/debugModeSync';

/** Pull page debug overrides from Supabase when founder is signed in. */
export function DebugModeFounderBootstrap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!canAccessPageDebugMode()) {
        setReady(true);
        return;
      }
      await fetchAndMergePageDebugConfigFromCloud();
      notifyPageDebugOverridesUpdated();
      if (!cancelled) setReady(true);
    };
    void run();

    const onAuth = () => {
      void run();
    };
    window.addEventListener('signInStateChanged', onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener('signInStateChanged', onAuth);
    };
  }, []);

  void ready;
  return null;
}
