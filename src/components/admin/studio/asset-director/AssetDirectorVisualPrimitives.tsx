import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { AssetDirectorStudioProfile } from '../../../../utils/adminStudioAssetDirectorDemo';
import { ASSET_DIRECTOR_STATUS_LABELS } from '../../../../utils/adminStudioAssetDirectorDemo';
import type { StudioVisualBundle } from '../../../../utils/adminStudioAssetDirectorVisual';
import { AD_VISUAL, adActionBtnStyle, adCaptionStyle, adSectionTitleStyle } from './assetDirectorVisualTheme';

type AssetDirectorPageHeaderProps = {
  studio: AssetDirectorStudioProfile;
  subtitle?: string;
  productionCount: number;
  onAction?: (action: string) => void;
};

const QUICK_ACTIONS = ['PREVIEW', 'GENERATE', 'REPLACE', 'HISTORY', 'DUPLICATE'] as const;

export function AssetDirectorPageHeader({ studio, subtitle, productionCount, onAction }: AssetDirectorPageHeaderProps) {
  return (
    <div className="mb-4">
      <h2 style={{ ...adSectionTitleStyle, fontSize: '12px', color: AD_VISUAL.red }}>{studio.name}</h2>
      {subtitle ? <p style={adCaptionStyle}>{subtitle}</p> : null}
      <div className="flex flex-wrap gap-2 mt-2 items-center">
        <span style={{ ...adCaptionStyle, color: AD_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>
          {ASSET_DIRECTOR_STATUS_LABELS[studio.status]}
        </span>
        <span style={adCaptionStyle}>·</span>
        <span style={adCaptionStyle}>VERSION {studio.version.replace(/^v/, '')}</span>
        <span style={adCaptionStyle}>·</span>
        <span style={adCaptionStyle}>LAST UPDATED {studio.lastUpdated}</span>
      </div>
      <p style={{ ...adCaptionStyle, marginTop: '6px' }}>
        USED BY: {studio.usedBy.slice(0, 4).join(' · ')}
        {studio.usedBy.length > 4 ? ` · +${studio.usedBy.length - 4}` : ''}
      </p>
      <p style={{ ...adCaptionStyle, marginTop: '4px' }}>{productionCount} PRODUCTIONS</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {QUICK_ACTIONS.map((action) => (
          <button key={action} type="button" onClick={() => onAction?.(action)} style={adActionBtnStyle}>
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

type AssetDirectorHeroPreviewProps = {
  src: string;
  label?: string;
  type?: 'image' | 'video' | 'interactive';
};

export function AssetDirectorHeroPreview({ src, label = 'MASTER ASSET', type = 'image' }: AssetDirectorHeroPreviewProps) {
  return (
    <section className="mb-5">
      <p style={adSectionTitleStyle}>{label}</p>
      <div
        className="relative overflow-hidden border border-black w-full"
        style={{ aspectRatio: '21 / 9', borderWidth: '1.3px', minHeight: '140px' }}
      >
        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(255,255,255,0.35) 100%)' }}
        />
        <div
          className="absolute top-2 left-2 px-2 py-1"
          style={{ background: AD_VISUAL.glass, border: AD_VISUAL.border, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}
        >
          {type === 'interactive' ? 'INTERACTIVE PREVIEW' : type === 'video' ? 'VIDEO PREVIEW' : 'HERO PREVIEW'} · 21:9
        </div>
      </div>
    </section>
  );
}

type VisualTileProps = {
  item: { id: string; name: string; previewSrc: string; status: string; resolution: string; version: string; duration?: string; subtitle?: string };
  onPreview?: () => void;
  onGenerate?: () => void;
  onReplace?: () => void;
  aspect?: string;
  showPlay?: boolean;
};

export function AssetDirectorVisualTile({
  item,
  onPreview,
  onGenerate,
  onReplace,
  aspect = '4 / 3',
  showPlay,
}: VisualTileProps) {
  return (
    <div className="border border-black overflow-hidden bg-white" style={{ borderWidth: '1.3px' }}>
      <button type="button" onClick={onPreview} className="relative w-full block" style={{ aspectRatio: aspect }}>
        <img src={item.previewSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
        {showPlay ? (
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.15)', fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#FFF' }}
          >
            ▶ PLAY
          </span>
        ) : null}
      </button>
      <div className="p-2">
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.red, margin: 0 }}>{item.name}</p>
        {item.subtitle ? <p style={{ ...adCaptionStyle, fontSize: '9px', marginTop: '2px' }}>{item.subtitle}</p> : null}
        <p style={{ ...adCaptionStyle, fontSize: '9px', marginTop: '4px' }}>
          {item.resolution} · {item.version}
          {item.duration ? ` · ${item.duration}` : ''}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          <button type="button" onClick={onPreview} style={{ ...adActionBtnStyle, fontSize: '8px', padding: '4px 6px' }}>PREVIEW</button>
          <button type="button" onClick={onGenerate} style={{ ...adActionBtnStyle, fontSize: '8px', padding: '4px 6px' }}>GENERATE</button>
          <button type="button" onClick={onReplace} style={{ ...adActionBtnStyle, fontSize: '8px', padding: '4px 6px' }}>REPLACE</button>
        </div>
      </div>
    </div>
  );
}

export function AssetDirectorSectionBlock({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <p style={adSectionTitleStyle}>{title}</p>
      {subtitle ? <p style={{ ...adCaptionStyle, marginBottom: '10px' }}>{subtitle}</p> : null}
      {children}
    </section>
  );
}

type AssetDirectorMetadataPanelProps = {
  metadata: StudioVisualBundle['metadata'];
};

export function AssetDirectorMetadataPanel({ metadata }: AssetDirectorMetadataPanelProps) {
  return (
    <details className="border border-black mt-6" style={{ borderWidth: '1.3px' }}>
      <summary
        className="cursor-pointer px-3 py-2"
        style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.gray, listStyle: 'none' }}
      >
        METADATA — COLLAPSED BY DEFAULT
      </summary>
      <div className="px-3 pb-3 space-y-2" style={{ borderTop: AD_VISUAL.divider }}>
        {[
          ['PROMPT', metadata.prompt],
          ['NOTES', metadata.notes],
          ['RESOLUTION', metadata.resolution],
          ['FILE TYPE', metadata.fileType],
          ['CREATED', metadata.created],
          ['MODIFIED', metadata.modified],
          ['TAGS', metadata.tags.join(' · ')],
          ['RELATIONSHIPS', metadata.relationships.join(' · ')],
          ['SYSTEM IDS', metadata.systemIds.join(' · ')],
        ].map(([label, value]) => (
          <div key={label}>
            <p style={{ ...adCaptionStyle, fontSize: '9px', color: AD_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{label}</p>
            <p style={{ ...adCaptionStyle, fontSize: '9px', whiteSpace: 'pre-wrap' }}>{value}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

type AssetDirectorQuickPreviewModalProps = {
  item: { name: string; previewSrc: string; resolution?: string; version?: string } | null;
  onClose: () => void;
};

export function AssetDirectorQuickPreviewModal({ item, onClose }: AssetDirectorQuickPreviewModalProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [item?.previewSrc, item?.name]);

  useEffect(() => {
    if (!item) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  if (!item || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 10000, background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${item.name}`}
    >
      <div
        className="bg-white border border-black max-w-sm w-full overflow-hidden"
        style={{ borderWidth: '1.3px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {imageFailed ? (
          <div
            className="w-full flex items-center justify-center bg-gray-100"
            style={{ aspectRatio: '16 / 9', fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.gray }}
          >
            PREVIEW UNAVAILABLE · PLACEHOLDER ASSET
          </div>
        ) : (
          <img
            src={item.previewSrc}
            alt={item.name}
            className="w-full"
            style={{ aspectRatio: '16 / 9', objectFit: 'cover', display: 'block' }}
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="p-3">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: AD_VISUAL.red }}>{item.name}</p>
          <p style={adCaptionStyle}>
            {item.resolution}
            {item.version ? ` · ${item.version}` : ''}
          </p>
          <button type="button" onClick={onClose} className="mt-2 w-full" style={adActionBtnStyle}>
            CLOSE
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

type AssetDirectorActionNoticeProps = {
  message: string | null;
  onDismiss: () => void;
};

/** Demo-mode feedback for GENERATE / REPLACE / bulk actions (portal — avoids layout clipping). */
export function AssetDirectorActionNotice({ message, onDismiss }: AssetDirectorActionNoticeProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 px-4"
      style={{ zIndex: 10001, bottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="mx-auto max-w-md border border-black bg-white p-3 shadow-lg"
        style={{ borderWidth: '1.3px' }}
      >
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.red, margin: 0 }}>{message}</p>
        <p style={{ ...adCaptionStyle, marginTop: '6px', marginBottom: 0 }}>
          DEMO MODE · AI GENERATION NOT CONNECTED · ACTION LOGGED FOR FUTURE PIPELINE
        </p>
        <button type="button" onClick={onDismiss} className="mt-2 w-full" style={adActionBtnStyle}>
          DISMISS
        </button>
      </div>
    </div>,
    document.body
  );
}
