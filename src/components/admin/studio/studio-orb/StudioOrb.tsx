import { ORB_ANIMATION_CSS, ORB_SIZE_PX } from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';

type Props = {
  onOrbTap: () => void;
};

/** Studio Orb™ — crystal intelligence presence · bottom-right safe area. */
export function StudioOrb({ onOrbTap }: Props) {
  const { presenceState, position, ambientInsight, radialOpen, activeSurface } = useStudioOrb();
  const stateClass = `studio-orb-state-${presenceState}`;
  const hasAmbient = Boolean(ambientInsight) && !activeSurface;

  return (
    <>
      <style>{ORB_ANIMATION_CSS}</style>
      <button
        type="button"
        className={`studio-orb-root ${stateClass}`}
        style={{
          bottom: `max(${position.bottom}px, env(safe-area-inset-bottom))`,
          right: `max(${position.right}px, env(safe-area-inset-right))`,
          width: ORB_SIZE_PX,
          height: ORB_SIZE_PX,
        }}
        onClick={onOrbTap}
        aria-label={
          radialOpen
            ? 'Close Studio Orb menu'
            : hasAmbient
              ? `Studio Intelligence — ${ambientInsight}`
              : 'Open Studio Orb'
        }
        aria-expanded={radialOpen || Boolean(activeSurface)}
        data-studio-orb="true"
      >
        <span className="studio-orb-chrome-ring" aria-hidden />
        <span className="studio-orb-crystal" aria-hidden />
        {hasAmbient ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: '1px solid rgba(235,28,36,0.35)',
              pointerEvents: 'none',
            }}
          />
        ) : null}
      </button>
    </>
  );
}
