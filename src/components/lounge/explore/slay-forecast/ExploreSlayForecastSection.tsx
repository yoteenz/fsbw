import { useState } from 'react';
import {
  getCurrentForecastEdition,
  getForecastEditionById,
} from '../../../../content/slay-forecast';
import { ExploreFranchiseSection } from '../ExploreFranchiseSection';
import { SlayForecastExploreHero } from './SlayForecastExploreHero';

type ExploreSlayForecastSectionProps = {
  onOpenForecast: (editionId?: string) => void;
  onOpenSignal: (seasonId: string, signalId: string) => void;
};

export function ExploreSlayForecastSection({
  onOpenForecast,
}: ExploreSlayForecastSectionProps) {
  const currentEdition = getCurrentForecastEdition();
  const [selectedEditionId, setSelectedEditionId] = useState(
    () => currentEdition?.id ?? '',
  );

  const edition =
    getForecastEditionById(selectedEditionId) ?? currentEdition;
  if (!edition) return null;

  const openHub = () => onOpenForecast(edition.id);

  return (
    <ExploreFranchiseSection franchise="slay-forecast" ariaLabel="Slay Forecast">
      <div className="lounge-tv-slay-forecast-explore lounge-tv-slay-forecast-explore--dashboard">
        <SlayForecastExploreHero
          edition={edition}
          onSelectEdition={setSelectedEditionId}
          onEnterForecast={openHub}
        />
      </div>
    </ExploreFranchiseSection>
  );
}

export { SlayForecastOrb, ForecastOrb } from './SlayForecastOrb';
