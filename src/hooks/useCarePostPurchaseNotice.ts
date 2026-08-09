import { useMemo } from 'react';
import type { CarePurchaseProfile } from '../content/education/types';

const STORAGE_KEY = 'lounge_care_post_purchase_seen_v1';

/** Future post-purchase moment: "YOUR CARE LIBRARY IS READY" — data hook only. */
export function useCarePostPurchaseNotice(profiles: CarePurchaseProfile[]) {
  return useMemo(() => {
    if (!profiles.length) return { ready: false as const, unseenCount: 0 };

    let seenKeys: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      seenKeys = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      seenKeys = [];
    }

    const seenSet = new Set(seenKeys);
    const unseen = profiles.filter((p) => p.status === 'active' && !seenSet.has(p.orderLineKey));

    return {
      ready: unseen.length > 0,
      unseenCount: unseen.length,
      markSeen: () => {
        const next = new Set(seenKeys);
        profiles.forEach((p) => {
          if (p.status === 'active') next.add(p.orderLineKey);
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
      },
    };
  }, [profiles]);
}

/** Product/order surfaces can deep-link into Care for a purchase profile. */
export function careRouteForPurchase(profile: CarePurchaseProfile): string {
  const params = new URLSearchParams({
    care: 'library',
    product: profile.baseUnitId ?? profile.productName.toLowerCase(),
  });
  return `/lounge?${params.toString()}`;
}
