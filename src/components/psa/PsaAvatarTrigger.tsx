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
  'aria-label'?: string;
};

export default function PsaAvatarTrigger({
  onClick,
  isOpen,
  idle = false,
  expression = PSA_AVATAR_DEFAULT_EXPRESSION,
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
      </div>
      <span className="psa-avatar-cta">{PSA_WIDGET_CTA}</span>
    </button>
  );
}
