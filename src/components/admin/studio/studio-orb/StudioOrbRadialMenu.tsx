import { STUDIO_ORB_RADIAL_ACTIONS, type StudioOrbRadialActionId } from './studioOrbTypes';
import { orbLabel, ORB_VISUAL } from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';

const PRIMARY_ACTIONS: StudioOrbRadialActionId[] = ['command-dock', 'page-guide'];

type Props = {
  orbCenterX: number;
  orbCenterY: number;
};

/** AssistiveTouch-inspired radial menu — tap Orb to expand, not immediate dock. */
export function StudioOrbRadialMenu({ orbCenterX, orbCenterY }: Props) {
  const { radialOpen, closeRadial, openCommandDock, openPageGuide } = useStudioOrb();
  if (!radialOpen) return null;

  const enabledActions = STUDIO_ORB_RADIAL_ACTIONS.filter((a) => a.enabled && PRIMARY_ACTIONS.includes(a.id));
  const radius = 72;

  const handleAction = (id: StudioOrbRadialActionId) => {
    if (id === 'command-dock') openCommandDock();
    else if (id === 'page-guide') openPageGuide();
    else closeRadial();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close Studio Orb menu"
        className="fixed inset-0 z-[100045]"
        style={{ background: 'transparent', border: 'none', cursor: 'default' }}
        onClick={closeRadial}
      />
      <div className="fixed z-[100048] pointer-events-none" style={{ left: orbCenterX, top: orbCenterY }}>
        {enabledActions.map((action, index) => {
          const angle = (index / enabledActions.length) * Math.PI - Math.PI * 0.85;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <button
              key={action.id}
              type="button"
              className="studio-radial-menu-item pointer-events-auto absolute flex flex-col items-center"
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${index * 40}ms`,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.7)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                borderRadius: 12,
                padding: '8px 10px',
                minWidth: 72,
                cursor: 'pointer',
              }}
              onClick={() => handleAction(action.id)}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{action.icon}</span>
              <span style={{ ...orbLabel, fontSize: '5px', marginTop: 4, color: ORB_VISUAL.text }}>{action.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Future expansion — full radial ring (disabled items visible as ghost nodes). */
export function StudioOrbRadialMenuFutureHint() {
  return null;
}
