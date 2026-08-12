import { useMemo, useRef } from 'react';
import type { ForecastEdition } from '../../../../content/slay-forecast';
import { getAdjacentForecastEditions } from '../../../../content/slay-forecast';
import { useForecastIntelligence } from '../../../../trend-intelligence/useForecastIntelligence';
import { useSlayForecastBroadcastPackage } from '../../../../trend-intelligence/useSlayForecastBroadcastPackage';
import {
  SlayForecastBroadcastPlayer,
  type SlayForecastBroadcastPlayerHandle,
} from './SlayForecastBroadcastPlayer';
import { SlayForecastExploreNavRow } from './SlayForecastExploreNavRow';
import {
  SlayForecastSequencePlayer,
  type SlayForecastSequencePlayerHandle,
} from './SlayForecastSequencePlayer';
import { SlayForecastExploreDashboard } from './SlayForecastExploreDashboard';

type SlayForecastExploreHeroProps = {
  edition: ForecastEdition;
  onSelectEdition: (editionId: string) => void;
  onEnterForecast: () => void;
};

/** Explore compact — video first, nav row, then weather-style dashboard. */
export function SlayForecastExploreHero({
  edition,
  onSelectEdition,
  onEnterForecast,
}: SlayForecastExploreHeroProps) {
  const { edition: displayEdition } = useForecastIntelligence(edition);
  const { package: broadcastPackage } = useSlayForecastBroadcastPackage(edition.slug);
  const adjacent = getAdjacentForecastEditions(edition.id);
  const playerRef = useRef<SlayForecastBroadcastPlayerHandle>(null);
  const sequenceRef = useRef<SlayForecastSequencePlayerHandle>(null);

  const packageTimeline = useMemo(
    () =>
      broadcastPackage?.broadcastTimeline
        ? {
            openingEnd: broadcastPackage.broadcastTimeline.openingEnd,
            closingStart: broadcastPackage.broadcastTimeline.closingStart,
            signals: broadcastPackage.broadcastTimeline.signals,
          }
        : undefined,
    [broadcastPackage],
  );

  if (!adjacent) return null;

  const hasSequence =
    !broadcastPackage?.fullBroadcastAsset &&
    Boolean(broadcastPackage?.openingAsset) &&
    Boolean(broadcastPackage?.restingAsset) &&
    Boolean(broadcastPackage?.closingAsset);

  const fullBroadcastUrl = broadcastPackage?.fullBroadcastAsset?.trim();

  const handleViewPreviousWeek = () => {
    if (adjacent.previous) onSelectEdition(adjacent.previous.id);
  };

  return (
    <div className="lounge-tv-slay-forecast-explore-hero">
      <div className="lounge-tv-slay-forecast-explore-hero__broadcast">
        {fullBroadcastUrl ? (
          <SlayForecastBroadcastPlayer
            ref={playerRef}
            edition={{
              ...displayEdition,
              broadcastVideo: fullBroadcastUrl,
              broadcastPoster: displayEdition.broadcastPoster,
            }}
            autoplayOnMount={false}
            focusIdPrefix="explore-slay-forecast-broadcast"
            packageTimeline={packageTimeline}
          />
        ) : hasSequence ? (
          <SlayForecastSequencePlayer
            ref={sequenceRef}
            edition={displayEdition}
            broadcastPackage={broadcastPackage!}
            autoplayOnMount={false}
            focusIdPrefix="explore-slay-forecast-broadcast"
          />
        ) : (
          <SlayForecastBroadcastPlayer
            ref={playerRef}
            edition={displayEdition}
            autoplayOnMount={false}
            focusIdPrefix="explore-slay-forecast-broadcast"
            packageTimeline={packageTimeline}
          />
        )}
      </div>

      <SlayForecastExploreNavRow
        hasPreviousWeek={Boolean(adjacent.previous)}
        onViewPreviousWeek={handleViewPreviousWeek}
        onViewAllForecasts={onEnterForecast}
      />

      <SlayForecastExploreDashboard edition={displayEdition} />
    </div>
  );
}
