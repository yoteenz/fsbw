import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AdminStudioImagePreviewItem } from '../AdminStudioImagePreviewModal';
import type { DerivativeGalleryFilter, DerivativeGalleryItem } from '../../../../studio-os/product-photography/DerivativeGalleryCatalog';
import { STUDIO_OS_UPPERCASE_CLASS } from '../../../../utils/adminStudioTheme';
import {
  derivativeGallerySummary,
  derivativeStatusColor,
  filterDerivativeGalleryItems,
} from '../../../../utils/assetFactoryDerivativeGallery';
import { PP_VISUAL, ppActionBtn, ppCaption, ppPanelStyle, ppSectionTitle } from '../product-photography-bible/photographyBibleTheme';

const GALLERY_FILTERS: Array<{ id: DerivativeGalleryFilter; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'pending', label: 'PENDING' },
  { id: 'generated', label: 'GENERATED' },
  { id: 'needs-review', label: 'NEEDS REVIEW' },
  { id: 'approved', label: 'APPROVED' },
  { id: 'published', label: 'PUBLISHED' },
  { id: 'failed', label: 'FAILED' },
];

type AssetFactoryPreviewAllCropsModalProps = {
  items: DerivativeGalleryItem[];
  productLabel: string;
  onClose: () => void;
  onView: (item: DerivativeGalleryItem) => void;
};

