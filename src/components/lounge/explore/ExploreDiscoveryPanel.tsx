import type { ExploreSectionCommonProps } from './exploreTypes';
import { ExploreTrendReportsSection } from './ExploreTrendReportsSection';
import { ExploreSlayForecastSection } from './slay-forecast/ExploreSlayForecastSection';
import { ExploreSlayCamSection } from './ExploreSlayCamSection';
import { ExploreProductRevealsSection } from './ExploreProductRevealsSection';
import { ExploreBrandFilmsSection } from './ExploreBrandFilmsSection';
import { ExploreBehindBrandSection } from './ExploreBehindBrandSection';
import { ExploreArchiveSection } from './ExploreArchiveSection';

type ExploreDiscoveryPanelProps = ExploreSectionCommonProps & {
  onOpenSlayForecastSignal?: (seasonId: string, signalId: string) => void;
};

/** Editorial Explore network — franchise sections in programming order. */
export function ExploreDiscoveryPanel({
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
  onNavigateSection,
  onOpenSlayForecast,
  onOpenSlayForecastSignal,
}: ExploreDiscoveryPanelProps) {
  const common = { onSelect, onToggleSave, isUnlocked, unlocks, onNavigateSection, onOpenSlayForecast };

  return (
    <div className="lounge-tv-explore-root lounge-tv-explore-network">
      {onOpenSlayForecast && onOpenSlayForecastSignal ? (
        <ExploreSlayForecastSection
          onOpenForecast={onOpenSlayForecast}
          onOpenSignal={onOpenSlayForecastSignal}
        />
      ) : null}
      <ExploreTrendReportsSection {...common} />
      <ExploreSlayCamSection {...common} />
      <ExploreProductRevealsSection {...common} />
      <ExploreBrandFilmsSection {...common} />
      <ExploreBehindBrandSection {...common} />
      <ExploreArchiveSection onNavigateSection={onNavigateSection} onSelect={onSelect} />
    </div>
  );
}
