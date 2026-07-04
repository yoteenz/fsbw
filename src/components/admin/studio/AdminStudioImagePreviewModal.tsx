import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

export type AdminStudioImagePreviewItem = {
  name: string;
  previewSrc: string;
  subtitle?: string;
  /** CSS aspect-ratio value — product masters use 1/1 */
  aspectRatio?: string;
  checkerboard?: boolean;
};

type AdminStudioImagePreviewModalProps = {
  item: AdminStudioImagePreviewItem | null;
  onClose: () => void;
};

const captionStyle = {
  fontFamily: '"Futura PT Book"',
  fontSize: '8px',
  fontWeight: 515,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: ADMIN_STUDIO_THEME.textSecondary,
  lineHeight: 1.5,
};

const actionBtnStyle = {
  ...captionStyle,
  fontSize: '7px',
  padding: '8px 10px',
  border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
  background: 'rgba(255,255,255,0.85)',
  cursor: 'pointer',
  width: '100%',
};

/** Full-screen expanding image preview — same interaction pattern as Asset Director quick preview. */
export function AdminStudioImagePreviewModal({ item, onClose }: AdminStudioImagePreviewModalProps) {
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

  const aspectRatio = item.aspectRatio ?? '1 / 1';

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
        className="bg-white border max-w-md w-full overflow-hidden"
        style={{ borderWidth: '1.3px', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        {imageFailed ? (
          <div
            className="w-full flex items-center justify-center bg-gray-100"
            style={{ aspectRatio, fontFamily: '"Futura PT Medium"', fontSize: '10px', color: ADMIN_STUDIO_THEME.textSecondary }}
          >
            PREVIEW UNAVAILABLE
          </div>
        ) : (
          <div
            style={{
              aspectRatio,
              background: item.checkerboard
                ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 16px 16px'
                : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={item.previewSrc}
              alt={item.name}
              className="max-w-full max-h-full"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              onError={() => setImageFailed(true)}
            />
          </div>
        )}
        <div className="p-3">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: ADMIN_STUDIO_THEME.accent }}>{item.name}</p>
          {item.subtitle ? <p style={{ ...captionStyle, fontSize: '8px', marginTop: 4 }}>{item.subtitle}</p> : null}
          <button type="button" onClick={onClose} className="mt-2" style={actionBtnStyle}>
            CLOSE
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

type AdminStudioExpandableImageProps = {
  src: string;
  alt: string;
  label: string;
  subtitle?: string;
  width?: number;
  height?: number;
  checkerboard?: boolean;
  onExpand: (item: AdminStudioImagePreviewItem) => void;
};

/** Thumbnail that opens the shared preview modal on click. */
export function AdminStudioExpandableImage({
  src,
  alt,
  label,
  subtitle,
  width = 120,
  height = 120,
  checkerboard = false,
  onExpand,
}: AdminStudioExpandableImageProps) {
  return (
    <div>
      <p style={{ ...captionStyle, marginBottom: 4 }}>{label}</p>
      <button
        type="button"
        onClick={() =>
          onExpand({
            name: label,
            previewSrc: src,
            subtitle,
            aspectRatio: '1 / 1',
            checkerboard,
          })
        }
        className="block p-0 border-0 bg-transparent cursor-pointer"
        aria-label={`Expand ${label}`}
        title="Tap to expand"
      >
        <img
          src={src}
          alt={alt}
          style={{
            width,
            height,
            objectFit: 'contain',
            border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
            background: checkerboard
              ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 12px 12px'
              : '#fff',
          }}
        />
      </button>
      <p style={{ ...captionStyle, fontSize: '6px', marginTop: 4, color: ADMIN_STUDIO_THEME.accent }}>TAP TO EXPAND</p>
    </div>
  );
}
