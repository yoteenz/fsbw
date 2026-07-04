import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ASSET_DIRECTOR_GALLERY_SECTIONS,
  filterGalleryItems,
  getStudioVisualBundle,
  listAssetDirectorGalleryItems,
  searchGalleryItems,
} from '../../../../utils/adminStudioAssetDirectorVisual';
import { ASSET_DIRECTOR_STUDIOS } from '../../../../utils/adminStudioAssetDirectorDemo';
import { useAdminStudioAssetDirector, useAdminStudioAssetDirectorBrowser } from '../../../../hooks/useAdminStudioAssetDirectorState';
import { AssetDirectorGalleryBrowser } from './AssetDirectorGalleryBrowser';
import { AssetDirectorHeroPreview, AssetDirectorActionNotice, AssetDirectorQuickPreviewModal } from './AssetDirectorVisualPrimitives';
import { AD_VISUAL, adCaptionStyle, adSectionTitleStyle } from './assetDirectorVisualTheme';

/** Visual-first Asset Director hub — gallery department, not settings. */
export function AssetDirectorHubDashboard() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, viewMode, setViewMode, favorites } = useAdminStudioAssetDirector();
  const browser = useAdminStudioAssetDirectorBrowser();
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const dismissNotice = useCallback(() => setActionNotice(null), []);

  const featured = getStudioVisualBundle('ad-studio-weather');
  const allItems = useMemo(() => listAssetDirectorGalleryItems('all'), []);
  const filtered = useMemo(() => {
    let list = filterGalleryItems(allItems, browser.activeFilter, favorites);
    list = searchGalleryItems(list, searchQuery);
    return list;
  }, [allItems, browser.activeFilter, favorites, searchQuery]);

  return (
    <div>
      {featured ? (
        <button
          type="button"
          onClick={() => navigate('/admin/studio/asset-director/studios/ad-studio-weather')}
          className="w-full text-left mb-4"
        >
          <p style={adSectionTitleStyle}>FEATURED STUDIO</p>
          <AssetDirectorHeroPreview src={featured.heroSrc} label={featured.studio.name} type={featured.heroType} />
        </button>
      ) : null}

      <p style={{ ...adCaptionStyle, marginBottom: '10px' }}>
        VISUAL DEPARTMENT — BROWSE · INSPECT · COMPARE · MANAGE
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {ASSET_DIRECTOR_GALLERY_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => navigate(section.route)}
            className="relative overflow-hidden border border-black text-left"
            style={{ aspectRatio: '16 / 10', borderWidth: '1.3px' }}
          >
            <img src={ASSET_DIRECTOR_STUDIOS[0]?.previewSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(255,255,255,0.92) 0%, transparent 60%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.red }}>{section.label}</p>
              <p style={{ ...adCaptionStyle, fontSize: '9px' }}>{section.count} ASSETS</p>
            </div>
          </button>
        ))}
      </div>

      <AssetDirectorGalleryBrowser
        items={filtered.slice(0, 12)}
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
            resolution: '1920×1080',
            version: item.version,
            accentHex: item.accentHex,
          })
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBulkAction={(action) => {
          browser.bulkAction(action);
          setActionNotice(`${action} · ${browser.selectedIds.length} SELECTED`);
        }}
      />

      <p style={{ ...adCaptionStyle, marginTop: '12px', fontSize: '9px' }}>
        PLACEHOLDER ASSETS ONLY · VISUALS FIRST · METADATA AT BOTTOM ON DETAIL PAGES
      </p>

      <AssetDirectorQuickPreviewModal
        item={browser.quickPreview}
        onClose={() => browser.setQuickPreview(null)}
      />
      <AssetDirectorActionNotice message={actionNotice} onDismiss={dismissNotice} />
    </div>
  );
}
