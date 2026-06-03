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
  showNudgeBadge?: boolean;
  ctaLabel?: string;
  ctaSubline?: string | null;
  'aria-label'?: string;
};

export default function PsaAvatarTrigger({
  onClick,
  isOpen,
  idle = false,
  expression = PSA_AVATAR_DEFAULT_EXPRESSION,
  showNudgeBadge = false,
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
        {showNudgeBadge ? <span className="psa-nudge-badge" aria-hidden /> : null}
      </div>
      <span className="psa-avatar-cta">{ctaLabel}</span>
      {ctaSubline ? <span className="psa-avatar-cta-subline">{ctaSubline}</span> : null}
    </button>
  );
}