export function AssetFactoryPreviewAllCropsModal({
  items,
  productLabel,
  onClose,
  onView,
}: AssetFactoryPreviewAllCropsModalProps) {
  if (typeof document === 'undefined') return null;

  const withPreview = items.filter((i) => i.previewSrc);

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${STUDIO_OS_UPPERCASE_CLASS}`}
      style={{ zIndex: 10003, background: 'rgba(0,0,0,0.45)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Preview all crops"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] overflow-y-auto w-full max-w-4xl"
        style={{ ...ppPanelStyle, padding: '16px', background: 'rgba(255,255,255,0.96)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ ...ppCaption, color: PP_VISUAL.red }}>PREVIEW ALL CROPS · {productLabel}</p>
        <p style={{ ...ppCaption, marginBottom: 12 }}>
          {withPreview.length} OF {items.length} DERIVATIVES WITH UPLOADED PREVIEWS
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.slot.assetType}
              type="button"
              onClick={() => (item.previewSrc ? onView(item) : undefined)}
              style={{
                border: `1px solid ${PP_VISUAL.panelBorder}`,
                background: item.transparency ? 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 0 0 / 12px 12px' : 'rgba(255,255,255,0.9)',
                padding: 8,
                cursor: item.previewSrc ? 'pointer' : 'default',
                textAlign: 'left',
              }}
            >
              {item.previewSrc ? (
                <img
                  src={item.previewSrc}
                  alt={item.slot.label}
                  className="w-full object-contain mx-auto"
                  style={{ maxHeight: 120, aspectRatio: item.aspectRatio.replace(':', ' / ') }}
                />
              ) : (
                <div className="flex items-center justify-center" style={{ height: 80 }}>
                  <p style={{ ...ppCaption, fontSize: '6px' }}>PENDING</p>
                </div>
              )}
              <p style={{ ...ppCaption, color: PP_VISUAL.black, marginTop: 6, fontSize: '7px' }}>{item.slot.label}</p>
              <p style={{ ...ppCaption, fontSize: '6px', color: derivativeStatusColor(item.status) }}>
                {item.status.toUpperCase()}
              </p>
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} style={{ ...ppActionBtn, marginTop: 16 }}>
          CLOSE
        </button>
      </div>
    </div>,
    document.body
  );
}

type AssetFactoryDerivativeGalleryProps = {
  items: DerivativeGalleryItem[];
  productLabel: string;
  running?: boolean;
  onView: (item: DerivativeGalleryItem) => void;
  onRegenerate: (assetType: string) => void;
  onApprove: (registryId: string) => void;
  onPreviewAll: () => void;
};

function DerivativeTile({
  item,
  compact,
  running,
  onView,
  onRegenerate,
  onApprove,
}: {
  item: DerivativeGalleryItem;
  compact: boolean;
  running?: boolean;
  onView: (item: DerivativeGalleryItem) => void;
  onRegenerate: (assetType: string) => void;
  onApprove: (registryId: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    if (!item.supabaseUrl) return;
    try {
      await navigator.clipboard.writeText(item.supabaseUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy URL:', item.supabaseUrl);
    }
  };

  return (
    <article
      style={{
        border: `1px solid ${PP_VISUAL.panelBorder}`,
        background: 'rgba(255,255,255,0.88)',
        padding: compact ? 8 : 10,
      }}
    >
      <div
        style={{
          background: item.transparency
            ? 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 0 0 / 10px 10px'
            : '#fff',
          border: `1px solid ${PP_VISUAL.panelBorder}`,
          minHeight: compact ? 72 : 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        {item.previewSrc ? (
          <img
            src={item.previewSrc}
            alt={item.slot.label}
            className="max-w-full max-h-full object-contain p-1"
            style={{ maxHeight: compact ? 64 : 96 }}
          />
        ) : (
          <p style={{ ...ppCaption, fontSize: '6px' }}>{item.slot.placeholder ? 'PLACEHOLDER SLOT' : 'NOT GENERATED'}</p>
        )}
      </div>

      <p style={{ ...ppCaption, color: PP_VISUAL.red, fontSize: compact ? '6px' : '7px' }}>{item.slot.label.toUpperCase()}</p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>TYPE · {item.slot.assetType}</p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>TEMPLATE · {item.templateLabel}</p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>
        DIM · {item.dimensions.width}×{item.dimensions.height} · {item.aspectRatio}
      </p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>ALPHA · {item.transparency ? 'YES' : 'NO'}</p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>SUPABASE · {item.supabaseStatus.toUpperCase()}</p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>REGISTRY · {item.registryStatus}</p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>VERSION · {item.version}</p>
      {item.lastUpdated ? <p style={{ ...ppCaption, fontSize: '6px' }}>UPDATED · {item.lastUpdated}</p> : null}
      <p style={{ ...ppCaption, fontSize: '6px', color: derivativeStatusColor(item.status), marginTop: 4 }}>
        STATUS · {item.status.toUpperCase()}
      </p>

      <div className={`grid gap-1 mt-2 ${compact ? 'grid-cols-2' : 'grid-cols-2'}`}>
        <button type="button" style={ppActionBtn} disabled={!item.previewSrc} onClick={() => onView(item)}>
          VIEW
        </button>
        <button
          type="button"
          style={ppActionBtn}
          disabled={running || item.supabaseStatus === 'missing'}
          onClick={() => onRegenerate(item.slot.assetType)}
        >
          REGEN
        </button>
        <button type="button" style={ppActionBtn} disabled={!item.supabaseUrl} onClick={() => void copyUrl()}>
          {copied ? 'COPIED' : 'COPY URL'}
        </button>
        {item.registryId && item.status === 'needs-review' ? (
          <button type="button" style={{ ...ppActionBtn, color: PP_VISUAL.red }} onClick={() => onApprove(item.registryId!)}>
            APPROVE
          </button>
        ) : (
          <span style={{ ...ppCaption, fontSize: '5px', alignSelf: 'center' }}>
            {item.slot.placeholder ? 'PLACEHOLDER' : '—'}
          </span>
        )}
      </div>
    </article>
  );
}

export function AssetFactoryDerivativeGallery({
  items,
  productLabel,
  running,
  onView,
  onRegenerate,
  onApprove,
  onPreviewAll,
}: AssetFactoryDerivativeGalleryProps) {
  const [filter, setFilter] = useState<DerivativeGalleryFilter>('all');
  const [compact, setCompact] = useState(false);

  const summary = useMemo(() => derivativeGallerySummary(items), [items]);
  const filtered = useMemo(() => filterDerivativeGalleryItems(items, filter), [items, filter]);

  return (
    <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px' }}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p style={ppSectionTitle}>DERIVATIVE GALLERY</p>
          <p style={ppCaption}>
            {summary.total} SLOTS · {summary.published} PUBLISHED · {summary.approved} APPROVED ·{' '}
            {summary.needsReview} NEEDS REVIEW · {summary.pending} PENDING · {summary.failed} FAILED
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" style={ppActionBtn} onClick={onPreviewAll}>
            PREVIEW ALL CROPS
          </button>
          <button type="button" style={{ ...ppActionBtn, color: compact ? PP_VISUAL.red : PP_VISUAL.black }} onClick={() => setCompact((c) => !c)}>
            {compact ? 'GRID' : 'COMPACT'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3 mb-3">
        {GALLERY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={{
              ...ppActionBtn,
              fontSize: '6px',
              padding: '6px 8px',
              background: filter === f.id ? PP_VISUAL.red : 'rgba(255,255,255,0.85)',
              color: filter === f.id ? '#fff' : PP_VISUAL.black,
              borderColor: filter === f.id ? PP_VISUAL.red : PP_VISUAL.panelBorder,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        className={compact ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'}
      >
        {filtered.map((item) => (
          <DerivativeTile
            key={item.slot.assetType}
            item={item}
            compact={compact}
            running={running}
            onView={onView}
            onRegenerate={onRegenerate}
            onApprove={onApprove}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ ...ppCaption, marginTop: 12 }}>NO DERIVATIVES MATCH FILTER · {productLabel}</p>
      ) : null}
    </section>
  );
}

export function derivativeItemToPreview(item: DerivativeGalleryItem): AdminStudioImagePreviewItem {
  return {
    name: item.slot.label,
    previewSrc: item.previewSrc ?? '',
    subtitle: `${item.templateLabel} · ${item.dimensions.width}×${item.dimensions.height} · ${item.status.toUpperCase()}`,
    aspectRatio: item.aspectRatio.replace(':', ' / '),
    checkerboard: item.transparency,
  };
}
