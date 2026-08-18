import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { StatusStrip } from '../components/homepage/StatusStrip';
import { OriginCards } from '../components/homepage/OriginCards';
import { OriginMobileSwipeUp } from '../components/homepage/OriginMobileSwipeUp';
import { IdntyExpandedPanel } from '../components/homepage/IdntyExpandedPanel';
import { BldrExpandedPanel } from '../components/homepage/BldrExpandedPanel';
import { SITE00_ORIGIN_COPY } from '../config/status';
import { SITE00_ORIGIN_DESKTOP_COMPOSITION } from '../config/origin-home-composition';
import { SITE00_ROUTES } from '../config/routes';
import { Site00OriginLayoutSwitch } from '../components/shell/Site00OriginLayoutSwitch';
import { useSite00 } from '../state/Site00Context';
import { useOriginStatusStripLayout } from '../hooks/useOriginStatusStripLayout';
import { useOriginLocationsTransition } from '../hooks/useOriginLocationsTransition';
import { useOriginExpandedDismiss } from '../hooks/useOriginExpandedDismiss';

export default function OriginPage() {
  const { state, setHomeMode } = useSite00();
  const { pathname } = useLocation();
  const isDesktopArtboardRoute =
    pathname === SITE00_ROUTES.originDesktop || pathname.startsWith(`${SITE00_ROUTES.originDesktop}/`);
  const statusStripLayout = useOriginStatusStripLayout(isDesktopArtboardRoute);
  const locationsTransition = useOriginLocationsTransition();
  const isMobileOrigin = !isDesktopArtboardRoute;
  const collapseExpandedPanel = useCallback(() => setHomeMode('origin'), [setHomeMode]);

  useOriginExpandedDismiss(state.homeMode, collapseExpandedPanel);

  return (
    <EnvironmentShell environmentId="ORIGIN_ENVIRONMENT">
      <div
        className={`site00-origin-page ${isDesktopArtboardRoute ? 'site00-origin-page--desktop-artboard' : 'site00-origin-page--mobile-layout'}`.trim()}
      >
        <Site00AppShell
          locationLabel={SITE00_ORIGIN_COPY.locationLabel}
          showStatusStrip
          statusStrip={<StatusStrip layout={statusStripLayout} />}
        >
          {isMobileOrigin ? (
            <div
              className="site00-origin-swipe-surface"
              aria-hidden="true"
              {...locationsTransition.swipeHandlers}
            />
          ) : null}
          <div
            className="site00-home-stage"
            style={{
              ['--site00-origin-hero-left' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroLeftPercent}%`,
              ['--site00-origin-hero-top' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroTopPx}px`,
              ['--site00-origin-hero-max-w' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroMaxWidthPx}px`,
              ['--site00-origin-hero-offset-x' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroOffsetXPx}px`,
              ['--site00-origin-cards-top' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.cardsTopPercent}%`,
              ['--site00-origin-cards-offset-y' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.cardsTopOffsetPx}px`,
              ['--site00-origin-cards-max-w' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.cardsMaxWidthPx}px`,
              ['--site00-origin-card-scale' as string]: String(SITE00_ORIGIN_DESKTOP_COMPOSITION.cardScale),
              ['--site00-origin-panel-icon-scale' as string]: String(SITE00_ORIGIN_DESKTOP_COMPOSITION.panelIconScale),
              ['--site00-origin-expanded-max-w' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.expandedMaxWidthPx}px`,
              ['--site00-origin-expanded-panel-scale' as string]: String(SITE00_ORIGIN_DESKTOP_COMPOSITION.expandedPanelScale),
              ['--site00-origin-framework-icon-size' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.frameworkIconSizePx}px`,
              ['--site00-origin-coordinate-gap' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.coordinateGapPx}px`,
            }}
          >
            <div className="site00-home-grid">
              <aside
                className="site00-home-hero"
                style={{
                  ['--site00-origin-hero-top' as string]: `${SITE00_ORIGIN_DESKTOP_COMPOSITION.heroTopPx}px`,
                }}
                aria-label="Origin messaging"
              >
                <p className="site00-label site00-home-hero__eyebrow">{SITE00_ORIGIN_COPY.headlineLine1}</p>
                <h1 className="site00-heading-xl">{SITE00_ORIGIN_COPY.headlineLine2}</h1>
                <p className="site00-tagline site00-home-hero__tagline">{SITE00_ORIGIN_COPY.tagline}</p>
                <p className="site00-body site00-body--technical site00-home-hero__line">{SITE00_ORIGIN_COPY.description1}</p>
                <p className="site00-body site00-body--technical site00-home-hero__line">{SITE00_ORIGIN_COPY.description2}</p>
                <p className="site00-body site00-body--technical site00-home-hero__line">{SITE00_ORIGIN_COPY.description3}</p>
                <p className="site00-coordinate site00-home-hero__coordinate">
                  {SITE00_ORIGIN_COPY.originPointLine.prefix}{' '}
                  <span className="site00-origin-hero__coordinate-value">{SITE00_ORIGIN_COPY.originPointLine.coordinate}</span>{' '}
                  {SITE00_ORIGIN_COPY.originPointLine.suffix}
                </p>
              </aside>

              {state.homeMode === 'origin' ? (
                <div className="site00-home-grid__spacer" aria-hidden="true" />
              ) : null}
            </div>

            {state.homeMode !== 'origin' ? (
              <div className="site00-home-expanded-column" aria-label="Expanded panel">
                {state.homeMode === 'idnty-expanded' ? (
                  <IdntyExpandedPanel onCollapse={collapseExpandedPanel} />
                ) : (
                  <BldrExpandedPanel onCollapse={collapseExpandedPanel} />
                )}
              </div>
            ) : null}

            {state.homeMode === 'origin' ? (
              <section className="site00-home-cards" aria-label="Entry selection">
                <OriginCards
                  onExpandIdnty={() => setHomeMode('idnty-expanded')}
                  onExpandBldr={() => setHomeMode('bldr-expanded')}
                />
              </section>
            ) : null}

            {!isDesktopArtboardRoute ? <OriginMobileSwipeUp transition={locationsTransition} /> : null}
          </div>
        </Site00AppShell>
        <Site00OriginLayoutSwitch />
      </div>
    </EnvironmentShell>
  );
}
