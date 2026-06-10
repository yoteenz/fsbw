import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { postPsaSelfieStyleAnalysis } from '../../utils/psaSelfieStyleAnalysisApi';
import { psaSelfieMaxPicksFromStorage, PSA_SELFIE_STYLE_CHIP } from '../../utils/psaSelfieStyleAnalysis';
import type { PsaSelfieStylePick } from '../../types/styleAnalysis';
import { bookingFontBook, bookingFontMedium } from '../booking/BookingPageChrome';

type PsaSelfieStyleAnalysisPanelProps = {
  onClose: () => void;
  onPremiumRequired: () => void;
  onResults: (summary: string, picks: PsaSelfieStylePick[]) => void;
};

function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      resolve(typeof r === 'string' && r.startsWith('data:') ? r : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export default function PsaSelfieStyleAnalysisPanel({
  onClose,
  onPremiumRequired,
  onResults,
}: PsaSelfieStyleAnalysisPanelProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxPicks = psaSelfieMaxPicksFromStorage();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    if (!dataUrl) {
      setError('COULD NOT READ THAT PHOTO. TRY ANOTHER.');
      return;
    }
    setPreview(dataUrl);
    setError(null);
  };

  const runAnalysis = async () => {
    if (!preview || busy) return;
    setBusy(true);
    setError(null);
    const result = await postPsaSelfieStyleAnalysis(preview);
    setBusy(false);
    if (!result.ok) {
      if (result.code === 'PREMIUM_REQUIRED') {
        onPremiumRequired();
        return;
      }
      setError(result.message.toUpperCase());
      return;
    }
    const summary = [
      result.result.clientSummary,
      result.result.faceShape ? `FACE: ${result.result.faceShape}` : '',
      result.result.undertone ? `UNDERTONE: ${result.result.undertone}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    onResults(summary, result.result.picks);
    onClose();
  };

  return (
    <div className="psa-selfie-analysis-panel" role="dialog" aria-label={PSA_SELFIE_STYLE_CHIP}>
      <header className="psa-selfie-analysis-header">
        <h3 className="psa-selfie-analysis-title">{PSA_SELFIE_STYLE_CHIP}</h3>
        <button type="button" className="psa-selfie-analysis-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>
      <p className="psa-selfie-analysis-copy">
        UPLOAD A SELFIE — PSA RANKS UP TO {maxPicks} CUSTOMIZED UNIT + COLOR + STYLING PICKS FOR YOUR
        FACE & VIBE. LIVE TRY-ON IN BUILD-A-WIG STAYS SEPARATE.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="psa-selfie-analysis-file-input"
        onChange={onFile}
      />
      <button
        type="button"
        className="psa-selfie-analysis-choose"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        CHOOSE SELFIE
      </button>
      {preview ? (
        <div className="psa-selfie-analysis-preview-wrap">
          <img src={preview} alt="" className="psa-selfie-analysis-preview" />
        </div>
      ) : null}
      {error ? <p className="psa-selfie-analysis-error">{error}</p> : null}
      <button
        type="button"
        className="psa-selfie-analysis-submit"
        disabled={!preview || busy}
        onClick={() => void runAnalysis()}
      >
        {busy ? 'ANALYZING…' : 'ANALYZE MY LOOKS'}
      </button>
      <button
        type="button"
        className="psa-selfie-analysis-link"
        onClick={() => navigate('/account/rewards')}
        style={{ fontFamily: bookingFontBook, fontSize: '9px' }}
      >
        3 MO · 4 PICKS · 6 MO · 6 PICKS · 12 MO · 10 PICKS
      </button>
      <style>{`
        .psa-selfie-analysis-panel {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 100%;
          margin-bottom: 8px;
          padding: 12px;
          border: 1.3px solid #000;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          z-index: 5;
          text-transform: uppercase;
        }
        .psa-selfie-analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .psa-selfie-analysis-title {
          margin: 0;
          font-family: ${bookingFontMedium};
          font-size: 11px;
          color: #eb1c24;
        }
        .psa-selfie-analysis-close {
          border: none;
          background: none;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          padding: 0 4px;
        }
        .psa-selfie-analysis-copy {
          margin: 0 0 10px;
          font-family: ${bookingFontBook};
          font-size: 9px;
          color: #808080;
          line-height: 1.45;
        }
        .psa-selfie-analysis-file-input {
          display: none;
        }
        .psa-selfie-analysis-choose,
        .psa-selfie-analysis-submit {
          width: 100%;
          border: 1.3px solid #000;
          background: #fff;
          font-family: ${bookingFontMedium};
          font-size: 10px;
          padding: 10px;
          cursor: pointer;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .psa-selfie-analysis-submit {
          background: #eb1c24;
          color: #fff;
          border-color: #eb1c24;
        }
        .psa-selfie-analysis-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .psa-selfie-analysis-preview-wrap {
          margin-bottom: 8px;
          display: flex;
          justify-content: center;
        }
        .psa-selfie-analysis-preview {
          width: 72px;
          height: 96px;
          object-fit: cover;
          border: 1.3px solid #000;
        }
        .psa-selfie-analysis-error {
          color: #eb1c24;
          font-family: ${bookingFontMedium};
          font-size: 9px;
          margin: 0 0 8px;
        }
        .psa-selfie-analysis-link {
          width: 100%;
          border: none;
          background: none;
          color: #808080;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
