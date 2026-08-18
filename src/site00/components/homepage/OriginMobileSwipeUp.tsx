import { Link } from 'react-router-dom';
import { SITE00_ORIGIN_COPY } from '../../config/status';
import { SITE00_ROUTES } from '../../config/routes';

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

  return (
    <section className="site00-origin-mobile-swipe" aria-label="Enter SITE 00">
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
      <p className="site00-label site00-origin-mobile-swipe__swipe">{copy.swipeLabel}</p>
      <ArrowUpIcon />
    </section>
  );
}
