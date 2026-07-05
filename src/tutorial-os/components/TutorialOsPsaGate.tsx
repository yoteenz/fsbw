import PsaAssistantWidget from '../../components/psa/PsaAssistantWidget';
import { useTutorialOs } from '../TutorialOsContext';
import { isMenuToggleOpen, subscribeMenuToggleOpenState } from '../../utils/menuToggleOpenState';
import { useEffect, useState } from 'react';
import { isVisionPresentationActive } from '../../studio-os-core/vision-engine/session';
import { VISION_CHANGED_EVENT } from '../../studio-os-core/vision-engine/constants';

/** Hide PSA while Onboarding Tutorial welcome or Mansion Tour overlay is active, shop menu is open, or Vision Engine is running. */
export function TutorialOsPsaGate() {
  const { isTourActive, showWelcome } = useTutorialOs();
  const [menuToggleOpen, setMenuToggleOpen] = useState(() => isMenuToggleOpen());
  const [visionActive, setVisionActive] = useState(() => isVisionPresentationActive());

  useEffect(() => subscribeMenuToggleOpenState(setMenuToggleOpen), []);

  useEffect(() => {
    const sync = () => setVisionActive(isVisionPresentationActive());
    sync();
    window.addEventListener(VISION_CHANGED_EVENT, sync);
    return () => window.removeEventListener(VISION_CHANGED_EVENT, sync);
  }, []);

  if (isTourActive || showWelcome || menuToggleOpen || visionActive) return null;
  return <PsaAssistantWidget />;
}
