import { useCallback, useEffect, useState } from 'react';
import { computePsaProactiveNudge, type PsaProactiveNudge } from '../../utils/psaProactiveNudges';
import { PRODUCT_INVENTORY_UPDATED_EVENT } from '../../utils/productInventoryAvailability';

const REFRESH_EVENTS = [
  'signInStateChanged',
  'cartUpdated',
  'orderUpdated',
  'notificationsUpdated',
  PRODUCT_INVENTORY_UPDATED_EVENT,
  'wishlistStockAlertsUpdated',
] as const;

/** Recompute proactive FAB nudge when cart, orders, or alerts change. */
export function usePsaProactiveNudges(enabled: boolean) {
  const [nudge, setNudge] = useState<PsaProactiveNudge | null>(() =>
    enabled ? computePsaProactiveNudge() : null
  );

  const refresh = useCallback(() => {
    if (!enabled) {
      setNudge(null);
      return;
    }
    setNudge(computePsaProactiveNudge());
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setNudge(null);
      return;
    }
    refresh();
    for (const evt of REFRESH_EVENTS) {
      window.addEventListener(evt, refresh);
    }
    window.addEventListener('focus', refresh);
    const id = window.setInterval(refresh, 60_000);
    return () => {
      for (const evt of REFRESH_EVENTS) {
        window.removeEventListener(evt, refresh);
      }
      window.removeEventListener('focus', refresh);
      window.clearInterval(id);
    };
  }, [enabled, refresh]);

  return nudge;
}
