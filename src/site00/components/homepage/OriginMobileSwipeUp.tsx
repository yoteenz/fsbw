import { Link, useNavigate } from 'react-router-dom';
import { SITE00_ORIGIN_COPY } from '../../config/status';
import { SITE00_ROUTES } from '../../config/routes';
import { useSwipeUp, prefersReducedSite00Motion } from '../../hooks/useSwipeUp';
import { useCallback, useState } from 'react';
import { useLocationsBackgroundUrl } from '../mobile/MobileEnvironmentBackground';

function ArrowUpIcon() {
  return (
    <svg
      className="site00-origin-mobile-swipe__arrow"
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 0V16M8 0L3 5M8 0L13 5" stroke="var(--site-red)" strokeWidth="1" />
    </svg>
  );
}

/** Origin homepage mobile — lower-center enter / swipe-up callout (approved reference). */
export function OriginMobileSwipeUp() {
  const copy = SITE00_ORIGIN_COPY.mobileSwipeUp;
  const navigate = useNavigate();
  const locationsBg = useLocationsBackgroundUrl();
  const [transitioning, setTransitioning] = useState(false);

  const goToLocations = useCallback(() => {
    if (transitioning) return;
    const reduced = prefersReducedSite00Motion();
    if (reduced) {
      navigate(SITE00_ROUTES.locations, { state: { fromSwipe: true } });
      return;
    }
    setTransitioning(true);
    window.setTimeout(() => {
      navigate(SITE00_ROUTES.locations, { state: { fromSwipe: true } });
      setTransitioning(false);
    }, 720);
  }, [navigate, transitioning]);

  const swipeHandlers = useSwipeUp({ onSwipeUp: goToLocations, disabled: transitioning });

  return (
    <>
      <section
        className="site00-origin-mobile-swipe"
        aria-label="Swipe up to open SITE 00 locations directory"
        {...swipeHandlers}
      >
        <p className="site00-label site00-origin-mobile-swipe__eyebrow">{copy.eyebrow}</p>
        <p className="site00-heading-xl site00-origin-mobile-swipe__coordinate">{copy.coordinate}</p>
        <p className="site00-label site00-origin-mobile-swipe__suffix">{copy.suffix}</p>
        <div className="site00-origin-mobile-swipe__connector" aria-hidden="true">
          <span className="site00-origin-mobile-swipe__connector-line" />
          <span className="site00-origin-mobile-swipe__connector-dot" />
          <span className="site00-origin-mobile-swipe__connector-line" />
        </div>
        <Link to={SITE00_ROUTES.enter} className="site00-origin-mobile-swipe__enter">
          {copy.enterLabel}
        </Link>
        <button type="button" className="site00-origin-mobile-swipe__swipe-btn" onClick={goToLocations}>
          {copy.swipeLabel}
        </button>
        <ArrowUpIcon />
      </section>

      {transitioning ? (
        <div className="site00-origin-swipe-transition site00-origin-swipe-transition--active" aria-hidden="true">
          <div
            className="site00-origin-swipe-transition__locations-preview"
            style={{ backgroundImage: `url("${locationsBg.replace(/"/g, '\\"')}")` }}
          />
        </div>
      ) : null}
    </>
  );
}
