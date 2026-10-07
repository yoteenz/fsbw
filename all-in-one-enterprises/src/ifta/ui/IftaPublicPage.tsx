import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import { aioPaths } from '../../utils/paths';
import { formatNumber } from '../iftaDerive';
import { IftaIcon, type IftaIconName } from './IftaIcon';
import { IFTA_PLATES } from './iftaAssetManifest';
import { IftaRail } from './IftaModules';
import { useIftaBand } from './iftaScale';
import { PUBLIC_SAMPLE_QUARTER as SAMPLE } from './iftaViewModel';

/**
 * Five-step process. Composition as drawn; copy rewritten truthfully (D-PUBLIC-COPY-TRUTH): AIO collects and reviews,
 * prepares the return, the client approves, AIO files and stores the confirmation. No automated tracking or tax claims.
 */
const PROCESS: { n: string; icon: IftaIconName; title: [string, string?]; text: [string, string] }[] = [
  { n: '01', icon: 'fuel', title: ['Fuel', 'purchases'], text: ['Import and organize', 'your fuel receipts.'] },
  { n: '02', icon: 'miles', title: ['Mileage by', 'jurisdiction'], text: ['Track miles by state', 'or province.'] },
  { n: '03', icon: 'truck', title: ['Vehicle &', 'trip data'], text: ['Keep your fleet data', 'accurate and complete.'] },
  { n: '04', icon: 'doc', title: ['Return', 'preparation'], text: ['We calculate your', 'IFTA return for you.'] },
  { n: '05', icon: 'miles', title: ['Filing &', 'confirmation'], text: ['Submit with confidence', 'and get confirmation.'] },
];

const PROMISES: { icon: IftaIconName; title: string; text: [string, string] }[] = [
  { icon: 'target', title: 'Accurate', text: ['Real data. Fewer errors.', 'Greater confidence.'] },
  { icon: 'clock', title: 'Efficient', text: ['Less time on paperwork.', 'More time on the road.'] },
  { icon: 'shield', title: 'Compliant', text: ['Stay ahead with', 'automated tracking.'] },
];

