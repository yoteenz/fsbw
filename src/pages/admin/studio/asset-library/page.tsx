import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioAssetCard } from '../../../../components/admin/studio/AdminStudioAssetCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioSearchInput } from '../../../../components/admin/studio/AdminStudioSearchInput';
import { AdminStudioFilterBar } from '../../../../components/admin/studio/AdminStudioFilterBar';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { useAdminStudioAssetLibrary } from '../../../../hooks/useAdminStudioAssetLibraryState';
import { getAdminStudioAssetCategoryLabel } from '../../../../utils/adminStudioAssetLibraryDemo';
import type { AdminStudioAssetCategoryId } from '../../../../utils/adminStudioAssetLibraryDemo';

export default function AdminStudioAssetLibraryPage() {
  const navigate = useNavigate();
  const {
    assets,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    selectedAsset,
    selectAsset,
    categories,
  } = useAdminStudioAssetLibrary();

  const filterItems: Array<{ id: AdminStudioAssetCategoryId | 'all'; label: string }> = [
    { id: 'all', label: 'ALL' },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <AdminStudioStageShell
      title="ASSET LIBRARY"
      subtitle="ENVIRONMENTS · AUDIO · MOTION · BRAND — SEARCHABLE CATALOG"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <AdminStudioSectionHeading>PRODUCTION VAULT</AdminStudioSectionHeading>

      <AdminStudioSearchInput value={search} onChange={setSearch} placeholder="SEARCH ASSETS..." />

      <AdminStudioFilterBar
        items={filterItems}
        activeId={categoryFilter}
        onChange={setCategoryFilter}
      />

      <p
        className="text-[7px] font-futura uppercase mb-3"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        {assets.length} ASSETS · DEMO CATALOG
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4 max-h-[200px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {assets.length === 0 ? (
          <p
            className="col-span-2 text-[8px] font-futura uppercase py-6 text-center"
            style={{ fontWeight: 515, color: '#9A9A9A' }}
          >
            NO ASSETS MATCH YOUR SEARCH
          </p>
        ) : (
          assets.map((asset) => (
            <AdminStudioAssetCard
              key={asset.id}
              asset={asset}
              isSelected={selectedAsset?.id === asset.id}
              onClick={() => selectAsset(asset)}
            />
          ))
        )}
      </div>

      {selectedAsset ? (
        <div
          className="p-3 space-y-2"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p
            className="text-[10px]"
            style={{
              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
              color: '#EB1C24',
            }}
          >
            {selectedAsset.name}
          </p>
          <p
            className="text-[7px] font-futura uppercase"
            style={{ fontWeight: 515, color: '#9A9A9A', lineHeight: 1.45 }}
          >
            {getAdminStudioAssetCategoryLabel(selectedAsset.categoryId)} · {selectedAsset.format}
            {selectedAsset.duration ? ` · ${selectedAsset.duration}` : ''}
          </p>
          <p
            className="text-[8px] font-futura uppercase"
            style={{ fontWeight: 515, color: '#FFFFFF', lineHeight: 1.45 }}
          >
            {selectedAsset.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedAsset.tags.map((tag) => (
              <span
                key={tag}
                className="text-[6px] font-futura uppercase px-1.5 py-0.5"
                style={{
                  fontWeight: 515,
                  color: selectedAsset.accentHex,
                  border: `1px solid ${selectedAsset.accentHex}44`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <AdminStudioDisclaimerFooter>DEMO ASSETS · NO UPLOAD · FRONTEND ONLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
