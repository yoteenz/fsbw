import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import { aioPaths } from '../../utils/paths';
import { formatNumber } from '../iftaDerive';
import { IftaIcon, type IftaIconName } from './IftaIcon';
import { IFTA_MEDIA } from './iftaAssetManifest';
import { IftaMetricsRail, IftaUsMap } from './IftaModules';
import { RunFaqsPanel } from './RunFaqsPanel';
import { PUBLIC_SAMPLE_QUARTER as SAMPLE } from './iftaViewModel';

/** Five-step process — truthful copy (D-PUBLIC-COPY-TRUTH): staff-prepared, client-approved, AIO-filed. */
const PROCESS: { n: string; icon: IftaIconName; title: string; text: string; who: 'You' | 'AIO' }[] = [
  { n: '01', icon: 'fuel', title: 'Fuel purchases', text: 'Send receipts as you go — photo, upload, or from your Vault.', who: 'You' },
  { n: '02', icon: 'miles', title: 'Mileage by jurisdiction', text: 'Upload your ELD report; AIO checks your miles by state.', who: 'You' },
  { n: '03', icon: 'truck', title: 'Vehicle & trip data', text: 'Confirm which trucks ran this quarter.', who: 'You' },
  { n: '04', icon: 'doc', title: 'Return preparation', text: 'AIO reviews and reconciles fuel to miles and prepares the return for your approval.', who: 'AIO' },
  { n: '05', icon: 'send', title: 'Filing & confirmation', text: 'After you approve, AIO files and stores the confirmation in your Vault.', who: 'AIO' },
];

const PROMISES: { icon: IftaIconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Accurate', text: 'Every receipt and mile checked by AIO.' },
  { icon: 'clock', title: 'Efficient', text: 'Less time on paperwork. More time on the road.' },
  { icon: 'shield', title: 'Compliant', text: 'You approve before anything is filed.' },
];

/** Sample jurisdictions for the public map (static, labelled SAMPLE — never a client record). */
const SAMPLE_MAP: Record<string, number> = { TX: 1, OK: 0.75, NM: 0.5, AR: 0.42, LA: 0.37, AZ: 0.3, MO: 0.24, TN: 0.2 };

