import {
  getAdjacentForecastEditions,
  getForecastEditionById,
  getWhyItsMovingBullets,
  type ForecastEdition,
  type ForecastObservation,
} from '../../../../content/slay-forecast';
import { useSlayForecastBroadcastPackage } from '../../../../trend-intelligence/useSlayForecastBroadcastPackage';
import { loungeTvGlassCqw } from '../../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { useForecastIntelligence } from '../../../../trend-intelligence/useForecastIntelligence';
import { SlayForecastEditionNav } from './SlayForecastEditionNav';
import { SlayForecastHistorySection } from './SlayForecastHistorySection';
import { SlayForecastHubShell } from './SlayForecastHubShell';
import { SlayForecastObservationsSection } from './SlayForecastObservationsSection';
import { SlayForecastOnOurRadar } from './SlayForecastOnOurRadar';
import { SlayForecastPulsesSection } from './SlayForecastPulsesSection';
import { SlayForecastRealitySection } from './SlayForecastRealitySection';
import { getAllForecastSeasons } from '../../../../content/slay-forecast';
import { ForecastStatusBadge } from './ForecastStatusBadge';
import { forecastStatusDisplay } from './slayForecastPresentation';
import { SlayForecastBroadcastPlayer } from './SlayForecastBroadcastPlayer';
import { SlayForecastWeekSelectorRail } from './SlayForecastWeekSelectorRail';

type SlayForecastHubPanelProps = {
  editionId: string;
  onBack: () => void;
  onSelectEdition: (editionId: string) => void;
  onSelectSignal: (editionId: string, observation: ForecastObservation) => void;
  onOpenTrendReport?: (packId: string) => void;
  onViewForecastHistory?: () => void;
  showHistoryOnly?: boolean;
};

export function SlayForecastHubPanel({
  editionId,
  onBack,
  onSelectEdition,
  onSelectSignal,
  onOpenTrendReport,
  onViewForecastHistory,
  showHistoryOnly = false,
}: SlayForecastHubPanelProps) {
  const edition = getForecastEditionById(editionId);
  if (!edition) return null;

  if (showHistoryOnly) {
    return (
      <SlayForecastHubShell
        onBack={onBack}
        backLabel="< BACK TO FORECAST"
        railId="slay-forecast-history"
        title="FORECAST HISTORY"
        tagline="PREDICTIONS FROM PREVIOUS EDITIONS."
      >
        <SlayForecastHistorySection
          activeEditionId={editionId}
          onSelectEdition={onSelectEdition}
        />
      </SlayForecastHubShell>
    );
  }

  return (
    <SlayForecastHubPanelBody
      edition={edition}
      editionId={editionId}
      onBack={onBack}
      onSelectEdition={onSelectEdition}
      onSelectSignal={onSelectSignal}
      onOpenTrendReport={onOpenTrendReport}
      onViewForecastHistory={onViewForecastHistory}
    />
  );
}

