import { useCallback, useState } from 'react';
import { useStudioOrb } from './StudioOrbProvider';
import { StudioOrb } from './StudioOrb';
import { StudioOrbRadialMenu } from './StudioOrbRadialMenu';
import { StudioOrbConversationBackdrop } from './StudioOrbConversationBackdrop';
import { StudioOrbPageGuide } from './StudioOrbPageGuide';
import { StudioOrbAwakeningOverlay } from './StudioOrbAwakeningOverlay';
import { CommandDockConversationPanel } from '../command-dock/CommandDock';
import { ORB_SIZE_PX } from './studioOrbTheme';

export function StudioOrbMount() {
  const { toggleRadial, radialOpen, position } = useStudioOrb();
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const handleOrbTap = useCallback(() => {
    const right = Math.max(position.right, 16);
    const bottom = Math.max(position.bottom, 20);
    const x = typeof window !== 'undefined' ? window.innerWidth - right - ORB_SIZE_PX / 2 : 0;
    const y =
      typeof window !== 'undefined' ? window.innerHeight - bottom - ORB_SIZE_PX / 2 : 0;
    setMenuAnchor({ x, y });
    toggleRadial();
  }, [toggleRadial, position]);

  return (
    <>
      <StudioOrbAwakeningOverlay />
      <StudioOrbConversationBackdrop />
      <StudioOrbPageGuide />
      <CommandDockConversationPanel />
      {radialOpen ? (
        <StudioOrbRadialMenu orbCenterX={menuAnchor.x} orbCenterY={menuAnchor.y - ORB_SIZE_PX * 0.35} />
      ) : null}
      <StudioOrb onOrbTap={handleOrbTap} />
    </>
  );
}
