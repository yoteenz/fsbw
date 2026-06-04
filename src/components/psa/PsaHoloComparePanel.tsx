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

function CompareColumn({ optionId, glowSrc }: { optionId: number; glowSrc: string }) {
  const pngOnly = optionId === 3;
  return (
    <div
      className={`psa-holo-compare-column${pngOnly ? ' psa-holo-compare-column--png-only' : ''}`}
    >
      <span className="psa-holo-compare-label">OPTION {optionId}</span>
      <div className="psa-holo-compare-stack">
        <img className="psa-holo-compare-glow" src={glowSrc} alt="" aria-hidden draggable={false} />
        <div className="psa-holo-compare-nudge" aria-hidden>
          <img className="psa-nudge-chip-art" src={PSA_NUDGE_BUBBLE_SRC} alt="" draggable={false} />
          <span className="psa-nudge-chip-content">
            <span className="psa-nudge-chip-headline">{SAMPLE_HEADLINE}</span>
            <span className="psa-nudge-chip-body">{SAMPLE_BODY}</span>
          </span>
        </div>
        <div className="psa-holo-compare-avatar" aria-hidden>
          <div className="psa-avatar-frame psa-avatar-idle">
            <PsaAvatarImageCrossfade expression="neutral" />
            <div className="psa-avatar-scanlines" aria-hidden />
            <span className="psa-nudge-badge" aria-hidden />
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
      <p className="psa-holo-compare-hint">Same PSA + nudge on each — only the glow background differs.</p>
      <div className="psa-holo-compare-row">
        {PSA_HOLO_GLOW_COMPARE_OPTIONS.map((opt) => (
          <CompareColumn key={opt.id} optionId={opt.id} glowSrc={opt.src} />
        ))}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return panel;
  return createPortal(panel, document.body);
}
