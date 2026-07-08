import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStudioWarehouse } from '../../../../hooks/useAdminStudioWarehouseState';
import { WAREHOUSE_DISTRICTS } from '../../../../studio-os-core/studio-warehouse';
import { STUDIO_WAREHOUSE_SUBTITLE } from '../../../../utils/adminStudioWarehouseDemo';
import { adminStudioAssetRegistryPath } from '../../../../utils/adminStudioRoutes';
import { WarehouseAssetCard, WarehouseDistrictHeader, WarehouseMetaGrid } from './WarehousePanels';
import { WAREHOUSE_STYLES, whSectionTitle } from './warehouseTheme';

const VIEW_TABS = [
  { id: 'districts' as const, label: 'DISTRICTS' },
  { id: 'recipe' as const, label: 'SCENE RECIPE™' },
  { id: 'marketplace' as const, label: 'MARKETPLACE IMPORT' },
  { id: 'search' as const, label: 'SEARCH' },
];

const MARKETPLACE_IMPORT_OPTIONS = [
  'Import Entire Workspace™',
  'Only Lighting',
  'Only Furniture',
  'Only Materials',
  'Only Environment',
  'Only Atmosphere',
  'Everything',
];

export function WarehouseWorkspace() {
  const navigate = useNavigate();
  const wh = useAdminStudioWarehouse();

  const activeDistrict = useMemo(
    () => WAREHOUSE_DISTRICTS.find((d) => d.id === wh.activeDistrictId),
    [wh.activeDistrictId]
  );

  const displayAssets =
    wh.viewMode === 'search' && wh.searchQuery.trim()
      ? wh.searchResults.map((r) => r.asset)
      : wh.districtAssets;

  return (
    <div className="wh-root">
      <style>{WAREHOUSE_STYLES}</style>

      <header className="wh-hero">
        <p className="wh-hero__title">Studio Warehouse™</p>
        <p className="wh-hero__sub">{STUDIO_WAREHOUSE_SUBTITLE}</p>
        <p className="wh-hero__sub" style={{ marginTop: 6, opacity: 0.5 }}>
          {wh.snapshot.totalAssets} objects on floor · Asset Registry™ physical layer
        </p>
        <div className="wh-tabs">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`wh-tab${wh.viewMode === tab.id ? ' is-active' : ''}`}
              onClick={() => wh.setViewMode(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button type="button" className="wh-tab" onClick={() => navigate(adminStudioAssetRegistryPath())}>
            ASSET REGISTRY™ →
          </button>
        </div>
      </header>

      <input
        className="wh-search"
        placeholder='Try: "white marble headquarters" · "Story Table" · "unused furniture"'
        value={wh.searchQuery}
        onChange={(e) => {
          wh.setSearchQuery(e.target.value);
          if (e.target.value.trim()) wh.setViewMode('search');
        }}
        aria-label="Natural language warehouse search"
      />

      {wh.applyNotice ? (
        <p
          className="wh-hero__sub"
          style={{ marginTop: 4, color: '#c9a962', fontSize: 6 }}
          role="status"
        >
          {wh.applyNotice}
          <button
            type="button"
            className="wh-action"
            style={{ marginLeft: 8, fontSize: 5 }}
            onClick={() => wh.clearApplyNotice()}
          >
            Dismiss
          </button>
        </p>
      ) : null}

      {wh.viewMode === 'recipe' ? (
        <section className="wh-recipe">
          <p style={whSectionTitle}>Scene Recipe™ — How workspaces are assembled</p>
          {wh.sceneRecipes.map((recipe) => (
            <div key={recipe.workspaceId} style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a962' }}>
                {recipe.workspaceName}
              </p>
              <p style={{ fontSize: 4, opacity: 0.5, marginBottom: 6 }}>{recipe.department}</p>
              <p style={{ fontSize: 5, opacity: 0.7, marginBottom: 4 }}>Built From</p>
              {recipe.ingredients.map((ing) => (
                <div key={`${recipe.workspaceId}-${ing.role}`} className="wh-recipe__row">
                  <span>{ing.role}</span>
                  <span style={{ textAlign: 'right' }}>
                    {ing.assetName} <span style={{ opacity: 0.5 }}>{ing.version}</span>
                  </span>
                  <button
                    type="button"
                    className="wh-action"
                    onClick={() =>
                      wh.openReplaceFlow({
                        workspaceId: recipe.workspaceId,
                        workspaceName: recipe.workspaceName,
                        slotRole: ing.role,
                        currentAssetId: ing.assetId,
                      })
                    }
                  >
                    Replace
                  </button>
                </div>
              ))}
            </div>
          ))}
        </section>
      ) : null}

      {wh.viewMode === 'marketplace' ? (
        <section className="wh-recipe">
          <p style={whSectionTitle}>Marketplace → Warehouse Import</p>
          <p style={{ fontSize: 5, opacity: 0.6, marginBottom: 8, lineHeight: 1.5 }}>
            Purchased assets appear naturally inside Studio Warehouse™. Choose what to import.
          </p>
          <div className="wh-marketplace-grid">
            {MARKETPLACE_IMPORT_OPTIONS.map((opt) => (
              <button key={opt} type="button" className="wh-action" style={{ padding: '8px 10px', fontSize: 5 }}>
                {opt}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {(wh.viewMode === 'districts' || wh.viewMode === 'search') && (
        <div className="wh-layout">
          <div>
            {wh.viewMode === 'districts' ? (
              <nav className="wh-district-nav" aria-label="Warehouse districts">
                {WAREHOUSE_DISTRICTS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`wh-district-btn${wh.activeDistrictId === d.id ? ' is-active' : ''}`}
                    onClick={() => {
                      wh.setActiveDistrictId(d.id);
                      wh.setViewMode('districts');
                    }}
                  >
                    {d.icon} {d.label}
                  </button>
                ))}
              </nav>
            ) : (
              <p style={{ ...whSectionTitle, marginBottom: 8 }}>
                Search · {wh.searchResults.length} matches
              </p>
            )}

            <div className={`wh-district-stage ${activeDistrict?.layoutClass ?? ''}`}>
              {wh.viewMode === 'districts' ? <WarehouseDistrictHeader districtId={wh.activeDistrictId} /> : null}
              <div className="wh-asset-grid">
                {displayAssets.map((asset) => (
                  <WarehouseAssetCard
                    key={asset.id}
                    asset={asset}
                    selected={wh.selectedAssetId === asset.id}
                    onSelect={() => wh.setSelectedAssetId(asset.id)}
                  />
                ))}
              </div>
              {displayAssets.length === 0 ? (
                <p style={{ fontSize: 5, opacity: 0.5, marginTop: 12 }}>No objects in this aisle — generate via Stack, they arrive here automatically.</p>
              ) : null}
            </div>

            {wh.recommendations.length > 0 ? (
              <div style={{ marginTop: 10 }}>
                <p style={whSectionTitle}>Smart Recommendations · Company Genome™</p>
                {wh.recommendations.map((rec) => {
                  const asset = wh.catalog.find((a) => a.id === rec.assetId);
                  if (!asset) return null;
                  return (
                    <div key={rec.assetId} className="wh-recommend">
                      <p style={{ color: '#c9a962', marginBottom: 4 }}>{asset.name}</p>
                      {rec.reasons.map((r) => (
                        <p key={r}>✓ {r}</p>
                      ))}
                      <button
                        type="button"
                        className="wh-action"
                        style={{ marginTop: 4 }}
                        onClick={() => wh.setSelectedAssetId(rec.assetId)}
                      >
                        Preview · Use Existing
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <aside className="wh-inspector">
            {wh.selectedAsset ? (
              <>
                <p style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a962' }}>
                  {wh.selectedAsset.name}
                </p>
                {wh.recommendReuseFor(wh.selectedAsset) ? (
                  <div className="wh-reuse-banner">
                    Compatible assets exist — recommend reuse. Generate New only when you need something unique.
                  </div>
                ) : null}
                <div className="wh-preview-stage">
                  <div
                    className="wh-preview-object"
                    style={{
                      ...(wh.selectedAsset.previewUrl
                        ? { backgroundImage: `url(${wh.selectedAsset.previewUrl})` }
                        : { background: wh.selectedAsset.previewGradient }),
                      transform: `rotateY(${wh.previewRotation}deg) scale(${wh.previewZoom})`,
                    }}
                  />
                </div>
                <div className="wh-preview-controls">
                  <button type="button" className="wh-action" onClick={() => wh.rotatePreview(-15)}>
                    Rotate ←
                  </button>
                  <button type="button" className="wh-action" onClick={() => wh.rotatePreview(15)}>
                    Rotate →
                  </button>
                  <button type="button" className="wh-action" onClick={() => wh.zoomPreview(0.1)}>
                    Zoom +
                  </button>
                  <button type="button" className="wh-action" onClick={() => wh.zoomPreview(-0.1)}>
                    Zoom −
                  </button>
                  <button type="button" className="wh-action" onClick={wh.resetPreview}>
                    Reset
                  </button>
                </div>
                <div className="wh-preview-controls">
                  <button
                    type="button"
                    className="wh-action"
                    onClick={() => wh.toggleFavorite(wh.selectedAsset!.id)}
                  >
                    {wh.selectedAsset.favorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <button type="button" className="wh-action">
                    Duplicate
                  </button>
                  <button type="button" className="wh-action">
                    Gen Variation
                  </button>
                  <button
                    type="button"
                    className="wh-action"
                    onClick={() => wh.archiveAsset(wh.selectedAsset!.id)}
                  >
                    Archive
                  </button>
                  <button
                    type="button"
                    className="wh-action"
                    disabled={!wh.selectedAsset?.previewUrl}
                    title={
                      wh.selectedAsset?.previewUrl
                        ? 'Mount on Creative Direction Scene Stack without FAL'
                        : 'Pipeline-registered assets only — demo seeds have no stored image URL'
                    }
                    onClick={() => wh.applySelectedAssetToSceneStack()}
                  >
                    Use Existing
                  </button>
                </div>
                <WarehouseMetaGrid asset={wh.selectedAsset} />
              </>
            ) : (
              <p style={{ fontSize: 5, opacity: 0.55, lineHeight: 1.5 }}>
                Select an object on the warehouse floor to rotate, zoom, compare, and apply — no folders, no file paths.
              </p>
            )}
          </aside>
        </div>
      )}

      {wh.replaceContext ? (
        <div className="wh-modal" role="dialog" aria-label="Replace workflow">
          <div className="wh-modal__card">
            <p style={whSectionTitle}>Replace Workflow™</p>
            <p style={{ fontSize: 5, marginBottom: 8, lineHeight: 1.5 }}>
              {wh.replaceContext.workspaceName} · {wh.replaceContext.slotRole}
              <br />
              Browse Studio Warehouse™ → Filter Compatible → Live Preview → Apply (no regeneration)
            </p>
            <div className="wh-asset-grid" style={{ marginBottom: 10 }}>
              {wh.replaceCandidates.slice(0, 8).map((asset) => (
                <WarehouseAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={wh.selectedAssetId === asset.id}
                  onSelect={() => wh.setSelectedAssetId(asset.id)}
                />
              ))}
            </div>
            <div className="wh-preview-controls">
              <button
                type="button"
                className="wh-action"
                disabled={!wh.selectedAssetId}
                onClick={() => wh.selectedAssetId && wh.applyReplacement(wh.selectedAssetId)}
              >
                Apply Selection
              </button>
              <button type="button" className="wh-action" onClick={() => wh.setReplaceContext(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
