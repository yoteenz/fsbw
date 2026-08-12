import {
  formatForecastSeasonLabel,
  formatForecastUpdatedLabel,
  getForecastSeasonById,
  getForecastSignalInSeason,
  type ForecastSignal,
} from '../../../../content/slay-forecast';
import { getEducationMasteryById } from '../../../../content/education';
import { AcrylicSaveBookmarkControl } from '../../AcrylicSaveBookmarkControl';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
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
import { LoungeTvBackButton } from '../../LoungeTvUiPrimitives';
import {
  isForecastSignalSaved,
  LOUNGE_TV_LIBRARY_UPDATED_EVENT,
  toggleForecastSignalSaved,
} from '../../../../utils/loungeTvLibrary';
import { ForecastSignalPreviewCard } from './ForecastSignalPreviewCard';
import { ForecastStatusBadge } from './ForecastStatusBadge';
import { useEffect, useState } from 'react';

type SlayForecastSignalDetailProps = {
  seasonId: string;
  signalId: string;
  onBack: () => void;
  onOpenSignal: (seasonId: string, signalId: string) => void;
  onOpenContentPack?: (packId: string) => void;
  onOpenMastery?: (masteryId: string) => void;
};

export function SlayForecastSignalDetail({
  seasonId,
  signalId,
  onBack,
  onOpenSignal,
  onOpenContentPack,
  onOpenMastery,
}: SlayForecastSignalDetailProps) {
  const season = getForecastSeasonById(seasonId);
  const signal = getForecastSignalInSeason(seasonId, signalId);
  const [, setRevision] = useState(0);

  useEffect(() => {
    const onLibraryUpdated = () => setRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  if (!season || !signal) return null;

  const saved = isForecastSignalSaved(signal.id);
  const hero = signal.assets.hero ?? signal.assets.thumbnail;
  const relatedSignals = (signal.relatedSignalIds ?? [])
    .map((id) => getForecastSignalInSeason(seasonId, id))
    .filter((s): s is ForecastSignal => Boolean(s));

  const totalSignals = season.signals.length;

  return (
    <div className="lounge-tv-slay-forecast-signal-detail" data-lounge-tv-rail="slay-forecast-signal">
      <LoungeTvBackButton
        onClick={onBack}
        label="< BACK TO FORECAST"
        fontSize={`calc(${LOUNGE_TV_TYPE.l3} + 1px)`}
      />

      <p
        className="lounge-tv-slay-forecast-signal-detail__index"
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.08em',
          margin: `${loungeTvGlassCqw(0.5, 1.1, 2.2)} 0 0`,
        }}
      >
        SIGNAL {String(signal.number).padStart(2, '0')} OF {String(totalSignals).padStart(2, '0')}
      </p>

      <div className="lounge-tv-slay-forecast-signal-detail__hero">
        <div className="lounge-tv-slay-forecast-signal-detail__copy">
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.08em',
              margin: 0,
            }}
          >
            {signal.categoryLabel}
          </p>
          <h2
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l1,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.05em',
              margin: `${loungeTvGlassCqw(0.25, 0.55, 1.1)} 0 0`,
              lineHeight: 1.05,
            }}
          >
            {signal.title}
          </h2>
          <ForecastStatusBadge status={signal.status} />
          <p
            style={{
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_TYPE.l3,
              color: 'rgba(255,255,255,0.84)',
              letterSpacing: '0.02em',
              margin: `${loungeTvGlassCqw(0.45, 1, 2)} 0 0`,
              lineHeight: 1.45,
              maxWidth: '40ch',
            }}
          >
            {signal.summary}
          </p>
          <AcrylicSaveBookmarkControl
            saved={saved}
            glyphSize="13px"
            hitSize={loungeTvGlassCqw(3.5, 8, 16)}
            data-lounge-tv-focusable
            ariaLabel={saved ? 'Remove saved signal' : 'Save signal'}
            className="lounge-tv-slay-forecast-signal-detail__save"
            onClick={() => toggleForecastSignalSaved(signal.id)}
          />
        </div>
        {hero ? (
          <div className="lounge-tv-slay-forecast-signal-detail__visual">
            <img src={hero} alt="" className="lounge-tv-slay-forecast-signal-detail__image" loading="lazy" />
            <span className="lounge-tv-slay-forecast-signal-detail__visual-veil" aria-hidden />
          </div>
        ) : null}
      </div>

      <SignalMomentum status={signal.status} />

      <section className="lounge-tv-slay-forecast-signal-detail__reasoning">
        <h3
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: LOUNGE_TV_TYPE.l2,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.06em',
            margin: 0,
          }}
        >
          WHY WE&apos;RE SEEING THIS
        </h3>
        <ul className="lounge-tv-slay-forecast-signal-detail__reasoning-list">
          {signal.reasoning.map((line) => (
            <li
              key={line}
              style={{
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_GRAY,
                letterSpacing: '0.02em',
                lineHeight: 1.45,
              }}
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      {(signal.relatedContentPackId || signal.relatedMasteryId || signal.relatedTrendReportPackId) ? (
        <section className="lounge-tv-slay-forecast-signal-detail__ahead">
          <h3
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l2,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            GET AHEAD OF THE TREND
          </h3>
          {signal.relatedContentPackId ? (
            <button
              type="button"
              className="lounge-tv-slay-forecast-signal-detail__cta"
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={`forecast-signal-watch-${signal.id}`}
              onClick={() => onOpenContentPack?.(signal.relatedContentPackId!)}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
            >
              <span className="lounge-tv-slay-forecast-signal-detail__cta-label">MASTER THE LOOK</span>
              <span>{signal.relatedContentLabel ?? 'WATCH NOW'}</span>
              <span className="lounge-tv-slay-forecast-signal-detail__cta-action">▶ WATCH NOW</span>
            </button>
          ) : null}
          {signal.relatedMasteryId ? (
            <button
              type="button"
              className="lounge-tv-slay-forecast-signal-detail__cta lounge-tv-slay-forecast-signal-detail__cta--secondary"
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={`forecast-signal-mastery-${signal.id}`}
              onClick={() => onOpenMastery?.(signal.relatedMasteryId!)}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
            >
              <span className="lounge-tv-slay-forecast-signal-detail__cta-label">RELATED MASTERY</span>
              <span>{getEducationMasteryById(signal.relatedMasteryId)?.title ?? 'VIEW MASTERY'}</span>
              <span className="lounge-tv-slay-forecast-signal-detail__cta-action">VIEW MASTERY →</span>
            </button>
          ) : null}
          {signal.relatedTrendReportPackId ? (
            <button
              type="button"
              className="lounge-tv-slay-forecast-signal-detail__cta lounge-tv-slay-forecast-signal-detail__cta--secondary"
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={`forecast-signal-trend-${signal.id}`}
              onClick={() => {
                /* resolved in parent via pack id */
                onOpenContentPack?.(signal.relatedTrendReportPackId!);
              }}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
            >
              <span className="lounge-tv-slay-forecast-signal-detail__cta-label">WHY THIS SIGNAL IS MOVING</span>
              <span>VIEW RELATED TREND REPORT →</span>
            </button>
          ) : null}
        </section>
      ) : null}

      {relatedSignals.length ? (
        <section className="lounge-tv-slay-forecast-signal-detail__related">
          <h3
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l2,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            RELATED FORECAST SIGNALS
          </h3>
          <div className="lounge-tv-slay-forecast-signal-detail__related-row">
            {relatedSignals.map((related) => (
              <ForecastSignalPreviewCard
                key={related.id}
                signal={related}
                compact
                focusId={`forecast-related-${related.id}`}
                onSelect={(sig) => onOpenSignal(seasonId, sig.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <p
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.05em',
          marginTop: loungeTvGlassCqw(0.5, 1.1, 2.2),
        }}
      >
        {formatForecastSeasonLabel(season)} · {formatForecastUpdatedLabel(signal.updatedAt)}
      </p>
    </div>
  );
}

function SignalMomentum({ status }: { status: ForecastSignal['status'] }) {
  const steps: ForecastSignal['status'][] = ['emerging', 'rising', 'accelerating'];
  return (
    <div className="lounge-tv-slay-forecast-momentum" aria-label="Signal momentum">
      {steps.map((step) => (
        <span
          key={step}
          className={`lounge-tv-slay-forecast-momentum__step ${step === status ? 'lounge-tv-slay-forecast-momentum__step--active' : ''}`.trim()}
        >
          <ForecastStatusBadge status={step} compact />
        </span>
      ))}
    </div>
  );
}
