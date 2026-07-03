import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioAssetCard } from '../../../../components/admin/studio/AdminStudioAssetCard';
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

  return (
    <AdminStudioStageShell
      title="ASSET LIBRARY"
      subtitle="ENVIRONMENTS · AUDIO · MOTION · BRAND — SEARCHABLE CATALOG"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <p
        className="text-lg mb-3"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: '#EB1C24',
        }}
      >
        PRODUCTION VAULT
      </p>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="SEARCH ASSETS..."
        className="w-full bg-white/5 border border-white/15 text-white text-[9px] font-futura uppercase px-3 py-2.5 outline-none focus:border-white/40 placeholder:text-white/25 mb-3"
        style={{ fontWeight: 515 }}
      />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className="flex-shrink-0 px-2 py-1 text-[6px] font-futura uppercase whitespace-nowrap"
          style={{
            fontWeight: 515,
            color: categoryFilter === 'all' ? '#FFFFFF' : '#9A9A9A',
            background: categoryFilter === 'all' ? 'rgba(235,28,36,0.25)' : 'rgba(255,255,255,0.04)',
            borderBottom: categoryFilter === 'all' ? '2px solid #EB1C24' : '2px solid transparent',
          }}
        >
          ALL
        </button>
        {categories.map((cat) => {
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id as AdminStudioAssetCategoryId)}
              className="flex-shrink-0 px-2 py-1 text-[6px] font-futura uppercase whitespace-nowrap"
              style={{
                fontWeight: 515,
                color: isActive ? '#FFFFFF' : '#9A9A9A',
                background: isActive ? 'rgba(235,28,36,0.25)' : 'rgba(255,255,255,0.04)',
                borderBottom: isActive ? '2px solid #EB1C24' : '2px solid transparent',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

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

      <p
        className="mt-4 text-[7px] font-futura uppercase text-center"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        DEMO ASSETS · NO UPLOAD · FRONTEND ONLY
      </p>
    </AdminStudioStageShell>
  );
}
