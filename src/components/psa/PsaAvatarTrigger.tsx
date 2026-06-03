import { useEffect, useState } from 'react';
import {
  PSA_AVATAR_IDLE_SRC,
  PSA_AVATAR_THINKING_SRC,
  PSA_WIDGET_LABEL,
  PSA_WIDGET_SUBLABEL,
} from '../../constants/psaConfig';

type PsaAvatarTriggerProps = {
  onClick: () => void;
  isOpen: boolean;
  isThinking?: boolean;
  'aria-label'?: string;
};

export default function PsaAvatarTrigger({
  onClick,
  isOpen,
  isThinking = false,
  'aria-label': ariaLabel = 'Open Personal Slay Assistant',
}: PsaAvatarTriggerProps) {
  const [imgSrc, setImgSrc] = useState(PSA_AVATAR_IDLE_SRC);

  useEffect(() => {
    setImgSrc(isThinking ? PSA_AVATAR_THINKING_SRC : PSA_AVATAR_IDLE_SRC);
  }, [isThinking]);

  const handleImgError = () => {
    if (imgSrc !== PSA_AVATAR_IDLE_SRC) {
      setImgSrc(PSA_AVATAR_IDLE_SRC);
      return;
    }
    setImgSrc('/assets/profile-thumb.png');
  };

  return (
    <button
      type="button"
      className="psa-avatar-trigger"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      <div className="psa-avatar-frame">
        <img
          className="psa-avatar-img"
          src={isThinking ? PSA_AVATAR_THINKING_SRC : imgSrc}
          alt=""
          onError={handleImgError}
        />
        <div className="psa-avatar-scanlines" aria-hidden />
      </div>
      <span className="psa-avatar-label">
        {PSA_WIDGET_LABEL}
        <span className="psa-avatar-sublabel">{PSA_WIDGET_SUBLABEL}</span>
      </span>
    </button>
  );
}