export function IftaPublicPage() {
  usePageMeta({
    title: 'IFTA Filing — All In One Enterprises',
    description: 'AIO handles the business side of quarterly fuel-tax filing — collect, review, prepare, you approve, AIO files.',
  });
  const requestFiling = aioPaths.getStartedForService('ifta-filing');

  return (
    <main className="ifta-pub">
      <section id="filing-room" className="ifta-pubhero" aria-label="IFTA filing room">
        <img className="ifta-pubhero__img" src={IFTA_MEDIA.publicHero} alt="" fetchPriority="high" decoding="async" />
        <div className="ifta-pubhero__shade" aria-hidden="true" />
        <div className="ifta-pub-frame ifta-pubhero__body">
          <p className="ifta-pubhero__eyebrow">IFTA filing room</p>
          <h1 className="ifta-pubhero__title">
            <span className="visually-hidden">IFTA filing room — sample quarter </span>
            {SAMPLE.label}
          </h1>
          <p className="ifta-pubhero__period">
            {SAMPLE.period}
            <span className="ifta-pubhero__sample">Sample quarter</span>
          </p>
          <p className="ifta-pubhero__tag">
            Real data. Real progress.
            <br />
            Every mile accounted for.
          </p>
          <a href="#how-it-works" className="ifta-btn ifta-btn--gold ifta-btn--pill">
            See how it works
            <IftaIcon name="arrow" size={18} />
          </a>
        </div>
      </section>

      <div className="ifta-pub-frame ifta-pub-lift">
        <IftaMetricsRail
          tone="dark"
          badge="Sample quarter"
          cells={[
            { icon: 'miles', value: formatNumber(SAMPLE.miles), label: 'Total miles' },
            { icon: 'fuel', value: formatNumber(SAMPLE.gallons), label: 'Total fuel (gal)' },
            { icon: 'pin', value: String(SAMPLE.jurisdictions), label: 'Jurisdictions' },
            { icon: 'coins', value: SAMPLE.tax.value, label: SAMPLE.tax.label, note: SAMPLE.tax.note },
          ]}
        />
      </div>

      <section className="ifta-pub-section" aria-labelledby="ifta-clear-path">
        <div className="ifta-pub-frame ifta-clearpath">
          <div className="ifta-clearpath__text">
            <h2 id="ifta-clear-path" className="ifta-pub-h2">
              A clear path
              <br />
              from miles to compliance.
            </h2>
            <p className="ifta-pub-lead">
              AIO handles the business side of quarterly fuel-tax filing. You send fuel and miles as they happen; AIO checks, reconciles, prepares the return, files it after
              you approve, and keeps the record.
            </p>
            <div className="ifta-clearpath__actions">
              <Link to={requestFiling} className="ifta-btn ifta-btn--gold ifta-btn--pill">
                Get started
                <IftaIcon name="arrow" size={18} />
              </Link>
              <p className="ifta-pub-small">
                Need an IFTA account first? <Link to={aioPaths.serviceSlug('ifta-fuel-tax-assistance')}>IFTA account assistance</Link>
              </p>
            </div>
          </div>
          <figure className="ifta-clearpath__media">
            <img src={IFTA_MEDIA.publicRoad} alt="An All In One truck on the highway at dusk" loading="lazy" decoding="async" />
            <figcaption>
              Real drivers.
              <br />
              Real roads.
              <br />
              Real compliance.
              <span className="ifta-rule" aria-hidden="true" />
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="how-it-works" className="ifta-pub-section" aria-labelledby="ifta-process">
        <div className="ifta-pub-frame">
          <h2 id="ifta-process" className="ifta-pub-h3">
            Our IFTA process keeps you on track.
          </h2>
          <ol className="ifta-process">
            {PROCESS.map((p) => (
              <li key={p.n} className="ifta-process__step">
                <span className="ifta-process__n">{p.n}</span>
                <IftaIcon name={p.icon} size={30} strokeWidth={1.5} className="ifta-process__icon" />
                <span className="ifta-process__title">{p.title}</span>
                <span className="ifta-process__text">{p.text}</span>
                <span className={`ifta-process__who ifta-process__who--${p.who.toLowerCase()}`}>{p.who}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="jurisdictions" className="ifta-pub-section ifta-pub-band" aria-labelledby="ifta-one-return">
        <div className="ifta-pub-frame ifta-oneret">
          <div className="ifta-oneret__map">
            <IftaUsMap intensity={SAMPLE_MAP} tone="dark" label="Sample: eight jurisdictions in one quarterly return" />
            <div className="ifta-oneret__count">
              <span className="ifta-oneret__n">{SAMPLE.jurisdictions}</span>
              <span className="ifta-oneret__unit">
                Jurisdictions
                <br />
                One return
              </span>
              <span className="ifta-rule" aria-hidden="true" />
              <p id="ifta-one-return">
                Miles and fuel by state come together in one quarterly return, filed with your base jurisdiction. Due every quarter: Apr 30 · Jul 31 · Oct 31 · Jan 31.
              </p>
            </div>
          </div>
          <div className="ifta-oneret__promises">
            <h2 className="ifta-pub-h3">Built for owner operators and fleets.</h2>
            <ul className="ifta-promises">
              {PROMISES.map((p) => (
                <li key={p.title}>
                  <IftaIcon name={p.icon} size={28} strokeWidth={1.5} className="ifta-promises__icon" />
                  <span className="ifta-promises__title">{p.title}</span>
                  <span className="ifta-promises__text">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="what-aio-handles" className="ifta-pub-section" aria-labelledby="ifta-handles">
        <div className="ifta-pub-frame">
          <h2 id="ifta-handles" className="ifta-pub-h3">
            What AIO handles · What you provide
          </h2>
          <div className="ifta-ledger">
            <div className="ifta-ledger__col ifta-ledger__col--aio">
              <h3>AIO handles</h3>
              <ul>
                <li>Collecting and checking receipts</li>
                <li>Turning ELD / trip records into miles by state</li>
                <li>Matching fuel to miles and preparing the return</li>
                <li>Filing after your approval and sealing the Vault packet</li>
              </ul>
            </div>
            <div className="ifta-ledger__col">
              <h3>You provide</h3>
              <ul>
                <li>Fuel receipts (photo, upload, or from your Vault)</li>
                <li>Miles by state (ELD report, import, or manual)</li>
                <li>Confirmation of which trucks ran</li>
                <li>Approval of the return</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <RunFaqsPanel />

      <section className="ifta-pub-section ifta-pub-start" aria-labelledby="ifta-start">
        <div className="ifta-pub-frame ifta-pub-start__inner">
          <div>
            <h2 id="ifta-start" className="ifta-pub-h3">
              How to start
            </h2>
            <p className="ifta-pub-lead">Request filing support — AIO collects your quarter, reviews, prepares, and files after you approve.</p>
          </div>
          <Link to={requestFiling} className="ifta-btn ifta-btn--gold ifta-btn--pill">
            Get started · request quote
            <IftaIcon name="arrow" size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
