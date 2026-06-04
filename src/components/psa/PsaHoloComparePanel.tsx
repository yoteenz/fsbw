import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PSA_HOLO_GLOW_COMPARE_OPTIONS,
  PSA_NUDGE_BUBBLE_SRC,
  PSA_WIDGET_CTA,
} from '../../constants/psaConfig';
import PsaAvatarImageCrossfade from './PsaAvatarImageCrossfade';
import './psaAssistant.css';

const SAMPLE_HEADLINE = 'finish your customization';
const SAMPLE_BODY = 'beach wave';

function CompareColumn({
  optionId,
  label,
  glowSrc,
}: {
  optionId: number;
  label: string;
  glowSrc: string;
}) {
  return (
    <div className="psa-holo-compare-column">
      <span className="psa-holo-compare-label">
        OPTION {optionId} · {label}
      </span>
      <div className="psa-holo-compare-stack">
        <div className="psa-holo-compare-nudge" aria-hidden>
          <img className="psa-nudge-chip-art" src={PSA_NUDGE_BUBBLE_SRC} alt="" draggable={false} />
          <span className="psa-nudge-chip-content">
            <span className="psa-nudge-chip-headline">{SAMPLE_HEADLINE}</span>
            <span className="psa-nudge-chip-body">{SAMPLE_BODY}</span>
          </span>
        </div>
        <div className="psa-holo-compare-avatar" aria-hidden>
          <div className="psa-avatar-glow-wrap psa-avatar-idle">
            <div className="psa-avatar-holo-glow-rotator" aria-hidden>
              <img className="psa-avatar-holo-glow" src={glowSrc} alt="" draggable={false} />
            </div>
            <div className="psa-avatar-frame">
              <PsaAvatarImageCrossfade expression="neutral" />
              <span className="psa-nudge-badge" aria-hidden />
            </div>
          </div>
          <span className="psa-avatar-cta">{PSA_WIDGET_CTA}</span>
        </div>
      </div>
    </div>
  );
}

export default function PsaHoloComparePanel() {
  const navigate = useNavigate();
  const location = useLocation();

  const exitCompare = () => {
    const params = new URLSearchParams(location.search);
    params.delete('psaHoloCompare');
    const qs = params.toString();
    navigate({ pathname: location.pathname, search: qs ? `?${qs}` : '' }, { replace: true });
  };

  const panel = (
    <div className="psa-holo-compare-root" data-attribute="psa-holo-compare">
      <div className="psa-holo-compare-header">
        <p className="psa-holo-compare-title">holo glow — pick one</p>
        <button type="button" className="psa-holo-compare-exit" onClick={exitCompare}>
          EXIT
        </button>
      </div>
      <p className="psa-holo-compare-hint">
        Same PSA + nudge on each — option 1 is the current live glow, option 2 is the new draft.
      </p>
      <div className="psa-holo-compare-row">
        {PSA_HOLO_GLOW_COMPARE_OPTIONS.map((opt) => (
          <CompareColumn key={opt.id} optionId={opt.id} label={opt.label} glowSrc={opt.src} />
        ))}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return panel;
  return createPortal(panel, document.body);
}
