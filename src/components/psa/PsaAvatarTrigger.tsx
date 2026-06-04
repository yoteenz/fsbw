import {
  PSA_AVATAR_DEFAULT_EXPRESSION,
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
  'aria-label'?: string;
};

export default function PsaAvatarTrigger({
  onClick,
  isOpen,
  idle = false,
  expression = PSA_AVATAR_DEFAULT_EXPRESSION,
  ctaLabel = PSA_WIDGET_CTA,
  ctaSubline = null,
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
      <div className={`psa-avatar-frame${idle ? ' psa-avatar-idle' : ''}`}>
        <PsaAvatarImageCrossfade expression={expression} />
        <div className="psa-avatar-scanlines" aria-hidden />
        <span
          className={`psa-nudge-badge${isOpen ? ' psa-nudge-badge-active' : ''}`}
          aria-hidden
        />
      </div>
      <span className="psa-avatar-cta">{ctaLabel}</span>
      {ctaSubline ? <span className="psa-avatar-cta-subline">{ctaSubline}</span> : null}
    </button>
  );
}
