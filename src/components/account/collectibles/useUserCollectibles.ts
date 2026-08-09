import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../utils/api';
import type {
  EducationCertification,
  EducationCollectibleDefinition,
  UserCollectible,
} from '../../../content/education/types';
import { trackEducationHierarchyEvent } from '../../lounge/education/educationHierarchyAnalytics';

export type CollectibleGalleryItem = UserCollectible & {
  definition?: EducationCollectibleDefinition;
  certification?: EducationCertification;
};

export type CollectiblesStats = {
  totalCollectibles: number;
  certificationsEarned: number;
  seasonsCompleted: number;
};

export type CollectiblesFilter = 'all' | 'certifications' | 'rewards' | 'slay-challenge' | 'special';

type CollectiblesResponse = {
  items: CollectibleGalleryItem[];
  certifications: EducationCertification[];
  stats: CollectiblesStats;
};

export function useUserCollectibles() {
  const [items, setItems] = useState<CollectibleGalleryItem[]>([]);
  const [certifications, setCertifications] = useState<EducationCertification[]>([]);
  const [stats, setStats] = useState<CollectiblesStats>({
    totalCollectibles: 0,
    certificationsEarned: 0,
    seasonsCompleted: 0,
  });
  const [filter, setFilter] = useState<CollectiblesFilter>('all');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/collectibles');
      if (res.status === 401 || !res.ok) {
        setItems([]);
        setCertifications([]);
        return null;
      }
      const data = (await res.json()) as CollectiblesResponse;
      setItems(data.items ?? []);
      setCertifications(data.certifications ?? []);
      setStats(data.stats ?? { totalCollectibles: 0, certificationsEarned: 0, seasonsCompleted: 0 });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'certifications') {
      return items.filter((i) => i.sourceType === 'education' || i.definition?.type === 'season-certification');
    }
    if (filter === 'slay-challenge') return items.filter((i) => i.sourceType === 'slay-challenge');
    if (filter === 'rewards') return items.filter((i) => i.sourceType === 'reward');
    if (filter === 'special') return items.filter((i) => i.sourceType === 'special' || i.sourceType === 'promotion');
    return items;
  }, [filter, items]);

  const latestUnlock = items[0] ?? null;

  const changeFilter = (next: CollectiblesFilter) => {
    setFilter(next);
    trackEducationHierarchyEvent('collectible_filter_changed', { filter: next });
  };

  return {
    items: filteredItems,
    allItems: items,
    certifications,
    stats,
    filter,
    setFilter: changeFilter,
    latestUnlock,
    loading,
    refresh,
  };
}