function SlayForecastHubPanelBody({
  edition,
  editionId,
  onBack,
  onSelectEdition,
  onSelectSignal,
  onOpenTrendReport,
  onViewForecastHistory,
}: {
  edition: ForecastEdition;
  editionId: string;
  onBack: () => void;
  onSelectEdition: (editionId: string) => void;
  onSelectSignal: (editionId: string, observation: ForecastObservation) => void;
  onOpenTrendReport?: (packId: string) => void;
  onViewForecastHistory?: () => void;
}) {
  const { edition: displayEdition } = useForecastIntelligence(edition);
  const { package: broadcastPackage } = useSlayForecastBroadcastPackage(edition.slug);

  const adjacent = getAdjacentForecastEditions(editionId);
  if (!adjacent) return null;

  const allReality = getAllForecastSeasons().flatMap((s) => s.forecastReality);
  const relatedReportId = edition.relatedTrendReportIds[0];
  const whyBullets = getWhyItsMovingBullets(displayEdition);
  const fullBroadcastUrl = broadcastPackage?.fullBroadcastAsset?.trim();
  const isCurrentWeek = displayEdition.status === 'current' || displayEdition.isCurrent;

  return (
    <SlayForecastHubShell onBack={onBack} railId="slay-forecast-hub">
      <SlayForecastWeekSelectorRail
        activeEditionId={editionId}
        onSelectEdition={onSelectEdition}
      />

      <div
        className={[
          'lounge-tv-slay-forecast-hub__current-card',
          isCurrentWeek ? 'lounge-tv-slay-forecast-hub__current-card--live' : '',
          !isCurrentWeek ? 'lounge-tv-slay-forecast-hub__current-card--archival' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="lounge-tv-slay-forecast-hub__meta">
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l3,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            {isCurrentWeek ? 'CURRENT FORECAST' : 'FORECAST EDITION'} · {displayEdition.displayPeriod}
          </p>
        <p
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: LOUNGE_TV_TYPE.l1,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.04em',
            margin: `${loungeTvGlassCqw(0.25, 0.5, 1)} 0 0`,
            lineHeight: 1.1,
          }}
        >
          {displayEdition.headline}
        </p>
        {displayEdition.finalStatusLabel ? (
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.08em',
              margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
            }}
          >
            FINAL STATUS: {displayEdition.finalStatusLabel}
          </p>
        ) : null}
        </div>

      {fullBroadcastUrl || displayEdition.broadcastVideo ? (
        <section className="lounge-tv-slay-forecast-hub__broadcast-replay" aria-label="Replay PSA broadcast">
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.08em',
              margin: '0 0 0.35em',
            }}
          >
            PSA BROADCAST
          </p>
          <SlayForecastBroadcastPlayer
            edition={{
              ...displayEdition,
              broadcastVideo: fullBroadcastUrl ?? displayEdition.broadcastVideo,
            }}
            autoplayOnMount={false}
            focusIdPrefix="hub-slay-forecast-broadcast"
            compact
            packageTimeline={
              broadcastPackage?.broadcastTimeline
                ? {
                    openingEnd: broadcastPackage.broadcastTimeline.openingEnd,
                    closingStart: broadcastPackage.broadcastTimeline.closingStart,
                    signals: broadcastPackage.broadcastTimeline.signals,
                  }
                : undefined
            }
          />
        </section>
      ) : null}

      <SlayForecastEditionNav
        previous={adjacent.previous}
        current={adjacent.current}
        next={adjacent.next}
        onSelectEdition={onSelectEdition}
        highlightCurrent={isCurrentWeek}
      />

      {displayEdition.outlook ? (
        <section className="lounge-tv-slay-forecast-hub__outlook" aria-label="The outlook">
          <h3
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l2,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            THE OUTLOOK
          </h3>
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_TYPE.l3,
              color: 'rgba(255,255,255,0.84)',
              letterSpacing: '0.02em',
              margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
              lineHeight: 1.45,
              maxWidth: '52ch',
              textTransform: 'none',
            }}
          >
            {displayEdition.outlook}
          </p>
        </section>
      ) : null}

      {displayEdition.momentum ? (
        <section className="lounge-tv-slay-forecast-hub__momentum" aria-label="Forecast momentum">
          <h3
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l2,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            MOMENTUM
          </h3>
          <div
            style={{
              marginTop: loungeTvGlassCqw(0.35, 0.8, 1.6),
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
            }}
          >
            <ForecastStatusBadge status={displayEdition.momentum} />
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.06em',
              }}
            >
              {forecastStatusDisplay(displayEdition.momentum)}
            </span>
          </div>
        </section>
      ) : null}

      <SlayForecastObservationsSection
        edition={displayEdition}
        onSelectObservation={(observation) => onSelectSignal(displayEdition.id, observation)}
        onOpenTrendReport={onOpenTrendReport}
      />

      <SlayForecastPulsesSection edition={displayEdition} />

      {whyBullets.length > 0 ? (
        <section className="lounge-tv-slay-forecast-hub__why" aria-label="Why we called it">
          <h3
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l2,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            WHY WE CALLED IT
          </h3>
          <ul className="lounge-tv-slay-forecast-hub__why-list">
            {whyBullets.map((bullet) => (
              <li
                key={bullet}
                style={{
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: LOUNGE_TV_TYPE.l3,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.02em',
                  lineHeight: 1.4,
                  textTransform: 'none',
                }}
              >
                {bullet}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedReportId && onOpenTrendReport ? (
        <section className="lounge-tv-slay-forecast-related-report" aria-label="Related trend report">
          <h3
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l2,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            DEEPER READ
          </h3>
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_TYPE.l3,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.02em',
              margin: `${loungeTvGlassCqw(0.25, 0.55, 1.1)} 0 0`,
              lineHeight: 1.4,
              maxWidth: '48ch',
              textTransform: 'none',
            }}
          >
            Trend Reports answer what is happening and why. Explore the editorial intelligence behind
            this forecast.
          </p>
          <button
            type="button"
            className="lounge-tv-slay-forecast-related-report__cta"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id="forecast-related-trend-report"
            onClick={() => onOpenTrendReport(relatedReportId)}
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l3,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.06em',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              marginTop: '0.45em',
            }}
          >
            READ TREND REPORT →
          </button>
        </section>
      ) : null}

      {displayEdition.radarSignals?.length ? (
        <SlayForecastOnOurRadar signals={displayEdition.radarSignals} />
      ) : null}

      <SlayForecastHistorySection
        activeEditionId={editionId}
        onSelectEdition={onSelectEdition}
        onViewAllHistory={onViewForecastHistory}
        compact
      />

      {allReality.length > 0 ? <SlayForecastRealitySection entries={allReality} /> : null}
      </div>
    </SlayForecastHubShell>
  );
}
