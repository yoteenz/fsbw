import {
  PSA_AVATAR_DEFAULT_EXPRESSION,
  PSA_NUDGE_HOLO_GLOW_SRC,
  PSA_WIDGET_CTA,
  type PsaAvatarExpression,
} from '../../constants/psaConfig';
import PsaAvatarImageCrossfade from './PsaAvatarImageCrossfade';

type PsaAvatarTriggerProps = {
  onClick: () => void;
  isOpen: boolean;
  idle?: boolean;
  expression?: PsaAvatarExpression;
  ctaLabel?: string;
  ctaSubline?: string | null;
  holoGlowSrc?: string;
  'aria-label'?: string;
};

export default function PsaAvatarTrigger({
  onClick,
  isOpen,
  idle = false,
  expression = PSA_AVATAR_DEFAULT_EXPRESSION,
  ctaLabel = PSA_WIDGET_CTA,
  ctaSubline = null,
  holoGlowSrc = PSA_NUDGE_HOLO_GLOW_SRC,
  'aria-label': ariaLabel = 'Open Personal Slay Assistant',
}: PsaAvatarTriggerProps) {
  return (
    <button
      type="button"
      className="psa-avatar-trigger"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      <div className={`psa-avatar-glow-wrap${idle ? ' psa-avatar-idle' : ''}`}>
        <div className="psa-avatar-holo-glow-rotator" aria-hidden>
          <img className="psa-avatar-holo-glow" src={holoGlowSrc} alt="" draggable={false} />
        </div>
        <div className="psa-avatar-frame">
          <PsaAvatarImageCrossfade expression={expression} />
          <span
            className={`psa-nudge-badge${isOpen ? ' psa-nudge-badge-active' : ''}`}
            aria-hidden
          />
        </div>
      </div>
      <span className="psa-avatar-cta">{ctaLabel}</span>
      {ctaSubline ? <span className="psa-avatar-cta-subline">{ctaSubline}</span> : null}
    </button>
  );
}
