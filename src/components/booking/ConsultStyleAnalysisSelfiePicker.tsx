import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { bookingFontBook, bookingFontMedium } from './BookingPageChrome';
import { compressClientPreviewDataUrl } from '../../utils/hairstyleAnalysisClientPreviewImage';

export const CONSULT_STYLE_ANALYSIS_SELFIE_SESSION_KEY = 'bawBookingConsultStyleAnalysisSelfieDraft';

export type ConsultStyleAnalysisSelfieItem = {
  id: string;
  name: string;
  dataUrl: string;
};

function loadSelfieDraft(): ConsultStyleAnalysisSelfieItem | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CONSULT_STYLE_ANALYSIS_SELFIE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsultStyleAnalysisSelfieItem;
    if (parsed?.dataUrl?.startsWith('data:image/')) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function isProbablyImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  const name = file.name.toLowerCase();
  return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(name);
}

async function readImageFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(typeof result === 'string' && result.startsWith('data:') ? result : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

type ConsultStyleAnalysisSelfiePickerProps = {
  value: ConsultStyleAnalysisSelfieItem | null;
  onChange: (next: ConsultStyleAnalysisSelfieItem | null) => void;
  disabled?: boolean;
  /** Inside a selected tier panel — no top rule / extra margin. */
  embedded?: boolean;
};

/** PSA-style selfie upload — combined with hair inspo at fulfillment (not PSA ranked picks). */
export default function ConsultStyleAnalysisSelfiePicker({
  value,
  onChange,
  disabled,
  embedded = false,
}: ConsultStyleAnalysisSelfiePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const sessionMayClearRef = useRef(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      sessionMayClearRef.current = true;
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    try {
      if (!value) {
        if (sessionMayClearRef.current) {
          sessionStorage.removeItem(CONSULT_STYLE_ANALYSIS_SELFIE_SESSION_KEY);
        }
      } else {
        sessionStorage.setItem(CONSULT_STYLE_ANALYSIS_SELFIE_SESSION_KEY, JSON.stringify(value));
      }
    } catch {
      /* quota */
    }
  }, [value]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !isProbablyImageFile(file)) return;
      void (async () => {
        const raw = await readImageFileAsDataUrl(file);
        if (!raw) {
          setError('COULD NOT READ THAT PHOTO. TRY ANOTHER.');
          return;
        }
        try {
          const dataUrl = await compressClientPreviewDataUrl(raw);
          onChange({
            id: `selfie-${Date.now()}`,
            name: file.name || 'selfie.jpg',
            dataUrl,
          });
          setError(null);
        } catch {
          setError('COULD NOT READ THAT PHOTO. TRY ANOTHER.');
        }
      })();
    },
    [onChange]
  );

  const labelStyle = {
    fontFamily: bookingFontMedium,
    fontSize: '11px' as const,
    color: '#000000',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
    display: 'block' as const,
    letterSpacing: '0.03em',
    fontWeight: 500 as const,
  };

  const btnStyle = {
    width: '100%',
    border: '1.3px solid #000',
    background: '#fff',
    fontFamily: bookingFontMedium,
    fontSize: '10px',
    padding: '10px',
    cursor: disabled ? 'default' : 'pointer',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        marginTop: embedded ? '12px' : '16px',
        paddingTop: embedded ? 0 : '16px',
        borderTop: embedded ? 'none' : '1px solid #e5e7eb',
      }}
    >
      <p style={{ ...labelStyle, marginTop: 0 }}>
        YOUR SELFIE:
        <span style={{ color: '#EB1C24' }}>*</span>
      </p>
      <p
        style={{
          fontFamily: bookingFontBook,
          fontSize: '9px',
          color: '#808080',
          textTransform: 'uppercase',
          margin: '0 0 10px',
          lineHeight: 1.45,
        }}
      >
        UPLOAD A CLEAR FRONT-FACING SELFIE — SAME FLOW AS PSA. WE COMBINE IT WITH YOUR HAIR INSPO
        PHOTO ABOVE TO SHOW THAT EXACT STYLE ON YOU.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,image/heic,image/heif,.heic,.heif"
        disabled={disabled}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden
      />

      {value ? (
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <img
            src={value.dataUrl}
            alt=""
            style={{
              width: '72px',
              height: '96px',
              objectFit: 'cover',
              border: '1.3px solid #000',
              display: 'block',
            }}
          />
          <button
            type="button"
            onClick={() => setRemoveConfirm(true)}
            aria-label="Remove selfie"
            disabled={disabled}
            style={{
              position: 'absolute',
              top: '-4px',
              right: 'calc(50% - 40px)',
              width: '15.4px',
              height: '15.4px',
              backgroundColor: '#FFFFFF',
              border: '1.07px solid #000000',
              borderRadius: '50%',
              cursor: disabled ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width={9.24} height={9.24} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6.4 18.3 5.7 17.6 11.3 12 5.7 6.4 6.4 5.7 12 11.3 17.6 5.7 18.3 6.4 12.7 12 18.3 17.6 17.6 18.3 12 12.7 6.4 18.3Z"
                fill="#EB1C24"
              />
            </svg>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        style={btnStyle}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {value ? 'REPLACE SELFIE' : 'CHOOSE SELFIE'}
      </button>

      {error ? (
        <p
          style={{
            color: '#EB1C24',
            fontFamily: bookingFontMedium,
            fontSize: '9px',
            margin: '0 0 8px',
            textTransform: 'uppercase',
          }}
        >
          {error}
        </p>
      ) : null}

      {removeConfirm ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setRemoveConfirm(false)}
        >
          <div
            style={{
              background: '#fff',
              border: '1.3px solid #000',
              padding: '16px',
              maxWidth: '320px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ ...labelStyle, marginBottom: '12px' }}>REMOVE SELFIE?</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setRemoveConfirm(false);
                }}
                style={{
                  flex: 1,
                  border: '1.3px solid #000',
                  background: '#EB1C24',
                  color: '#fff',
                  padding: '10px',
                  fontFamily: bookingFontMedium,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                }}
              >
                REMOVE
              </button>
              <button
                type="button"
                onClick={() => setRemoveConfirm(false)}
                style={{
                  flex: 1,
                  border: '1.3px solid #000',
                  background: '#fff',
                  padding: '10px',
                  fontFamily: bookingFontMedium,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { loadSelfieDraft };
