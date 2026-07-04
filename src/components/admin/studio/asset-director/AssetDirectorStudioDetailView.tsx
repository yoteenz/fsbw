import type { StudioVisualBundle } from '../../../../utils/adminStudioAssetDirectorVisual';
import { STUDIO_SET_LAYER_SECTION_SUBTITLES } from '../../../../utils/adminStudioSetSeparation';
import { ASSET_HEALTH_LABELS } from '../../../../utils/adminStudioAssetDirectorDemo';
import {
  AssetDirectorHeroPreview,
  AssetDirectorMetadataPanel,
  AssetDirectorPageHeader,
  AssetDirectorSectionBlock,
  AssetDirectorVisualTile,
} from './AssetDirectorVisualPrimitives';
import { AD_VISUAL, adCaptionStyle } from './assetDirectorVisualTheme';

type AssetDirectorStudioDetailViewProps = {
  bundle: StudioVisualBundle;
  busyVariantKey?: string | null;
  onQuickPreview?: (item: { name: string; previewSrc: string; resolution?: string; version?: string; setLayer?: string; subtitle?: string }) => void;
  onGenerate?: (item: { name: string }) => void;
  onReplace?: (item: { name: string }) => void;
  onHeaderAction?: (action: string) => void;
};

export function AssetDirectorStudioDetailView({
  bundle,
  busyVariantKey,
  onQuickPreview,
  onGenerate,
  onReplace,
  onHeaderAction,
}: AssetDirectorStudioDetailViewProps) {
  const preview = (item: { name: string; previewSrc: string; resolution: string; version: string; setLayer?: string; subtitle?: string }) =>
    onQuickPreview?.(item);
  const tileActions = (item: { id: string; name: string; previewSrc: string; resolution: string; version: string; setLayer?: string; subtitle?: string }) => {
    const isBusy = busyVariantKey === `${bundle.studio.id}:${item.id}`;
    return {
      onPreview: () => preview(item),
      onGenerate: isBusy ? undefined : () => onGenerate?.(item),
      onReplace: isBusy ? undefined : () => onReplace?.(item),
      busy: isBusy,
    };
  };

  return (
    <div className="pb-4">
      <AssetDirectorPageHeader
        studio={bundle.studio}
        subtitle={bundle.studio.masterEnvironment}
        productionCount={bundle.productionCount}
        onAction={onHeaderAction}
      />

      <AssetDirectorHeroPreview src={bundle.heroSrc} label="MASTER STUDIO PREVIEW" type={bundle.heroType} />

      <div className="mb-3 px-1 py-2 border border-black bg-white/70" style={{ borderWidth: '1.3px' }}>
        <p style={{ ...adCaptionStyle, color: AD_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
          {bundle.separationRule}
        </p>
        <p style={{ ...adCaptionStyle, fontSize: '8px', marginTop: '4px' }}>
          MASTER STUDIO = REUSABLE EMPTY SET · REFERENCE SCENE = STAGED EXAMPLE ONLY
        </p>
      </div>

      <AssetDirectorSectionBlock title="MASTER STUDIO" subtitle={STUDIO_SET_LAYER_SECTION_SUBTITLES['master-studio']}>
        <div className="grid grid-cols-2 gap-2">
          {bundle.masterStudio.map((v) => (
            <AssetDirectorVisualTile key={v.id} item={v} {...tileActions(v)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="REFERENCE SCENE" subtitle={STUDIO_SET_LAYER_SECTION_SUBTITLES['reference-scene']}>
        <div className="grid grid-cols-2 gap-2">
          {bundle.referenceScene.map((v) => (
            <AssetDirectorVisualTile key={v.id} item={v} {...tileActions(v)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="SET DRESSING" subtitle={STUDIO_SET_LAYER_SECTION_SUBTITLES['set-dressing']}>
        <div className="grid grid-cols-2 gap-2">
          {bundle.setDressing.map((p) => (
            <AssetDirectorVisualTile key={p.id} item={p} {...tileActions(p)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="TALENT LAYERS" subtitle={STUDIO_SET_LAYER_SECTION_SUBTITLES['talent-layer']}>
        <div className="grid grid-cols-2 gap-2">
          {bundle.talent.map((t) => (
            <div key={t.id} className="border border-black overflow-hidden bg-white" style={{ borderWidth: '1.3px' }}>
              <button type="button" onClick={() => preview(t)} className="block w-full" style={{ aspectRatio: '3 / 4' }}>
                <img src={t.previewSrc} alt="" className="w-full h-full object-cover" />
              </button>
              <div className="p-2">
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.red }}>{t.name}</p>
                <p style={adCaptionStyle}>{t.role}</p>
                <p style={{ ...adCaptionStyle, fontSize: '8px' }}>TALENT LAYER · {t.subtitle ?? 'TALENT AGENCY'}</p>
              </div>
            </div>
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="EPISODE GRAPHICS" subtitle={STUDIO_SET_LAYER_SECTION_SUBTITLES['episode-graphics']}>
        <div className="grid grid-cols-2 gap-2">
          {bundle.episodeGraphics.map((g) => (
            <AssetDirectorVisualTile key={g.id} item={g} {...tileActions(g)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="VERSIONS" subtitle="DAY · NIGHT · SEASONAL · CAMPAIGN VARIANTS · EMPTY SET">
        <div className="grid grid-cols-2 gap-2">
          {bundle.versions.map((v) => (
            <AssetDirectorVisualTile key={v.id} item={v} {...tileActions(v)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="VIDEOS" subtitle="INTRO · IDLE · LOOP · OUTRO · TRANSITION">
        <div className="grid grid-cols-2 gap-2">
          {bundle.videos.map((v) => (
            <AssetDirectorVisualTile key={v.id} item={v} showPlay {...tileActions(v)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="CAMERAS" subtitle="FRAMING PRESETS — VISUAL FIRST">
        <div className="grid grid-cols-2 gap-2">
          {bundle.cameras.map((c) => (
            <AssetDirectorVisualTile key={c.id} item={c} aspect="16 / 9" {...tileActions(c)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="LIGHTING">
        <div className="grid grid-cols-2 gap-2">
          {bundle.lighting.map((l) => (
            <AssetDirectorVisualTile key={l.id} item={l} {...tileActions(l)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="PROPS" subtitle="LEGACY PROPS INDEX · ALSO IN SET DRESSING">
        <div className="grid grid-cols-2 gap-2">
          {bundle.props.map((p) => (
            <AssetDirectorVisualTile key={p.id} item={p} {...tileActions(p)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="WARDROBE" subtitle="TAP FOR FRONT · BACK · SIDE · DETAIL">
        <div className="grid grid-cols-2 gap-2">
          {bundle.wardrobe.map((w) => (
            <div key={w.id} className="border border-black bg-white" style={{ borderWidth: '1.3px' }}>
              <img src={w.previewSrc} alt="" className="w-full object-cover" style={{ aspectRatio: '3 / 4' }} />
              <div className="p-2">
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.red }}>{w.name}</p>
                <div className="grid grid-cols-4 gap-0.5 mt-2">
                  {w.views.map((v) => (
                    <div key={v.id} className="border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
                      <img src={v.previewSrc} alt="" className="w-full aspect-square object-cover" />
                      <p style={{ ...adCaptionStyle, fontSize: '7px', textAlign: 'center' }}>{v.label}</p>
                    </div>
                  ))}
                </div>
                <p style={{ ...adCaptionStyle, fontSize: '8px', marginTop: '6px' }}>{w.currentPrompt}</p>
              </div>
            </div>
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="EXPRESSION LIBRARY">
        <div className="grid grid-cols-4 gap-1.5">
          {bundle.expressions.map((e) => (
            <button key={e.id} type="button" onClick={() => preview(e)} className="border overflow-hidden" style={{ borderWidth: '1px', borderColor: '#e5e7eb' }}>
              <img src={e.previewSrc} alt="" className="w-full aspect-square object-cover" />
              <p style={{ ...adCaptionStyle, fontSize: '7px', padding: '2px' }}>{e.name}</p>
            </button>
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="POSE LIBRARY">
        <div className="grid grid-cols-2 gap-2">
          {bundle.poses.map((p) => (
            <AssetDirectorVisualTile key={p.id} item={p} aspect="3 / 4" {...tileActions(p)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="MATERIAL LIBRARY">
        <div className="grid grid-cols-2 gap-2">
          {bundle.materials.map((m) => (
            <AssetDirectorVisualTile key={m.id} item={m} {...tileActions(m)} />
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="ASSET RELATIONSHIPS">
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-full max-w-[200px] border overflow-hidden" style={{ borderWidth: '1.3px' }}>
            <img src={bundle.relationships.source.previewSrc} alt="" className="w-full aspect-video object-cover" />
            <p style={{ ...adCaptionStyle, textAlign: 'center', padding: '6px', color: AD_VISUAL.red, fontFamily: '"Futura PT Medium"' }}>
              {bundle.relationships.source.name}
            </p>
          </div>
          <span style={adCaptionStyle}>↓ USED BY</span>
          <div className="grid grid-cols-2 gap-2 w-full">
            {bundle.relationships.usedBy.map((node) => (
              <button key={node.id} type="button" className="border bg-white text-left overflow-hidden hover:opacity-90" style={{ borderWidth: '1px', borderColor: '#e5e7eb' }}>
                <img src={node.previewSrc} alt="" className="w-full aspect-video object-cover" />
                <p style={{ ...adCaptionStyle, padding: '6px', fontSize: '9px' }}>{node.name}</p>
              </button>
            ))}
          </div>
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="MOODBOARD" subtitle="PINTEREST-STYLE MASONRY">
        <div className="columns-2 gap-2">
          {bundle.moodboardPins.map((pin) => (
            <div key={pin.id} className="break-inside-avoid mb-2 border overflow-hidden" style={{ borderWidth: '1px', borderColor: '#e5e7eb' }}>
              <img
                src={pin.src}
                alt=""
                className="w-full object-cover"
                style={{ aspectRatio: pin.span === 'tall' ? '3 / 5' : pin.span === 'wide' ? '16 / 9' : '1 / 1' }}
              />
              <p style={{ ...adCaptionStyle, fontSize: '8px', padding: '4px' }}>{pin.caption} · {pin.category}</p>
            </div>
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="VERSION HISTORY">
        <div className="flex flex-col items-center gap-0">
          {bundle.versionTimeline.map((entry, i) => (
            <div key={entry.id} className="w-full flex flex-col items-center">
              {i > 0 ? <span style={adCaptionStyle}>↓</span> : null}
              <div className="w-full border p-2 bg-white" style={{ borderWidth: '1.3px' }}>
                <div className="flex gap-2">
                  <img src={entry.previewSrc} alt="" className="w-16 h-10 object-cover flex-shrink-0" />
                  <div>
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px' }}>{entry.version}</p>
                    <p style={{ ...adCaptionStyle, fontSize: '9px' }}>{entry.date}</p>
                    <p style={{ ...adCaptionStyle, fontSize: '9px' }}>{entry.notes}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorSectionBlock title="ASSET HEALTH">
        <div className="grid grid-cols-2 gap-2">
          {bundle.healthCards.map((h) => (
            <div key={h.id} className="border overflow-hidden bg-white" style={{ borderWidth: '1.3px' }}>
              <img src={h.previewSrc} alt="" className="w-full aspect-video object-cover opacity-90" />
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', padding: '6px', color: AD_VISUAL.red }}>
                {h.label}
              </p>
              <p style={{ ...adCaptionStyle, fontSize: '8px', padding: '0 6px 6px' }}>{ASSET_HEALTH_LABELS[h.indicator]}</p>
            </div>
          ))}
        </div>
      </AssetDirectorSectionBlock>

      <AssetDirectorMetadataPanel metadata={bundle.metadata} />
    </div>
  );
}
