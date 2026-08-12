import type { TrendReportEditorial, TrendReportEditorialSection } from '../../../../content/trend-reports';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { loungeTvGlassCqw } from '../../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_GLASS_BORDER,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_DETAIL_TYPE, LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { LoungeTvBackButton } from '../../LoungeTvUiPrimitives';
import { SlayForecastOrbMedia } from '../slay-forecast/SlayForecastOrbMedia';
import { getCurrentForecastSeason } from '../../../../content/slay-forecast';
import { togglePackSaved, isPackSaved } from '../../../../utils/loungeTvLibrary';
import { useState } from 'react';

type TrendReportEditorialViewProps = {
  editorial: TrendReportEditorial;
  onBack: () => void;
  onOpenForecast?: (editionId: string) => void;
};

export function TrendReportEditorialView({
  editorial,
  onBack,
  onOpenForecast,
}: TrendReportEditorialViewProps) {
  const [saved, setSaved] = useState(() => isPackSaved(editorial.packId));
  const season = getCurrentForecastSeason();

  const handleSave = () => setSaved(togglePackSaved(editorial.packId));

  return (
    <article
      className="lounge-tv-trend-report-editorial"
      data-lounge-tv-rail="trend-report"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.3, 3.2, 6.5),
        textTransform: 'uppercase',
      }}
    >
      <LoungeTvBackButton onClick={onBack} label="< BACK" />

      <header className="lounge-tv-trend-report-editorial__cover">
        <p
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.1em',
            margin: 0,
          }}
        >
          TREND REPORT · {editorial.seasonLabel}
        </p>
        <h1
          style={{
            margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: LOUNGE_TV_DETAIL_TYPE.pageTitle,
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.08,
          }}
        >
          {editorial.sections.find((s) => s.kind === 'cover')?.title ?? 'TREND REPORT'}
        </h1>
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.45, 1, 2)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_TYPE.l3,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.03em',
            lineHeight: 1.45,
            textTransform: 'none',
          }}
        >
          {editorial.dek}
        </p>
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.06em',
          }}
        >
          {editorial.readTime} READ
        </p>
        <div className="lounge-tv-trend-report-editorial__cover-actions">
          <button
            type="button"
            className="lounge-tv-trend-report-editorial__save"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id="trend-report-save"
            onClick={handleSave}
            onFocusCapture={loungeTvFocusGlowIn}
            onBlurCapture={loungeTvFocusGlowOut}
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: saved ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.06em',
              background: 'transparent',
              border: LOUNGE_TV_GLASS_BORDER,
              padding: `${loungeTvGlassCqw(0.25, 0.55, 1.1)} ${loungeTvGlassCqw(0.55, 1.2, 2.4)}`,
              cursor: 'pointer',
            }}
          >
            {saved ? 'SAVED' : 'SAVE REPORT'}
          </button>
        </div>
        <div className="lounge-tv-trend-report-editorial__hero">
          <img
            src={editorial.heroImage}
            alt=""
            className="lounge-tv-trend-report-editorial__hero-image"
            draggable={false}
          />
          {editorial.orbEnabled && season ? (
            <div className="lounge-tv-trend-report-editorial__orb" aria-hidden>
              <SlayForecastOrbMedia season={season} motionActive />
            </div>
          ) : null}
        </div>
      </header>

      {editorial.sections
        .filter((s) => s.kind !== 'cover')
        .map((section) => (
          <TrendReportSectionBlock key={section.id} section={section} />
        ))}

      {editorial.relatedForecastEditionId && onOpenForecast ? (
        <section className="lounge-tv-trend-report-editorial__forecast-bridge">
          <h2
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l1,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            WHAT PSA THINKS HAPPENS NEXT
          </h2>
          <button
            type="button"
            className="lounge-tv-trend-report-editorial__forecast-cta"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id="trend-report-open-forecast"
            onClick={() => onOpenForecast(editorial.relatedForecastEditionId!)}
            onFocusCapture={loungeTvFocusGlowIn}
            onBlurCapture={loungeTvFocusGlowOut}
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l2,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.06em',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              marginTop: '0.55em',
            }}
          >
            {editorial.relatedForecastLabel ?? 'SEE PSA\'S FORECAST →'}
          </button>
        </section>
      ) : null}
    </article>
  );
}

function TrendReportSectionBlock({ section }: { section: TrendReportEditorialSection }) {
  return (
    <section className={`lounge-tv-trend-report-editorial__section lounge-tv-trend-report-editorial__section--${section.kind}`}>
      <h2
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l1,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.05em',
          margin: 0,
        }}
      >
        {section.title}
      </h2>

      {section.pullQuote ? (
        <blockquote
          className="lounge-tv-trend-report-editorial__pull-quote"
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: LOUNGE_TV_TYPE.l1,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.04em',
            margin: `${loungeTvGlassCqw(0.55, 1.2, 2.4)} 0 0`,
            borderLeft: `2px solid ${LOUNGE_TV_BRAND_RED}`,
            paddingLeft: loungeTvGlassCqw(0.55, 1.2, 2.4),
          }}
        >
          {section.pullQuote}
        </blockquote>
      ) : null}

      {section.body ? (
        <p
          style={{
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_TYPE.l3,
            color: 'rgba(255,255,255,0.78)',
            letterSpacing: '0.02em',
            lineHeight: 1.5,
            margin: `${loungeTvGlassCqw(0.45, 1, 2)} 0 0`,
            textTransform: 'none',
          }}
        >
          {section.body}
        </p>
      ) : null}

      {section.bullets?.length ? (
        <ul className="lounge-tv-trend-report-editorial__bullets">
          {section.bullets.map((item) => (
            <li
              key={item}
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.04em',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {section.signalLabel ? (
        <div className="lounge-tv-trend-report-editorial__signal-marker">
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l2,
              color: LOUNGE_TV_TEXT_WHITE,
            }}
          >
            {section.signalLabel}
          </span>
          {section.signalDirection ? (
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_TYPE.l4,
                color: LOUNGE_TV_TEXT_GRAY,
                marginLeft: '0.5em',
              }}
            >
              {section.signalDirection}
            </span>
          ) : null}
        </div>
      ) : null}

      {section.imageSrc ? (
        <img
          src={section.imageSrc}
          alt={section.imageAlt ?? ''}
          className="lounge-tv-trend-report-editorial__section-image"
          draggable={false}
        />
      ) : null}

      {section.comparison ? (
        <div className="lounge-tv-trend-report-editorial__comparison">
          <div>
            <p style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: LOUNGE_TV_TYPE.l4, color: LOUNGE_TV_TEXT_GRAY }}>
              {section.comparison.leftLabel}
            </p>
            {section.comparison.leftImage ? (
              <img src={section.comparison.leftImage} alt="" draggable={false} />
            ) : null}
          </div>
          <div>
            <p style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: LOUNGE_TV_TYPE.l4, color: LOUNGE_TV_TEXT_GRAY }}>
              {section.comparison.rightLabel}
            </p>
            {section.comparison.rightImage ? (
              <img src={section.comparison.rightImage} alt="" draggable={false} />
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
