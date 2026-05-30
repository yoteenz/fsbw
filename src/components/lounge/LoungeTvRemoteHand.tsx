import { LOUNGE_TV_REMOTE_HAND_SRC } from './loungeTvAssets';

type LoungeTvRemoteHandProps = {
  visible: boolean;
};

/** Hand + remote composited at bottom of viewport (chroma-keyed asset). */
export function LoungeTvRemoteHand({ visible }: LoungeTvRemoteHandProps) {
  return (
    <img
      src={LOUNGE_TV_REMOTE_HAND_SRC}
      alt=""
      aria-hidden
      draggable={false}
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(max(10px, env(safe-area-inset-bottom, 0px)) - 20px)',
        width: 'min(38vw, 240px)',
        maxWidth: 'calc(100vw - 32px)',
        height: 'auto',
        maxHeight: 'min(26vh, 220px)',
        objectFit: 'contain',
        objectPosition: 'center bottom',
        zIndex: 108,
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(-38%, 0)' : 'translate(-38%, 10%)',
        transition: 'opacity 320ms ease, transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    />
  );
}
