import { getTalentVisualBundle } from '../../../../utils/adminStudioAssetDirectorVisual';
import {
  AssetDirectorHeroPreview,
  AssetDirectorMetadataPanel,
  AssetDirectorSectionBlock,
  AssetDirectorVisualTile,
} from './AssetDirectorVisualPrimitives';
import { AD_VISUAL, adCaptionStyle, adSectionTitleStyle } from './assetDirectorVisualTheme';

type TalentBundle = NonNullable<ReturnType<typeof getTalentVisualBundle>>;

type AssetDirectorTalentDetailViewProps = {
  bundle: TalentBundle;
  onQuickPreview?: (item: { name: string; previewSrc: string }) => void;
  onGenerate?: (item: { name: string }) => void;
  onReplace?: (item: { name: string }) => void;
};

export function AssetDirectorTalentDetailView({
  bundle,
  onQuickPreview,
  onGenerate,
  onReplace,
}: AssetDirectorTalentDetailViewProps) {
  const { talent } = bundle;
  const preview = (name: string, src: string) => onQuickPreview?.({ name, previewSrc: src });

  return (
    <div>
      <h2 style={{ ...adSectionTitleStyle, fontSize: '12px', color: AD_VISUAL.red }}>{talent.name}</h2>
      <p style={adCaptionStyle}>{talent.masterPortrait}</p>

      <AssetDirectorHeroPreview src={bundle.heroSrc} label="MASTER PORTRAIT" />

      <div className="grid grid-cols-3 gap-1 mb-5">
        {bundle.portraits.map((p) => (
          <button key={p.id} type="button" onClick={() => preview(p.label, p.src)} className="border overflow-hidden" style={{ borderWidth: '1px' }}>
            <img src={p.src} alt="" className="w-full aspect-[3/4] object-cover" />
            <p style={{ ...adCaptionStyle, fontSize: '8px', textAlign: 'center' }}>{p.label}</p>
          </button>
        ))}
      </div>

      <AssetDirectorSectionBlock title="WARDROBE">
        <div className="grid grid-cols-2 gap-2">
          {bundle.wardrobe.map((w) => (
            <AssetDirectorVisualTile
              key={w.id}
              item={w}
              aspect="3 / 4"
              onPreview={() => preview(w.name, w.previewSrc)}
              onGenerate={() => onGenerate?.(w)}
              onReplace={() => onReplace?.(w)}
            />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="EXPRESSIONS">
        <div className="grid grid-cols-4 gap-1">
          {bundle.expressions.map((e) => (
            <button key={e.id} type="button" onClick={() => preview(e.name, e.previewSrc)} className="border overflow-hidden">
              <img src={e.previewSrc} alt="" className="w-full aspect-square object-cover" />
              <p style={{ ...adCaptionStyle, fontSize: '7px' }}>{e.name}</p>
            </button>
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="POSES">
        <div className="grid grid-cols-2 gap-2">
          {bundle.poses.map((p) => (
            <AssetDirectorVisualTile
              key={p.id}
              item={p}
              aspect="3 / 4"
              onPreview={() => preview(p.name, p.previewSrc)}
              onGenerate={() => onGenerate?.(p)}
              onReplace={() => onReplace?.(p)}
            />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorMetadataPanel metadata={bundle.metadata} />
    </div>
  );
}
