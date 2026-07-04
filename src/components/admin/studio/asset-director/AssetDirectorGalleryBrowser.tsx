import { AdminHubTabBar } from '../../AdminHubTabBar';
import { AdminStudioAssetDirectorCard } from '../AdminStudioAssetDirectorCard';
import type { AssetDirectorViewMode, GalleryBrowseItem } from '../../../../utils/adminStudioAssetDirectorVisual';
import { ASSET_DIRECTOR_BULK_ACTIONS, ASSET_DIRECTOR_FILTER_OPTIONS } from '../../../../utils/adminStudioAssetDirectorVisual';
import { AD_VISUAL, adActionBtnStyle, adCaptionStyle } from './assetDirectorVisualTheme';

type AssetDirectorGalleryBrowserProps = {
  items: GalleryBrowseItem[];
  viewMode: AssetDirectorViewMode;
  onViewModeChange: (mode: AssetDirectorViewMode) => void;
  activeFilter: string;
  onFilterChange: (filter: (typeof ASSET_DIRECTOR_FILTER_OPTIONS)[number]['id']) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onItemClick: (item: GalleryBrowseItem) => void;
  onQuickPreview: (item: GalleryBrowseItem) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onBulkAction: (action: string) => void;
};

export function AssetDirectorGalleryBrowser({
  items,
  viewMode,
  onViewModeChange,
  activeFilter,
  onFilterChange,
  selectedIds,
  onToggleSelect,
  onItemClick,
  onQuickPreview,
  searchQuery,
  onSearchChange,
  onBulkAction,
}: AssetDirectorGalleryBrowserProps) {
  const viewTabs = [
    { id: 'gallery' as const, label: 'GALLERY' },
    { id: 'list' as const, label: 'LIST' },
  ];

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="SEARCH ASSET · STUDIO · TALENT · PROJECT · TAGS…"
        className="w-full mb-3 bg-white border border-black text-black px-3 py-2 outline-none"
        style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', borderWidth: '1.3px' }}
      />

      <AdminHubTabBar tabs={viewTabs} activeTab={viewMode} onTabChange={onViewModeChange} fontSize="10px" />

      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {ASSET_DIRECTOR_FILTER_OPTIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            style={{
              ...adActionBtnStyle,
              fontSize: '8px',
              color: activeFilter === f.id ? '#FFF' : AD_VISUAL.red,
              background: activeFilter === f.id ? AD_VISUAL.red : '#FFF',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {selectedIds.length > 0 ? (
        <div className="mb-3 p-2 border border-black bg-white" style={{ borderWidth: '1.3px' }}>
          <p style={{ ...adCaptionStyle, fontSize: '9px', marginBottom: '6px' }}>{selectedIds.length} SELECTED</p>
          <div className="flex flex-wrap gap-1">
            {ASSET_DIRECTOR_BULK_ACTIONS.map((action) => (
              <button key={action} type="button" onClick={() => onBulkAction(action)} style={{ ...adActionBtnStyle, fontSize: '8px' }}>
                {action}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {viewMode === 'gallery' ? (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <label className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-white/90 px-1">
                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onToggleSelect(item.id)} />
              </label>
              <AdminStudioAssetDirectorCard asset={item} onClick={() => onItemClick(item)} />
              <button
                type="button"
                onClick={() => onQuickPreview(item)}
                className="absolute top-2 right-2 z-20 px-1.5 py-0.5 bg-white/95 border"
                style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: AD_VISUAL.red, borderWidth: '1px' }}
              >
                QUICK VIEW
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.id} className="flex gap-2 items-center bg-white border border-gray-200 p-2">
              <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onToggleSelect(item.id)} />
              <button type="button" onClick={() => onQuickPreview(item)} className="flex-shrink-0 w-12 h-12 overflow-hidden border" style={{ borderWidth: '1px' }}>
                <img src={item.previewSrc} alt="" className="w-full h-full object-cover" />
              </button>
              <button type="button" onClick={() => onItemClick(item)} className="flex-1 text-left min-w-0">
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: AD_VISUAL.red }}>{i + 1}. {item.name}</p>
                <p style={adCaptionStyle}>{item.category} · {item.version}</p>
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p style={{ ...adCaptionStyle, textAlign: 'center', padding: '24px' }}>NO ASSETS MATCH THIS FILTER.</p>
      ) : null}
    </div>
  );
}
