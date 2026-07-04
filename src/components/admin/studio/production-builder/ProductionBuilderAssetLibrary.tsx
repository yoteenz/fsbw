import { useState } from 'react';
import type { ProductionAssetCategoryId } from '../../../../utils/adminStudioProductionBuilderDemo';
import {
  getProductionAssetLibrary,
  PRODUCTION_ASSET_CATEGORIES,
} from '../../../../utils/adminStudioProductionBuilderDemo';
import { PB_VISUAL, pbCaptionStyle, pbPanelStyle, pbSectionTitleStyle } from './productionBuilderTheme';

type ProductionBuilderAssetLibraryProps = {
  onAssetDragStart: (category: ProductionAssetCategoryId, assetId: string) => void;
};

export function ProductionBuilderAssetLibrary({ onAssetDragStart }: ProductionBuilderAssetLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<ProductionAssetCategoryId>('studios');
  const library = getProductionAssetLibrary();
  const assets = library[activeCategory] ?? [];

  return (
    <aside className="flex flex-col min-h-0 h-full" style={{ ...pbPanelStyle, padding: '10px' }}>
      <p style={pbSectionTitleStyle}>PRODUCTION ASSETS</p>
      <p style={{ ...pbCaptionStyle, marginBottom: '8px' }}>DRAG INTO SCENE BUILDER</p>

      <div className="flex flex-wrap gap-1 mb-3 max-h-24 overflow-y-auto">
        {PRODUCTION_ASSET_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '7px',
              padding: '4px 6px',
              border: activeCategory === cat.id ? `1.3px solid ${PB_VISUAL.red}` : PB_VISUAL.border,
              background: activeCategory === cat.id ? '#FFF5F5' : '#FFFFFF',
              color: activeCategory === cat.id ? PB_VISUAL.red : PB_VISUAL.black,
              cursor: 'pointer',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-pb-asset', JSON.stringify({ category: asset.category, assetId: asset.id }));
                onAssetDragStart(asset.category, asset.id);
              }}
              className="cursor-grab active:cursor-grabbing overflow-hidden"
              style={{ border: PB_VISUAL.border, background: '#FFFFFF' }}
            >
              <div className="relative" style={{ aspectRatio: '4 / 3' }}>
                <img src={asset.previewSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute bottom-0 left-0 right-0 px-1 py-0.5"
                  style={{ background: 'rgba(255,255,255,0.88)', fontFamily: '"Futura PT Medium"', fontSize: '7px' }}
                >
                  {asset.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
