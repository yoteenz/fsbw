import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { bookingFontBook, bookingFontMedium } from './BookingPageChrome';
import {
  bookingConsultHairInspoThumbFrameStyle,
  bookingConsultHairInspoThumbImgStyle,
  BOOKING_CONSULT_HAIR_INSPO_THUMB_OUTER_PX,
} from '../../utils/bookingConsultHairInspoThumb';
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

async function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('Could not read selfie'));
    };
    reader.onerror = () => reject(new Error('Could not read selfie'));
    reader.readAsDataURL(file);
  });
}

type ConsultStyleAnalysisSelfiePickerProps = {
  value: ConsultStyleAnalysisSelfieItem | null;
  onChange: (next: ConsultStyleAnalysisSelfieItem | null) => void;
  disabled?: boolean;
  onMissingSelfie?: () => void;
};

export default function ConsultStyleAnalysisSelfiePicker({
  value,
  onChange,
  disabled,
}: ConsultStyleAnalysisSelfiePickerProps) {
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
        try {
          const raw = await readImageFileAsDataUrl(file);
          const dataUrl = await compressClientPreviewDataUrl(raw);
          onChange({
            id: `selfie-${Date.now()}`,
            name: file.name || 'selfie.jpg',
            dataUrl,
          });
        } catch {
          /* ignore */
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

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <p style={{ ...labelStyle, marginTop: 0 }}>STYLE ANALYSIS SELFIE:</p>
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
        UPLOAD A CLEAR FRONT-FACING SELFIE. WE COMPOSITE YOUR HAIR INSPO ONTO YOU — NOT THE PSA
        HAIRSTYLE ANALYSIS CARD.
      </p>

      {value ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '13px',
            marginBottom: '10px',
            minHeight: `${BOOKING_CONSULT_HAIR_INSPO_THUMB_OUTER_PX}px`,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: `${BOOKING_CONSULT_HAIR_INSPO_THUMB_OUTER_PX}px`,
              height: `${BOOKING_CONSULT_HAIR_INSPO_THUMB_OUTER_PX}px`,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setRemoveConfirm(true)}
              aria-label="Remove selfie"
              disabled={disabled}
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '15.4px',
                height: '15.4px',
                backgroundColor: '#FFFFFF',
                border: '1.07px solid #000000',
                borderRadius: '50%',
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
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
            <div style={bookingConsultHairInspoThumbFrameStyle}>
              <img src={value.dataUrl} alt="" style={bookingConsultHairInspoThumbImgStyle} />
            </div>
          </div>
        </div>
      ) : null}

      <label
        htmlFor="consult-style-analysis-selfie"
        style={{ display: 'block', width: '100%', cursor: disabled ? 'default' : 'pointer', position: 'relative' }}
      >
        <input
          id="consult-style-analysis-selfie"
          type="file"
          accept="image/*,image/heic,image/heif,.heic,.heif"
          disabled={disabled}
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            minHeight: '36px',
            opacity: 0,
            cursor: disabled ? 'default' : 'pointer',
            zIndex: 2,
            margin: 0,
            fontSize: 0,
          }}
        />
        <div
          style={{
            width: '100%',
            minHeight: '36px',
            height: '36px',
            padding: '8px',
            border: '1.3px solid #000000',
            fontFamily: bookingFontMedium,
            fontSize: '11px',
            fontWeight: 500,
            backgroundColor: '#FFFFFF',
            color: value ? '#808080' : '#000000',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              padding: '4px 8px',
              border: '1px solid #808080',
              borderRadius: '4px',
              backgroundColor: '#F5F5F5',
              fontSize: '11px',
            }}
          >
            CHOOSE FILE
          </span>
          <span style={{ marginLeft: '8px', color: '#808080', fontSize: '10px' }}>
            {value ? '1 SELFIE SUBMITTED' : 'NO FILE SELECTED'}
          </span>
        </div>
      </label>

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
