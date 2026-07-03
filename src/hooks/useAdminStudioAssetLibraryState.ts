import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_DEFAULT_ASSETS,
  ADMIN_STUDIO_ASSET_CATEGORIES,
  type AdminStudioAsset,
  type AdminStudioAssetCategoryId,
} from '../utils/adminStudioAssetLibraryDemo';

export function useAdminStudioAssetLibrary() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AdminStudioAssetCategoryId | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ADMIN_STUDIO_DEFAULT_ASSETS.filter((asset) => {
      if (categoryFilter !== 'all' && asset.categoryId !== categoryFilter) return false;
      if (!q) return true;
      const haystack = [
        asset.name,
        asset.description,
        asset.format,
        asset.tags.join(' '),
        ADMIN_STUDIO_ASSET_CATEGORIES.find((c) => c.id === asset.categoryId)?.label ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [search, categoryFilter]);

  const selectedAsset = useMemo(
    () => filteredAssets.find((a) => a.id === selectedId) ?? filteredAssets[0] ?? null,
    [filteredAssets, selectedId]
  );

  const selectAsset = useCallback((asset: AdminStudioAsset) => {
    setSelectedId(asset.id);
  }, []);

  return {
    assets: filteredAssets,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    selectedAsset,
    selectAsset,
    categories: ADMIN_STUDIO_ASSET_CATEGORIES,
  };
}
