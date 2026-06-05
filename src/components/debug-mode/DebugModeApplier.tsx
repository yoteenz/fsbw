import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canAccessPageDebugMode } from '../../utils/adminAuth';
import {
  DEBUG_MODE_UPDATED_EVENT,
  getDebugPageConfig,
  stripDebugModeSuffix,
} from '../../utils/debugMode';
import { applyElementOverride, findElementByDebugId } from '../../utils/debugModeDomPath';

/** Apply saved page debug overrides on normal routes (founder-only preview). */
export function DebugModeApplier() {
  const location = useLocation();
  const pageKey = stripDebugModeSuffix(location.pathname);

  useEffect(() => {
    if (!canAccessPageDebugMode()) return;

    const apply = () => {
      const config = getDebugPageConfig(pageKey);
      if (!config?.elements) return;
      for (const [id, override] of Object.entries(config.elements)) {
        const el = findElementByDebugId(document.body, id);
        if (el instanceof HTMLElement) applyElementOverride(el, override);
      }
    };

    apply();
    const t1 = window.setTimeout(apply, 400);
    const t2 = window.setTimeout(apply, 1200);
    const onUpdated = () => apply();
    window.addEventListener(DEBUG_MODE_UPDATED_EVENT, onUpdated);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener(DEBUG_MODE_UPDATED_EVENT, onUpdated);
    };
  }, [pageKey]);

  return null;
}
