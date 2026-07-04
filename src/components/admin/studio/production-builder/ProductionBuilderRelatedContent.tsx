import { PRODUCTION_RELATED_CONTENT } from '../../../../utils/adminStudioProductionBuilderDemo';
import { PB_VISUAL, pbCaptionStyle, pbPanelStyle, pbSectionTitleStyle } from './productionBuilderTheme';

function RelatedRow({ title, items }: { title: string; items: Array<{ id: string; title: string; thumb: string }> }) {
  return (
    <div className="mb-3">
      <p style={{ ...pbSectionTitleStyle, fontSize: '8px' }}>{title}</p>
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0" style={{ width: '56px' }}>
            <div className="overflow-hidden mb-0.5" style={{ aspectRatio: '1 / 1', border: PB_VISUAL.border }}>
              <img src={item.thumb} alt="" className="w-full h-full object-cover" />
            </div>
            <p style={{ ...pbCaptionStyle, fontSize: '6px' }}>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductionBuilderRelatedContent() {
  const { previousEpisodes, relatedCampaigns, relatedProducts, previousPacks, recommendedAssets, recommendedTalent } =
    PRODUCTION_RELATED_CONTENT;

  return (
    <section style={{ ...pbPanelStyle, padding: '10px' }}>
      <p style={pbSectionTitleStyle}>RELATED CONTENT</p>
      <RelatedRow title="PREVIOUS EPISODES" items={previousEpisodes} />
      <RelatedRow title="RELATED CAMPAIGNS" items={relatedCampaigns} />
      <RelatedRow title="RELATED PRODUCTS" items={relatedProducts} />
      <RelatedRow title="PREVIOUS CONTENT PACKS" items={previousPacks} />
      <div className="mb-3">
        <p style={{ ...pbSectionTitleStyle, fontSize: '8px' }}>RECOMMENDED ASSETS</p>
        <div className="flex gap-2">
          {recommendedAssets.map((a) => (
            <div key={a.id} className="flex-shrink-0" style={{ width: '56px' }}>
              <div className="overflow-hidden" style={{ aspectRatio: '4 / 3', border: PB_VISUAL.border }}>
                <img src={a.thumb} alt="" className="w-full h-full object-cover" />
              </div>
              <p style={{ ...pbCaptionStyle, fontSize: '6px' }}>{a.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p style={{ ...pbSectionTitleStyle, fontSize: '8px' }}>RECOMMENDED TALENT</p>
        <div className="flex gap-2">
          {recommendedTalent.map((t) => (
            <div key={t.id} className="flex-shrink-0" style={{ width: '56px' }}>
              <div className="overflow-hidden" style={{ aspectRatio: '3 / 4', border: PB_VISUAL.border }}>
                <img src={t.thumb} alt="" className="w-full h-full object-cover" />
              </div>
              <p style={{ ...pbCaptionStyle, fontSize: '6px' }}>{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
