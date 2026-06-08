import { useEffect, useState, type CSSProperties } from 'react';
import { PSA_NUDGE_BUBBLE_SRC } from '../../constants/psaConfig';

type PsaNudgeChipProps = {
  headline: string;
  body?: string;
  onClick: () => void;
  ariaLabel: string;
  showChat?: boolean;
};

/** Inline layout so the chip stays above the FAB even if psaAssistant.css is late (SPA / stale chunk). */
const CHIP_BASE_STYLE: CSSProperties = {
  position: 'absolute',
  right: 0,
  left: 'auto',
  bottom: '100%',
  marginBottom: -9,
  width: 'min(120px, 37vw)',
  padding: 0,
  border: 'none',
  backgroundColor: 'transparent',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: 'contain',
  cursor: 'pointer',
  textAlign: 'center',
  zIndex: 2,
  overflow: 'hidden',
  display: 'block',
  transform: 'none',
  WebkitTapHighlightColor: 'transparent',
};

const CHIP_SHOW_CHAT_STYLE: CSSProperties = {
  bottom: -24,
  marginBottom: 0,
};

const CONTENT_STYLE: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: 'calc(36% + 8px)',
  transform: 'translate(-50%, -50%)',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  width: '58%',
  maxWidth: 84,
  padding: '0 4px',
  pointerEvents: 'none',
  textAlign: 'center',
};

const HEADLINE_STYLE: CSSProperties = {
  fontFamily: "'Bohemy', sans-serif",
  fontSize: 11,
  color: '#000',
  textTransform: 'lowercase',
  fontWeight: 400,
  lineHeight: 1.15,
  textAlign: 'center',
  position: 'relative',
  top: 2,
};

const SHOW_CHAT_HEADLINE_STYLE: CSSProperties = {
  ...HEADLINE_STYLE,
  top: 4,
  fontSize: 14,
};

const BODY_STYLE: CSSProperties = {
  fontFamily: "'Futura PT Demi', futuristic-pt, Futura, Inter, sans-serif",
  fontSize: 5,
  color: '#eb1c24',
  textTransform: 'uppercase',
  lineHeight: 1.3,
  textAlign: 'center',
};

export default function PsaNudgeChip({
  headline,
  body,
  onClick,
  ariaLabel,
  showChat = false,
}: PsaNudgeChipProps) {
  const [bubbleReady, setBubbleReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    const done = () => {
      if (!cancelled) setBubbleReady(true);
    };
    img.onload = done;
    img.onerror = done;
    img.src = PSA_NUDGE_BUBBLE_SRC;
    if (img.decode) {
      void img.decode().then(done).catch(done);
    } else if (img.complete) {
      done();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  if (!bubbleReady) {
    return null;
  }

  return (
    <button
      type="button"
      className={`psa-nudge-chip${showChat ? ' psa-nudge-chip-show-chat' : ''}`}
      style={{
        ...CHIP_BASE_STYLE,
        ...(showChat ? CHIP_SHOW_CHAT_STYLE : null),
        backgroundImage: `url("${PSA_NUDGE_BUBBLE_SRC}")`,
        minHeight: showChat ? 56 : 68,
      }}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className="psa-nudge-chip-content" style={CONTENT_STYLE}>
        <span
          className="psa-nudge-chip-headline"
          style={showChat ? SHOW_CHAT_HEADLINE_STYLE : HEADLINE_STYLE}
        >
          {headline}
        </span>
        {body ? (
          <span className="psa-nudge-chip-body" style={BODY_STYLE}>
            {body}
          </span>
        ) : null}
      </span>
    </button>
  );
}
