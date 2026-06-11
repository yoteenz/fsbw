import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { postPsaSelfieStyleAnalysis } from '../../utils/psaSelfieStyleAnalysisApi';
import { psaSelfieMaxPicksFromStorage, PSA_SELFIE_STYLE_CHIP } from '../../utils/psaSelfieStyleAnalysis';
import type { PsaSelfieStylePick } from '../../types/styleAnalysis';

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
      >
        3 MO · 4 PICKS · 6 MO · 6 PICKS · 12 MO · 10 PICKS
      </button>
    </div>
  );
}
