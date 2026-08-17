import { JourneyBackNav } from '../../journey/JourneyBackNav';
import type { AioService } from '../../../data/services';

type Props = {
  service: AioService;
  categoryLabel: string;
  heroIconSrc?: string;
  showJourneyBack?: boolean;
};

export function MobileServiceHero({ service, categoryLabel, heroIconSrc, showJourneyBack }: Props) {
  const titleParts = service.title.split(' ');
  const lineBreakIndex = titleParts.findIndex((w) => w.toLowerCase() === 'assistance');
  const titleLine1 = lineBreakIndex > 0 ? titleParts.slice(0, lineBreakIndex).join(' ') : titleParts.slice(0, 2).join(' ');
  const titleLine2 = lineBreakIndex > 0 ? titleParts.slice(lineBreakIndex).join(' ') : titleParts.slice(2).join(' ');

  return (
    <header className="aio-msvc-hero">
      {showJourneyBack ? (
        <div className="aio-msvc-hero__back">
          <JourneyBackNav label="Back to Startup Journey" />
        </div>
      ) : null}
      <div className="aio-msvc-hero__visual" aria-hidden={!heroIconSrc}>
        {heroIconSrc ? <img src={heroIconSrc} alt="" className="aio-msvc-hero__icon" /> : null}
        <div className="aio-msvc-hero__glow" />
      </div>
      <p className="aio-msvc-hero__eyebrow">
        Services / {categoryLabel}
      </p>
      <h1 className="aio-msvc-hero__title">
        {titleLine1}
        {titleLine2 ? (
          <>
            <br />
            {titleLine2}
          </>
        ) : null}
      </h1>
      <p className="aio-msvc-hero__desc">{service.description}</p>
      {service.audience ? <p className="aio-msvc-hero__audience">{service.audience}</p> : null}
    </header>
  );
}
