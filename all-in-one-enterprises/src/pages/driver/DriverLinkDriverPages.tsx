import { Link, Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { AIOButton } from '../../components/AIOButton';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  applyToOpportunity,
  getApplicationsForDriver,
  getMatchesForDriver,
  getOpportunityById,
} from '../../demo/driverlinkActions';
import { DEMO_DRIVER_PROFILE_ID } from '../../demo/driverlinkSeed';
import { aioPaths } from '../../utils/paths';
import { usePageMeta } from '../../hooks/usePageMeta';
import { DRIVERLINK_LEGAL_DISCLOSURES } from '../../driverlink/driverlinkConfig';

function useActiveDriverId(store: ReturnType<typeof useDemoStore>) {
  return store.driverlinkDemoContext?.activeDriverProfileId ?? DEMO_DRIVER_PROFILE_ID;
}

export function DriverLinkDriverLayout() {
  const { t } = useTranslation('driverLink');
  const location = window.location.pathname;

  const nav = [
    { label: t('driverPortal'), href: aioPaths.driverLinkDriverPortal },
    { label: t('myProfile'), href: aioPaths.driverLinkDriverProfile },
    { label: t('credentials'), href: aioPaths.driverLinkDriverCredentials },
    { label: t('findWork'), href: aioPaths.driverLinkDriverFindWork },
    { label: t('matches'), href: aioPaths.driverLinkDriverMatches },
    { label: t('applications'), href: aioPaths.driverLinkDriverApplications },
  ];

  return (
    <div className="aio-app aio-dl-driver-portal">
      <header className="aio-dl-driver-portal__header">
        <Link to={aioPaths.home} className="aio-dl-driver-portal__brand">
          {t('productName')}
        </Link>
        <nav className="aio-dl-driver-portal__nav" aria-label="Driver portal">
          {nav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={location.startsWith(item.href) ? 'is-active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="aio-dl-driver-portal__main">
        <Outlet />
      </main>
    </div>
  );
}

export function DriverLinkDriverDashboardPage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const driverId = useActiveDriverId(store);
  const driver = store.driverlinkProfiles?.find((p) => p.id === driverId);
  const matches = getMatchesForDriver(driverId, store);
  const applications = getApplicationsForDriver(driverId, store);

  usePageMeta({ title: t('driverPortal') });

  if (!driver) return <p>Profile not found.</p>;

  return (
    <div className="aio-dl-page">
      <h1>{t('driverPortal')}</h1>
      <p>{driver.firstName} {driver.lastName} — {t(`status.${driver.marketplaceStatus}`)}</p>
      <div className="aio-dl-metrics">
        <div><strong>{matches.length}</strong> {t('matches')}</div>
        <div><strong>{applications.length}</strong> {t('applications')}</div>
      </div>
      <AIOButton to={aioPaths.driverLinkDriverFindWork} variant="gold">{t('findWork')}</AIOButton>
    </div>
  );
}

export function DriverLinkDriverProfilePage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const driverId = useActiveDriverId(store);
  const driver = store.driverlinkProfiles?.find((p) => p.id === driverId);
  usePageMeta({ title: t('myProfile') });
  if (!driver) return null;
  return (
    <div className="aio-dl-page">
      <h1>{t('myProfile')}</h1>
      <dl className="aio-dl-dl">
        <dt>CDL</dt><dd>{driver.cdlClass}</dd>
        <dt>{t('matchFactors.experience_match')}</dt><dd>{driver.yearsExperience} years</dd>
        <dt>{t('matchFactors.region_match')}</dt><dd>{driver.preferredRegions.join(', ')}</dd>
        <dt>{t('matchFactors.home_time')}</dt><dd>{driver.homeTimePreference}</dd>
      </dl>
    </div>
  );
}

export function DriverLinkDriverCredentialsPage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const driverId = useActiveDriverId(store);
  const creds = (store.driverlinkCredentials ?? []).filter((c) => c.driverProfileId === driverId);
  usePageMeta({ title: t('credentials') });
  return (
    <div className="aio-dl-page">
      <h1>{t('credentials')}</h1>
      <ul className="aio-dl-cred-list">
        {creds.map((c) => (
          <li key={c.id}>
            <strong>{t(`credentialTypes.${c.credentialType}`)}</strong>
            <span>{t(`credentialStatus.${c.verificationStatus}`)}</span>
            {c.expirationDate ? <span>{c.expirationDate}</span> : null}
          </li>
        ))}
      </ul>
      <p className="aio-dl-disclosure">{DRIVERLINK_LEGAL_DISCLOSURES.clearinghouse}</p>
    </div>
  );
}

export function DriverLinkDriverFindWorkPage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const driverId = useActiveDriverId(store);
  const matches = getMatchesForDriver(driverId, store);
  usePageMeta({ title: t('findWork') });

  return (
    <div className="aio-dl-page">
      <h1>{t('findWork')}</h1>
      <div className="aio-dl-match-grid">
        {matches.map((m) => {
          const job = getOpportunityById(m.opportunityId, store);
          if (!job) return null;
          return (
            <article key={m.id} className="aio-dl-match-card">
              <h2>{job.jobTitle}</h2>
              <p>{job.baseLocation?.city}, {job.baseLocation?.stateCode}</p>
              <p>{t('matchScore')}: {m.matchScore}%</p>
              <AIOButton to={aioPaths.driverLinkDriverOpportunity(job.id)} variant="outline-gold">
                {t('viewOpportunity')}
              </AIOButton>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function DriverLinkDriverMatchesPage() {
  return <DriverLinkDriverFindWorkPage />;
}

export function DriverLinkDriverApplicationsPage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const driverId = useActiveDriverId(store);
  const apps = getApplicationsForDriver(driverId, store);
  usePageMeta({ title: t('applications') });

  return (
    <div className="aio-dl-page">
      <h1>{t('applications')}</h1>
      <ul>
        {apps.map((a) => {
          const job = getOpportunityById(a.opportunityId, store);
          return (
            <li key={a.id}>
              {job?.jobTitle} — {t(`status.${a.status}`)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DriverLinkDriverOpportunityPage() {
  const { t } = useTranslation('driverLink');
  const { opportunityId = '' } = useParams();
  const store = useDemoStore();
  const driverId = useActiveDriverId(store);
  const job = getOpportunityById(opportunityId, store);
  const [applied, setApplied] = useState(false);

  usePageMeta({ title: job?.jobTitle ?? t('viewOpportunity') });

  if (!job) return <p>Not found</p>;

  const onApply = () => {
    applyToOpportunity({
      driverProfileId: driverId,
      opportunityId: job.id,
      consentScope: ['professional_profile', 'contact_information', 'selected_credentials'],
    });
    setApplied(true);
  };

  return (
    <div className="aio-dl-page">
      <h1>{job.jobTitle}</h1>
      <p>{job.description}</p>
      <p>{job.compensationRange}</p>
      <section className="aio-dl-consent">
        <h2>{t('consentTitle')}</h2>
        <p>{t('consentLead')}</p>
        <p className="aio-dl-disclosure">{DRIVERLINK_LEGAL_DISCLOSURES.dataRelease}</p>
      </section>
      {!applied ? (
        <button type="button" className="aio-btn aio-btn--gold" onClick={onApply}>
          {t('applyNow')}
        </button>
      ) : (
        <p>{t('status.application_submitted')}</p>
      )}
    </div>
  );
}
