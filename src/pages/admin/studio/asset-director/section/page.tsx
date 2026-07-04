import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAssetDirectorCard } from '../../../../../components/admin/studio/AdminStudioAssetDirectorCard';
import { AssetDirectorGalleryBrowser } from '../../../../../components/admin/studio/asset-director/AssetDirectorGalleryBrowser';
import { AssetDirectorQuickPreviewModal, AssetDirectorSectionBlock } from '../../../../../components/admin/studio/asset-director/AssetDirectorVisualPrimitives';
import { useAdminStudioAssetDirector, useAdminStudioAssetDirectorBrowser } from '../../../../../hooks/useAdminStudioAssetDirectorState';
import {
  getAssetDirectorSectionById,
  getAssetDirectorSectionCards,
  ASSET_DIRECTOR_MOODBOARDS,
  ASSET_DIRECTOR_RELATIONSHIPS,
  ASSET_DIRECTOR_VERSION_HISTORY,
  ASSET_DIRECTOR_HEALTH_QUEUE,
  ASSET_HEALTH_LABELS,
  type AssetDirectorSectionId,
} from '../../../../../utils/adminStudioAssetDirectorDemo';
import {
  filterGalleryItems,
  listAssetDirectorGalleryItems,
  searchGalleryItems,
} from '../../../../../utils/adminStudioAssetDirectorVisual';
import { AD_VISUAL, adCaptionStyle } from '../../../../../components/admin/studio/asset-director/assetDirectorVisualTheme';

const VALID_SECTIONS = new Set<string>([
  'wardrobe', 'expressions', 'poses', 'camera', 'lighting', 'materials',
  'props', 'animations', 'audio', 'moodboards', 'brand-materials',
  'relationships', 'version-history', 'asset-health',
]);

const GALLERY_KIND: Partial<Record<AssetDirectorSectionId, 'wardrobe' | 'props' | 'materials'>> = {
  wardrobe: 'wardrobe',
  props: 'props',
  materials: 'materials',
};

export default function AdminStudioAssetDirectorSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, viewMode, setViewMode, favorites } = useAdminStudioAssetDirector();
  const browser = useAdminStudioAssetDirectorBrowser();

  if (!sectionId || !VALID_SECTIONS.has(sectionId)) {
    return <Navigate to="/admin/studio/asset-director" replace />;
  }

  const section = getAssetDirectorSectionById(sectionId);
  const cards = getAssetDirectorSectionCards(sectionId as AssetDirectorSectionId);
  const galleryKind = GALLERY_KIND[sectionId as AssetDirectorSectionId];

  const galleryItems = useMemo(() => {
    if (!galleryKind) return [];
    let list = filterGalleryItems(listAssetDirectorGalleryItems(galleryKind), browser.activeFilter, favorites);
    return searchGalleryItems(list, searchQuery);
  }, [galleryKind, browser.activeFilter, favorites, searchQuery]);

  if (!section) {
    return <Navigate to="/admin/studio/asset-director" replace />;
  }

  return (
    <AdminStudioStageShell
      title={section.title}
      subtitle={section.description}
      breadcrumbParentLabel="ASSET DIRECTOR"
      breadcrumbParentPath="/admin/studio/asset-director"
      onBack={() => navigate('/admin/studio/asset-director')}
      navGroupId="visuals"
      hideNavTabs
    >
      {galleryKind ? (
        <AssetDirectorGalleryBrowser
          items={galleryItems}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeFilter={browser.activeFilter}
          onFilterChange={browser.setActiveFilter}
          selectedIds={browser.selectedIds}
          onToggleSelect={browser.toggleSelect}
          onItemClick={() => undefined}
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
          onBulkAction={browser.bulkAction}
        />
      ) : null}

      {sectionId === 'moodboards' ? (
        <AssetDirectorSectionBlock title="MOODBOARDS" subtitle="PINTEREST-STYLE MASONRY">
          <div className="columns-2 gap-2">
            {ASSET_DIRECTOR_MOODBOARDS.flatMap((board) =>
              board.images.map((img) => (
                <div key={img.id} className="break-inside-avoid mb-2 border overflow-hidden" style={{ borderWidth: '1px', borderColor: '#e5e7eb' }}>
                  <img src={img.src} alt="" className="w-full object-cover" style={{ aspectRatio: img.id.endsWith('1') ? '3/4' : '1/1' }} />
                  <p style={{ ...adCaptionStyle, fontSize: '8px', padding: '4px' }}>{board.title} · {img.caption}</p>
                </div>
              ))
            )}
          </div>
        </AssetDirectorSectionBlock>
      ) : null}

      {sectionId === 'relationships' ? (
        <AssetDirectorSectionBlock title="RELATIONSHIPS">
          <div className="grid grid-cols-2 gap-2">
            {ASSET_DIRECTOR_RELATIONSHIPS.map((rel) => (
              <div key={rel.assetId} className="border bg-white overflow-hidden" style={{ borderWidth: '1.3px' }}>
                <div className="p-2" style={{ background: AD_VISUAL.glass }}>
                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.red }}>{rel.assetName}</p>
                  <p style={adCaptionStyle}>{rel.category}</p>
                </div>
                <div className="p-2 grid grid-cols-2 gap-1">
                  {rel.usedBy.map((u) => (
                    <div key={u} className="border p-1 text-center" style={{ borderColor: '#e5e7eb' }}>
                      <p style={{ ...adCaptionStyle, fontSize: '8px' }}>{u}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AssetDirectorSectionBlock>
      ) : null}

      {sectionId === 'version-history' ? (
        <AssetDirectorSectionBlock title="VERSION TIMELINE">
          {ASSET_DIRECTOR_VERSION_HISTORY.map((entry, i) => (
            <div key={entry.id} className="flex flex-col items-center">
              {i > 0 ? <span style={adCaptionStyle}>↓</span> : null}
              <div className="w-full border p-2 mb-1 bg-white flex gap-2" style={{ borderWidth: '1.3px' }}>
                <div className="w-14 h-10 bg-gray-100 flex-shrink-0" />
                <div>
                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}>{entry.version}</p>
                  <p style={{ ...adCaptionStyle, fontSize: '9px' }}>{entry.changedAt} · {entry.changeSummary}</p>
                </div>
              </div>
            </div>
          ))}
        </AssetDirectorSectionBlock>
      ) : null}

      {sectionId === 'asset-health' ? (
        <AssetDirectorSectionBlock title="ASSET HEALTH">
          <div className="grid grid-cols-2 gap-2">
            {ASSET_DIRECTOR_HEALTH_QUEUE.map((entry) => (
              <div key={entry.assetId} className="border overflow-hidden" style={{ borderWidth: '1.3px', borderLeft: `3px solid ${entry.priority === 'high' ? AD_VISUAL.red : '#CA8A04'}` }}>
                <img src="/assets/NOIR/noir-thumb.png" alt="" className="w-full aspect-video object-cover opacity-90" />
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', padding: '6px' }}>{entry.assetName}</p>
                <p style={{ ...adCaptionStyle, fontSize: '8px', padding: '0 6px 6px' }}>
                  {entry.indicators.map((ind) => ASSET_HEALTH_LABELS[ind]).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </AssetDirectorSectionBlock>
      ) : null}

      {cards.length > 0 && !galleryKind && sectionId !== 'materials' ? (
        <AssetDirectorSectionBlock title={section.title}>
          <div className="grid grid-cols-2 gap-2">
            {cards.map((asset) => (
              <AdminStudioAssetDirectorCard key={asset.id} asset={asset} />
            ))}
          </div>
        </AssetDirectorSectionBlock>
      ) : null}

      <AssetDirectorQuickPreviewModal item={browser.quickPreview} onClose={() => browser.setQuickPreview(null)} />
      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
