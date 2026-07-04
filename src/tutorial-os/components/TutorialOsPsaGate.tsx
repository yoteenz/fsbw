import PsaAssistantWidget from '../../components/psa/PsaAssistantWidget';
import { useTutorialOs } from '../TutorialOsContext';

/** Hide PSA while FS Concierge welcome or Mansion Tour overlay is active. */
export function TutorialOsPsaGate() {
  const { isTourActive, showWelcome } = useTutorialOs();
  if (isTourActive || showWelcome) return null;
  return <PsaAssistantWidget />;
}
