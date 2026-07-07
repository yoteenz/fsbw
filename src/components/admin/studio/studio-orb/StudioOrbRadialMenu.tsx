import { useCallback, useLayoutEffect, useState } from 'react';
import { STUDIO_ORB_RADIAL_ACTIONS, type StudioOrbRadialActionId } from './studioOrbTypes';
import {
  computeRadialMenuLayout,
  measureOrbCenterFromDom,
  readViewportRect,
  type RadialMenuLayout,
} from './studioOrbRadialLayout';
import { orbLabel, ORB_VISUAL } from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';

const PRIMARY_ACTIONS: StudioOrbRadialActionId[] = ['command-dock', 'page-guide', 'life-culture'];

type Props = {
  /** Initial orb center from mount — refreshed from DOM on open. */
  orbCenterX: number;
  orbCenterY: number;
};

const itemShellStyle = {
  background: 'rgba(255,255,255,0.9)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: '8px 10px',
  minWidth: 72,
  cursor: 'pointer',
} as const;

/** AssistiveTouch-inspired radial menu — viewport-aware, never clipped. */
export function StudioOrbRadialMenu({ orbCenterX, orbCenterY }: Props) {
  const { radialOpen, closeRadial, openCommandDock, openPageGuide, openLifeCulture } = useStudioOrb();
  const enabledActions = STUDIO_ORB_RADIAL_ACTIONS.filter((a) => a.enabled && PRIMARY_ACTIONS.includes(a.id));

  const [layout, setLayout] = useState<RadialMenuLayout>(() =>
    computeRadialMenuLayout(orbCenterX, orbCenterY, enabledActions.length)
  );

  const refreshLayout = useCallback(() => {
    const measured = measureOrbCenterFromDom();
    const ax = measured?.x ?? orbCenterX;
    const ay = measured?.y ?? orbCenterY;
    setLayout(computeRadialMenuLayout(ax, ay, enabledActions.length, readViewportRect()));
  }, [enabledActions.length, orbCenterX, orbCenterY]);

  useLayoutEffect(() => {
    if (!radialOpen) return;
    refreshLayout();

    const vv = window.visualViewport;
    const onViewportChange = () => refreshLayout();
    vv?.addEventListener('resize', onViewportChange);
    vv?.addEventListener('scroll', onViewportChange);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);

    return () => {
      vv?.removeEventListener('resize', onViewportChange);
      vv?.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('orientationchange', onViewportChange);
    };
  }, [radialOpen, refreshLayout]);

  if (!radialOpen) return null;

  const handleAction = (id: StudioOrbRadialActionId) => {
    if (id === 'command-dock') openCommandDock();
    else if (id === 'page-guide') openPageGuide();
    else if (id === 'life-culture') openLifeCulture();
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
      <div
        className="fixed z-[100049] pointer-events-none studio-orb-radial-menu-root"
        aria-label="Studio Orb quick actions"
        role="menu"
        data-layout={layout.mode}
      >
        {enabledActions.map((action, index) => {
          const pos = layout.items[index];
          if (!pos) return null;
          return (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className="studio-radial-menu-item pointer-events-auto fixed flex flex-col items-center"
              style={{
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${index * 40}ms`,
                ...itemShellStyle,
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
