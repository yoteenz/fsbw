import {
  PSA_WIDGET_CTA,
  type PsaAvatarExpression,
} from '../../constants/psaConfig';
import PsaAvatarImageCrossfade from './PsaAvatarImageCrossfade';
import './desktopPsaSuite.css';

type PsaStandingHologramProps = {
  onClick: () => void;
  isOpen: boolean;
  idle?: boolean;
  expression: PsaAvatarExpression;
  ctaLabel?: string;
  ctaSubline?: string | null;
  'aria-label'?: string;
};

export default function PsaStandingHologram({
  onClick,
  isOpen,
  idle = true,
  expression,
  ctaLabel = PSA_WIDGET_CTA,
  ctaSubline = null,
  'aria-label': ariaLabel = 'Open Personal Slay Assistant',
}: PsaStandingHologramProps) {
  return (
    <button
      type="button"
      className="psa-standing-hologram"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      <div className={`psa-standing-hologram__stage${idle ? ' psa-standing-hologram__stage--idle' : ''}`}>
        <div className="psa-standing-hologram__scanlines" aria-hidden />
        <div className="psa-standing-hologram__figure">
          <PsaAvatarImageCrossfade expression={expression} />
        </div>
        <div className="psa-standing-hologram__pedestal" aria-hidden />
      </div>
      <span className="psa-standing-hologram__cta">{ctaLabel}</span>
      {ctaSubline ? <span className="psa-standing-hologram__cta-subline">{ctaSubline}</span> : null}
    </button>
  );
}
