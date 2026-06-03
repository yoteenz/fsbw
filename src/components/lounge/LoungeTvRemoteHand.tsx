import { LOUNGE_TV_REMOTE_HAND_SRC } from './loungeTvAssets';

/** Nudge hand + remote horizontally under the TV bezel. */
const LOUNGE_TV_REMOTE_HAND_OFFSET_X_PX = 12;

type LoungeTvRemoteHandProps = {
  visible: boolean;
  /** Fade/slide in after TV grow. */
  revealDurationMs?: number;
  /** Fade/slide out after power-off screen is black. */
  hideDurationMs?: number;
  onLoaded?: () => void;
};

/** Hand + remote composited at bottom of viewport (chroma-keyed asset). */
export function LoungeTvRemoteHand({
  visible,
  revealDurationMs = 1400,
  hideDurationMs = 1400,
  onLoaded,
}: LoungeTvRemoteHandProps) {
  const durationMs = visible ? revealDurationMs : hideDurationMs;
  const transition = `opacity ${durationMs}ms ease, transform ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <img
      src={LOUNGE_TV_REMOTE_HAND_SRC}
      alt=""
      aria-hidden
      draggable={false}
      onLoad={onLoaded}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 'calc(max(10px, env(safe-area-inset-bottom, 0px)) - 32px)',
        width: 'min(38%, 240px)',
        maxWidth: 'calc(100% - 32px)',
        height: 'auto',
        maxHeight: 'min(26%, 220px)',
        objectFit: 'contain',
        objectPosition: 'center bottom',
        zIndex: 108,
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: visible ? 1 : 0,
        transform: visible
          ? `translate(calc(-38% + ${LOUNGE_TV_REMOTE_HAND_OFFSET_X_PX}px), 0)`
          : `translate(calc(-38% + ${LOUNGE_TV_REMOTE_HAND_OFFSET_X_PX}px), 12%)`,
        transition,
      }}
    />
  );
}
