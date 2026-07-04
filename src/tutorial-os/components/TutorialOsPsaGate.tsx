import PsaAssistantWidget from '../../components/psa/PsaAssistantWidget';
import { useTutorialOs } from '../TutorialOsContext';
import { isMenuToggleOpen, subscribeMenuToggleOpenState } from '../../utils/menuToggleOpenState';
import { useEffect, useState } from 'react';

/** Hide PSA while Onboarding Tutorial welcome or Mansion Tour overlay is active, or shop menu is open. */
export function TutorialOsPsaGate() {
  const { isTourActive, showWelcome } = useTutorialOs();
  const [menuToggleOpen, setMenuToggleOpen] = useState(() => isMenuToggleOpen());

  useEffect(() => subscribeMenuToggleOpenState(setMenuToggleOpen), []);

  if (isTourActive || showWelcome || menuToggleOpen) return null;
  return <PsaAssistantWidget />;
}
