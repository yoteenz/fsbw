import type { SyntheticEvent } from 'react';
import {
  getPsaAvatarSrc,
  PSA_AVATAR_DEFAULT_EXPRESSION,
  PSA_AVATAR_FALLBACK_SRC,
  PSA_WIDGET_CTA,
  type PsaAvatarExpression,
} from '../../constants/psaConfig';

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
  const primarySrc = getPsaAvatarSrc(expression);

  const handleImgError = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src.includes('profile-thumb.png')) return;
    const neutralBase = PSA_AVATAR_FALLBACK_SRC;
    if (!img.src.includes(neutralBase.replace(/^\//, ''))) {
      img.src = getPsaAvatarSrc('neutral');
      return;
    }
    img.src = '/assets/profile-thumb.png';
  };

  return (
    <button
      type="button"
      className="psa-avatar-trigger"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      <div className={`psa-avatar-frame${idle ? ' psa-avatar-idle' : ''}`}>
        <img
          key={expression}
          className="psa-avatar-img"
          src={primarySrc}
          alt=""
          onError={handleImgError}
        />
        <div className="psa-avatar-scanlines" aria-hidden />
      </div>
      <span className="psa-avatar-cta">{PSA_WIDGET_CTA}</span>
    </button>
  );
}
