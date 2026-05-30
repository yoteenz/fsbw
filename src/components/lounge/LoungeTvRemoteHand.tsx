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
        bottom: 0,
        right: 'max(0px, calc(50% - 210px))',
        width: 'min(62vw, 400px)',
        height: 'auto',
        maxHeight: '42vh',
        objectFit: 'contain',
        objectPosition: 'right bottom',
        zIndex: 108,
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10%)',
        transition: 'opacity 320ms ease, transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    />
  );
}
