import type { ProductionSceneAssetSelection } from '../../../../utils/adminStudioProductionBuilderDemo';
import { BRAND_PREVIEW_FORMATS, getScenePreviewSrc } from '../../../../utils/adminStudioProductionBuilderDemo';
import { PB_VISUAL, pbCaptionStyle, pbPanelStyle, pbSectionTitleStyle } from './productionBuilderTheme';

type ProductionBuilderBrandPreviewsProps = {
  selection: ProductionSceneAssetSelection;
};

export function ProductionBuilderBrandPreviews({ selection }: ProductionBuilderBrandPreviewsProps) {
  const previewSrc = getScenePreviewSrc(selection);

  return (
    <section className="mb-3" style={{ ...pbPanelStyle, padding: '10px' }}>
      <p style={pbSectionTitleStyle}>BRAND PREVIEW</p>
      <p style={{ ...pbCaptionStyle, marginBottom: '8px' }}>SAME PRODUCTION · ADAPTED DIMENSIONS</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {BRAND_PREVIEW_FORMATS.map((fmt) => (
          <div key={fmt.id} className="flex-shrink-0" style={{ width: '72px' }}>
            <div
              className="relative overflow-hidden mb-1"
              style={{ aspectRatio: fmt.ratio, border: PB_VISUAL.border, background: '#FFFFFF' }}
            >
              <img src={previewSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <p style={{ ...pbCaptionStyle, fontSize: '7px', textAlign: 'center' }}>{fmt.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
