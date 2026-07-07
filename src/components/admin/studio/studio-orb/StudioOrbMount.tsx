import { useCallback } from 'react';
import { useStudioOrb } from './StudioOrbProvider';
import { StudioOrb } from './StudioOrb';
import { StudioOrbRadialMenu } from './StudioOrbRadialMenu';
import { StudioOrbConversationBackdrop } from './StudioOrbConversationBackdrop';
import { StudioOrbPageGuide } from './StudioOrbPageGuide';
import { StudioOrbLifeCulturePanel } from './StudioOrbLifeCulturePanel';
import { StudioOrbVoicePanel } from './StudioOrbVoicePanel';
import { CommandDockConversationPanel } from '../command-dock/CommandDock';
import { measureOrbCenterFromDom } from './studioOrbRadialLayout';

export function StudioOrbMount() {
  const { toggleRadial, radialOpen, menuAnchor, setMenuAnchor } = useStudioOrb();

  const handleOrbTap = useCallback(() => {
    const measured = measureOrbCenterFromDom();
    if (measured) {
      setMenuAnchor(measured);
    }
    toggleRadial();
  }, [toggleRadial, setMenuAnchor]);

  return (
    <>
      <StudioOrbConversationBackdrop />
      <StudioOrbPageGuide />
      <StudioOrbLifeCulturePanel />
      <StudioOrbVoicePanel />
      <CommandDockConversationPanel />
      {radialOpen ? (
        <StudioOrbRadialMenu orbCenterX={menuAnchor.x} orbCenterY={menuAnchor.y} />
      ) : null}
      <StudioOrb onOrbTap={handleOrbTap} />
    </>
  );
}
