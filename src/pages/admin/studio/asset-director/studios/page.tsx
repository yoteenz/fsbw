import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetDirectorGalleryBrowser } from '../../../../../components/admin/studio/asset-director/AssetDirectorGalleryBrowser';
import { AssetDirectorQuickPreviewModal } from '../../../../../components/admin/studio/asset-director/AssetDirectorVisualPrimitives';
import { useAdminStudioAssetDirector, useAdminStudioAssetDirectorBrowser } from '../../../../../hooks/useAdminStudioAssetDirectorState';
import {
  filterGalleryItems,
  listAssetDirectorGalleryItems,
  searchGalleryItems,
} from '../../../../../utils/adminStudioAssetDirectorVisual';

export default function AdminStudioAssetDirectorStudiosPage() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, viewMode, setViewMode, favorites } = useAdminStudioAssetDirector();
  const browser = useAdminStudioAssetDirectorBrowser();

  const items = useMemo(() => {
    let list = filterGalleryItems(listAssetDirectorGalleryItems('studios'), browser.activeFilter, favorites);
    return searchGalleryItems(list, searchQuery);
  }, [browser.activeFilter, favorites, searchQuery]);

  return (
    <AdminStudioStageShell
      title="STUDIOS"
      subtitle="GALLERY VIEW — EVERY VIRTUAL ENVIRONMENT"
      breadcrumbParentLabel="ASSET DIRECTOR"
      breadcrumbParentPath="/admin/studio/asset-director"
      onBack={() => navigate('/admin/studio/asset-director')}
      navGroupId="visuals"
      hideNavTabs
    >
      <AssetDirectorGalleryBrowser
        items={items}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFilter={browser.activeFilter}
        onFilterChange={browser.setActiveFilter}
        selectedIds={browser.selectedIds}
        onToggleSelect={browser.toggleSelect}
        onItemClick={(item) => navigate(item.route)}
        onQuickPreview={(item) =>
          browser.setQuickPreview({
            id: item.id,
            name: item.name,
            previewSrc: item.previewSrc,
            status: item.status,
            resolution: '3840×1600',
            version: item.version,
            accentHex: item.accentHex,
          })
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBulkAction={browser.bulkAction}
      />
      <AssetDirectorQuickPreviewModal item={browser.quickPreview} onClose={() => browser.setQuickPreview(null)} />
      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
