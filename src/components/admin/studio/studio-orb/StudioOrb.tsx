import { ORB_ANIMATION_CSS } from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';

type Props = {
  onOrbTap: () => void;
};

/**
 * Studio Orb™ — optical acrylic intelligence artifact.
 * Museum-grade material · Living Light™ · not a button.
 */
export function StudioOrb({ onOrbTap }: Props) {
  const { presenceState, position, ambientInsight, radialOpen, activeSurface } = useStudioOrb();
  const stateClass = `studio-orb-state-${presenceState}`;
  const hasAmbient = Boolean(ambientInsight) && !activeSurface;

  return (
    <>
      <style>{ORB_ANIMATION_CSS}</style>
      <button
        type="button"
        className={`studio-orb-root ${stateClass}${radialOpen ? ' studio-orb-radial-open' : ''}`}
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
        <span className="studio-orb-shell-outer" aria-hidden />
        <span className="studio-orb-event-ring" aria-hidden />
        <span className="studio-orb-chrome-micro-ring" aria-hidden />
        <span className="studio-orb-acrylic-core" aria-hidden>
          <span className="studio-orb-volumetric-glow" />
          <span className="studio-orb-caustic" />
          <span className="studio-orb-refraction" />
          <span className="studio-orb-particle-field" />
          <span className="studio-orb-inner-bloom" />
          <span className="studio-orb-lens" />
        </span>
      </button>
    </>
  );
}
