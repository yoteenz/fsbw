import { useCallback, useLayoutEffect, useState } from 'react';
import { STUDIO_ORB_RADIAL_ACTIONS, type StudioOrbRadialActionId } from './studioOrbTypes';
import {
  computeRadialMenuLayout,
  measureOrbCenterFromDom,
  readViewportRect,
  type RadialMenuLayout,
} from './studioOrbRadialLayout';
import { useStudioOrb } from './StudioOrbProvider';
import { useGlobalAtlasLayerOptional } from '../global-atlas';
import { OrbIconSculpture } from './OrbIconSculptures';
import { StudioOrbProjectionItem } from './StudioOrbProjectionItem';

const PRIMARY_ACTIONS: StudioOrbRadialActionId[] = [
  'world-atlas',
  'command-dock',
  'notifications',
  'page-guide',
  'voice',
];

type Props = {
  orbCenterX: number;
  orbCenterY: number;
};

/** Orb Projections™ — holographic glass manifestations, not app shortcuts. */
export function StudioOrbRadialMenu({ orbCenterX, orbCenterY }: Props) {
  const {
    radialOpen,
    closeRadial,
    openCommandDock,
    openPageGuide,
    openLifeCulture,
    openVoiceMode,
    openRecommendations,
  } = useStudioOrb();
  const globalAtlas = useGlobalAtlasLayerOptional();
  const enabledActions = STUDIO_ORB_RADIAL_ACTIONS.filter(
    (a) => a.enabled && PRIMARY_ACTIONS.includes(a.id)
  );

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
    if (id === 'world-atlas') {
      globalAtlas?.openAtlas();
      closeRadial();
    } else if (id === 'command-dock') openCommandDock();
    else if (id === 'notifications') openRecommendations();
    else if (id === 'page-guide') openPageGuide();
    else if (id === 'life-culture') openLifeCulture();
    else if (id === 'voice') openVoiceMode();
    else closeRadial();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close Studio Orb projections"
        className="fixed inset-0 z-[100045]"
        style={{ background: 'transparent', border: 'none', cursor: 'default' }}
        onClick={closeRadial}
      />
      <div
        className="fixed z-[100049] pointer-events-none studio-orb-radial-menu-root"
        aria-label="Studio Orb projections"
        role="menu"
        data-layout={layout.mode}
      >
        {enabledActions.map((action, index) => {
          const pos = layout.items[index];
          if (!pos) return null;
          return (
            <StudioOrbProjectionItem
              key={action.id}
              label={action.label}
              icon={<OrbIconSculpture iconId={action.iconId} size={30} />}
              index={index}
              style={{
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => handleAction(action.id)}
            />
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
