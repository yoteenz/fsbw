import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { postPsaSelfieStyleAnalysis } from '../../utils/psaSelfieStyleAnalysisApi';
import { PSA_SELFIE_STYLE_CHIP } from '../../utils/psaSelfieStyleAnalysis';
import {
  PSA_HAIR_ANALYSIS_PANEL_COPY,
  PSA_HAIR_ANALYSIS_SUBMITTED_MESSAGE,
} from '../../utils/psaHairAnalysisDelivery';

type PsaSelfieStyleAnalysisPanelProps = {
  onClose: () => void;
  onPremiumRequired: () => void;
  onSubmitted: (message: string) => void;
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
  onSubmitted,
}: PsaSelfieStyleAnalysisPanelProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const submitSelfie = async () => {
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
      const msg = result.message || 'Something went wrong. Try again.';
      setError(
        result.code === 'SIGN_IN_REQUIRED' ? msg : msg.toUpperCase()
      );
      return;
    }
    onSubmitted(PSA_HAIR_ANALYSIS_SUBMITTED_MESSAGE);
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
      <p className="psa-selfie-analysis-copy">{PSA_HAIR_ANALYSIS_PANEL_COPY}</p>
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
        onClick={() => void submitSelfie()}
      >
        {busy ? 'SUBMITTING…' : 'SUBMIT SELFIE'}
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
