import type { CSSProperties } from 'react';
import type { FounderRenderModel, FounderRenderAssetVisual } from '../../../../studio-os-core/founder-review';

const heroShell: CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: 'min(72vh, 640px)',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.18)',
};

type Props = {
  model: FounderRenderModel;
  selectedAssetId?: string | null;
  onSelectAsset?: (assetId: string) => void;
  inspectMode?: boolean;
};

/** Founder Render — photoreal-style hero (Output A). No engineering overlays. */
export function FounderReviewHero({ model, selectedAssetId, onSelectAsset, inspectMode }: Props) {
  const grade = model.variant.colorGrade;

  return (
    <div data-founder-review-hero style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div
        style={{
          ...heroShell,
          background: `linear-gradient(165deg, rgba(15,23,42,${0.15 + grade.contrast * 0.2}) 0%, rgba(30,41,59,0.4) 40%, rgba(51,65,85,0.25) 100%)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${model.marbleTextureUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35 + grade.saturation * 0.25,
            filter: `saturate(${0.8 + grade.saturation * 0.4}) contrast(${0.9 + grade.contrast * 0.3})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 80% 60% at 50% 35%, rgba(255,${200 + grade.warmth * 55},${160 + grade.warmth * 40},0.18) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        {model.assets
          .filter((a) => a.visible && a.visualStyle !== 'atmosphere')
          .map((asset) => (
            <FounderRenderAsset
              key={asset.assetId}
              asset={asset}
              accent={grade.accent}
              selected={selectedAssetId === asset.assetId}
              inspectMode={inspectMode}
              onSelect={onSelectAsset}
            />
          ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 55%, rgba(0,0,0,${0.25 + grade.contrast * 0.15}) 100%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            pointerEvents: 'none',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
              Blueprint Preview · Founder Render
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
              {model.roomDisplayName}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>{model.variant.mood}</p>
          </div>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: grade.accent,
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 6,
              backdropFilter: 'blur(8px)',
            }}
          >
            {model.variant.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function FounderRenderAsset({
  asset,
  accent,
  selected,
  inspectMode,
  onSelect,
}: {
  asset: FounderRenderAssetVisual;
  accent: string;
  selected: boolean;
  inspectMode?: boolean;
  onSelect?: (id: string) => void;
}) {
  const style = assetVisualStyle(asset.visualStyle, accent);
  const interactive = inspectMode && asset.role !== 'architecture' && onSelect;

  const content = (
    <div
      style={{
        position: 'absolute',
        left: asset.bounds.left,
        top: asset.bounds.top,
        width: asset.bounds.width,
        height: asset.bounds.height,
        ...style,
        outline: selected ? `2px solid ${accent}` : undefined,
        outlineOffset: 2,
        transition: 'transform 0.4s ease, opacity 0.4s ease',
        transform: selected ? 'scale(1.02)' : undefined,
      }}
      title={asset.label}
    />
  );

  if (!interactive) return content;

  return (
    <button
      type="button"
      onClick={() => onSelect(asset.assetId)}
      style={{
        position: 'absolute',
        left: asset.bounds.left,
        top: asset.bounds.top,
        width: asset.bounds.width,
        height: asset.bounds.height,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
      }}
      aria-label={`Inspect ${asset.label}`}
    >
      {content}
    </button>
  );
}

function assetVisualStyle(visual: FounderRenderAssetVisual['visualStyle'], accent: string): CSSProperties {
  switch (visual) {
    case 'marble-floor':
      return {
        background: 'linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(226,232,240,0.85) 100%)',
        borderRadius: '0 0 12px 12px',
        boxShadow: 'inset 0 8px 24px rgba(255,255,255,0.4)',
      };
    case 'wall-panel':
      return {
        background: 'linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.88) 100%)',
        borderRadius: 12,
        boxShadow: 'inset 0 0 40px rgba(255,255,255,0.5), 0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.6)',
      };
    case 'desk':
      return {
        background: `radial-gradient(ellipse at 50% 30%, ${accent}33 0%, rgba(30,41,59,0.75) 70%)`,
        borderRadius: '50%',
        boxShadow: '0 16px 40px rgba(0,0,0,0.35), inset 0 -8px 16px rgba(0,0,0,0.2)',
      };
    case 'sculpture':
      return {
        background: `linear-gradient(160deg, rgba(255,255,255,0.9) 0%, ${accent}55 50%, rgba(100,116,139,0.6) 100%)`,
        borderRadius: '8px 8px 4px 4px',
        boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
        filter: 'blur(0.3px)',
      };
    case 'seating':
      return {
        background: 'linear-gradient(180deg, rgba(51,65,85,0.85) 0%, rgba(30,41,59,0.9) 100%)',
        borderRadius: 8,
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      };
    case 'table':
      return {
        background: 'rgba(71,85,105,0.75)',
        borderRadius: 6,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      };
    case 'glass':
      return {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(148,163,184,0.35) 100%)',
        borderRadius: 4,
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.4)',
      };
    case 'light-glow':
      return {
        background: `radial-gradient(ellipse at center, ${accent}44 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        opacity: 0.7,
      };
    case 'plant':
      return {
        background: 'radial-gradient(ellipse at 50% 80%, rgba(34,197,94,0.35) 0%, rgba(22,101,52,0.2) 100%)',
        borderRadius: '40% 40% 10% 10%',
      };
    default:
      return { background: 'rgba(100,116,139,0.3)', borderRadius: 8 };
  }
}
