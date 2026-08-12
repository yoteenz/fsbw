import { useCallback, useId, useMemo, useState } from 'react';
import {
  listMasteryTrackPresentations,
  PSA_TODAY_LEARN_UMBRELLA,
} from '../../../content/education/hierarchy/masteryTracks';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LearnMasterySelector } from './LearnMasterySelector';
import { LearnSectionNavHeader } from './LearnSectionNavHeader';
import { PsaTodayCompactBrowser } from './PsaTodayCompactBrowser';
import type { LearnSectionSurface } from './learnHubTypes';
import { LEARN_HUB_NAV_FOCUS_IDS } from './learnHubTypes';
import {
  LearnSectionHeaderRow,
  LearnSectionViewAllToggle,
} from './LearnBrowseChrome';

type PsaTodayLearnSectionProps = {
  onSelectMastery: (masteryId: string) => void;
  onSelectEpisode?: (episodeId: string) => void;
  onOpenHub?: () => void;
  surface?: LearnSectionSurface;
};

function formatPsaTodaySeriesMeta(seriesCount: number, episodeCount: number): string {
  const seriesLabel = `${seriesCount} SERIES`;
  const episodeLabel = `${episodeCount} EPISODE${episodeCount === 1 ? '' : 'S'}`;
  return `${seriesLabel} · ${episodeLabel}`;
}

export function PsaTodayLearnSection({
  onSelectMastery,
  onOpenHub,
  surface = 'compact',
}: PsaTodayLearnSectionProps) {
  const seriesRegionId = useId();
  const [seriesExpanded, setSeriesExpanded] = useState(false);
  const tracks = useMemo(() => listMasteryTrackPresentations(), []);
  const totalEpisodes = useMemo(
    () => tracks.reduce((sum, track) => sum + track.episodeCount, 0),
    [tracks],
  );

  const toggleSeriesExpanded = useCallback(() => {
    setSeriesExpanded((prev) => !prev);
  }, []);

  const handlePosterMasterySelect = useCallback((_masteryId: string) => {
    setSeriesExpanded(true);
  }, []);

  if (surface === 'hub') {
    return (
      <section
        data-lounge-tv-rail="learn-hub-psa-today-masteries"
        className="lounge-tv-psa-today-hub-masteries"
        style={{ width: '100%', minWidth: 0 }}
      >
        <LearnMasterySelector onSelectMastery={onSelectMastery} viewMode="poster" />
      </section>
    );
  }

  return (
    <section
      data-lounge-tv-rail="learn-masteries"
      className="lounge-tv-psa-today-series"
      style={{ width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
    >
      <LearnSectionNavHeader
        title={PSA_TODAY_LEARN_UMBRELLA.title}
        tagline={PSA_TODAY_LEARN_UMBRELLA.tagline}
        onNavigate={onOpenHub}
        focusId={LEARN_HUB_NAV_FOCUS_IDS['psa-today']}
        taglineSpacing="education"
      />

      <LearnSectionHeaderRow
        meta={formatPsaTodaySeriesMeta(tracks.length, totalEpisodes)}
        toggle={
          <LearnSectionViewAllToggle
            expanded={seriesExpanded}
            onToggle={toggleSeriesExpanded}
            expandLabel="VIEW ALL SERIES >"
            collapseLabel="COLLAPSE ALL SERIES"
            focusId="learn-psa-today-series-toggle"
            controlsId={seriesRegionId}
          />
        }
      />

      <div
        id={seriesRegionId}
        className={[
          'lounge-tv-psa-today-compact-shell',
          seriesExpanded ? 'lounge-tv-psa-today-compact-shell--expanded' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ marginTop: loungeTvGlassCqw(0.65, 1.5, 3) }}
        data-lounge-tv-psa-today-expanded={seriesExpanded ? 'true' : 'false'}
      >
        {seriesExpanded ? (
          <PsaTodayCompactBrowser />
        ) : (
          <LearnMasterySelector onSelectMastery={handlePosterMasterySelect} viewMode="poster" />
        )}
      </div>
    </section>
  );
}
