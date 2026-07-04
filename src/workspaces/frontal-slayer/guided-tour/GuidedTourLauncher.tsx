import { useGuidedTourOptional } from './GuidedTourContext';
import { canShowGuidedTourLauncher } from './mode';

type GuidedTourLauncherProps = {
  onStartRecord: () => void;
};

/** Permanent ✨ Guided Tour entry — visible when tour is available (preview / token / session). */
export function GuidedTourLauncher({ onStartRecord }: GuidedTourLauncherProps) {
  const tour = useGuidedTourOptional();

  if (!canShowGuidedTourLauncher()) return null;
  if (tour?.presentationActive) return null;

  const start = () => tour?.startGuidedTour();
  const startPartner = () => tour?.startGuidedTour({ creativePartner: true });

  return (
    <div className="guided-tour-launcher" aria-label="Guided Tour controls">
      <button type="button" className="guided-tour-launcher__btn guided-tour-launcher__btn--primary" onClick={start}>
        ✨ Guided Tour
      </button>
      <button type="button" className="guided-tour-launcher__btn" onClick={startPartner}>
        🎨 Creative Partner
      </button>
      <button type="button" className="guided-tour-launcher__btn" onClick={onStartRecord}>
        🎥 Record
      </button>
    </div>
  );
}
