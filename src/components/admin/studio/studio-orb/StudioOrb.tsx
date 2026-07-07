import { ORB_ANIMATION_CSS } from './studioOrbTheme';
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
      </button>
    </>
  );
}