/** PUBLIC · IFTA — the approved public / customer-facing screens (dark), with a labelled SAMPLE quarter. */
export function IftaPublicPage() {
  usePageMeta({
    title: 'IFTA Filing — All In One Enterprises',
    description: 'AIO handles the business side of quarterly fuel-tax filing — collect, review, prepare, you approve, AIO files.',
  });
  const band = useIftaBand();
  const desktop = band === 'desktop';
  const requestFiling = aioPaths.getStartedForService('ifta-filing');

  return (
    <main className={`ifta-pub is-${band}`}>
      <section id="filing-room" className="ifta-pubhero" aria-label="IFTA filing room — sample quarter">
        <picture className="ifta-pubhero__plate" aria-hidden="true">
          <source media="(max-width: 699.98px)" srcSet={IFTA_PLATES.public.mobile} />
          <source media="(max-width: 1199.98px)" srcSet={IFTA_PLATES.public.tablet} />
          <img src={IFTA_PLATES.public.desktop} alt="" fetchPriority="high" decoding="async" />
        </picture>
        <div className="ifta-pubhero__text">
          <p className="ifta-pubhero__eyebrow">{band === 'mobile' ? 'IFTA filing' : 'IFTA filing room'}</p>
          <h1 className="ifta-pubhero__title">
            <span className="visually-hidden">IFTA filing room — sample quarter </span>
            {SAMPLE.label}
          </h1>
          <p className="ifta-pubhero__period">{SAMPLE.period}</p>
          <span className="ifta-pubhero__rule" aria-hidden="true" />
          <p className="ifta-pubhero__tag">
            Real data. Real progress.
            <br />
            Every mile accounted for.
          </p>
          <a href="#how-it-works" className="ifta-pubbtn ifta-pubhero__cta">
            See how it works
            <IftaIcon name="arrow" strokeWidth={2.2} />
          </a>
        </div>
      </section>

      <div className="ifta-pubrail">
        <IftaRail
          tone="dark"
          badge="Sample quarter"
          cells={[
            { glyph: 'metric-miles', value: formatNumber(SAMPLE.miles), label: 'Total miles' },
            { glyph: 'metric-fuel', value: formatNumber(SAMPLE.gallons), label: 'Total fuel (gal)' },
            { glyph: 'metric-pin', value: String(SAMPLE.jurisdictions), label: 'Jurisdictions' },
            { glyph: 'metric-coins', value: SAMPLE.tax.value, label: 'Est. tax due' },
          ]}
        />
      </div>

      {desktop ? (
        <section className="ifta-clear" aria-labelledby="ifta-clear-path">
          <div className="ifta-clear__text">
            <h2 id="ifta-clear-path" className="ifta-pubh2">
              A clear path
              <br />
              from miles to compliance.
            </h2>
            <p className="ifta-clear__lead">
              The All In One IFTA filing room takes the complexity out of fuel tax reporting. We organize your data, calculate your return, and help you stay compliant across all
              jurisdictions — so you can keep moving forward.
            </p>
            <Link to={requestFiling} className="ifta-pubbtn ifta-clear__cta">
              Get started
              <IftaIcon name="arrow" strokeWidth={2.2} />
            </Link>
          </div>
          <figure className="ifta-clear__media">
            <img src={IFTA_PLATES.publicRoad} alt="A highway winding through the mountains at dusk" loading="lazy" decoding="async" />
            <figcaption>
              Real drivers.
              <br />
              Real roads.
              <br />
              Real compliance.
              <span className="ifta-clear__rule" aria-hidden="true" />
            </figcaption>
          </figure>
        </section>
      ) : (
        <section className="ifta-clear ifta-clear--compact" aria-labelledby="ifta-clear-path">
          <h2 id="ifta-clear-path" className="ifta-pubh2">
            A clear path from miles to compliance.
          </h2>
          <p className="ifta-clear__lead">We make IFTA simple, organized, and automated so you can focus on what moves your business forward.</p>
        </section>
      )}

      <section id="how-it-works" className={`ifta-process${desktop ? '' : ' ifta-process--tiles'}`} aria-labelledby="ifta-process-h">
        {desktop ? (
          <h2 id="ifta-process-h" className="ifta-pubh2">
            Our IFTA process keeps you on track.
          </h2>
        ) : (
          <h2 id="ifta-process-h" className="visually-hidden">
            Our IFTA process keeps you on track.
          </h2>
        )}
        <ol className="ifta-process__list">
          {PROCESS.map((p, i) => (
            <Fragment key={p.n}>
              <li className="ifta-process__step">
                {desktop ? <span className="ifta-process__n">{p.n}</span> : null}
                <IftaIcon name={p.icon} strokeWidth={1.7} className="ifta-process__icon" />
                <span className="ifta-process__title">
                  {p.title[0]}
                  {p.title[1] && desktop && p.n === '01' ? ` ${p.title[1]}` : null}
                  {p.title[1] && !(desktop && p.n === '01') ? (
                    <>
                      <br />
                      {p.title[1]}
                    </>
                  ) : null}
                </span>
                {desktop ? (
                  <span className="ifta-process__text">
                    {p.text[0]}
                    <br />
                    {p.text[1]}
                  </span>
                ) : null}
              </li>
              {desktop && i < PROCESS.length - 1 ? (
                <li className="ifta-process__chev" aria-hidden="true">
                  <IftaIcon name="chevron" strokeWidth={2} />
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>
      </section>

      <section id="jurisdictions" className="ifta-oneret" aria-labelledby="ifta-one-return">
        <div className="ifta-oneret__card">
          <picture className="ifta-oneret__map">
            <source media="(max-width: 1199.98px)" srcSet={IFTA_PLATES.publicMap.compact} />
            <img src={IFTA_PLATES.publicMap.desktop} alt="Sample: jurisdictions joined into one quarterly return" loading="lazy" decoding="async" />
          </picture>
          <div className="ifta-oneret__count">
            <span className="ifta-oneret__n">{SAMPLE.jurisdictions}</span>
            <span className="ifta-oneret__unit">
              Jurisdictions
              <br />
              One return
            </span>
            <span className="ifta-oneret__rule" aria-hidden="true" />
            <p id="ifta-one-return">
              We track your fuel,
              <br />
              mileage, and routes
              <br />
              across all states
              <br />
              so you stay compliant.
            </p>
          </div>
        </div>
        <div id="features" className="ifta-promises">
          <h2 className="ifta-pubh2">Built for owner operators and fleets.</h2>
          <ul className="ifta-promises__list">
            {PROMISES.map((p) => (
              <li key={p.title}>
                <IftaIcon name={p.icon} strokeWidth={1.8} className="ifta-promises__icon" />
                <span className="ifta-promises__body">
                  <span className="ifta-promises__title">{p.title}</span>
                  <span className="ifta-promises__text">
                    {p.text[0]}
                    <br />
                    {p.text[1]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
