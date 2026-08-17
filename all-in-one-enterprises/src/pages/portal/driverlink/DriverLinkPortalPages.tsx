import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AIOButton } from '../../../components/AIOButton';
import { useDemoStore } from '../../../demo/useDemoStore';
import {
  getApplicationsForOrg,
  getOpportunitiesForOrg,
  markDriverHired,
  updateApplicationStatus,
} from '../../../demo/driverlinkActions';
import { buildPublicProfileView } from '../../../driverlink/matchingService';
import { resolveOrganizationId } from '../../../portal/organizationContext';
import { aioPaths } from '../../../utils/paths';
import { usePageMeta } from '../../../hooks/usePageMeta';

export function DriverLinkCompanyHomePage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const orgId = resolveOrganizationId(store, 'carrier');
  const jobs = getOpportunitiesForOrg(orgId, store);
  const apps = getApplicationsForOrg(orgId, store);

  usePageMeta({ title: t('companyPortal') });

  return (
    <div className="aio-dl-page">
      <h1>{t('companyPortal')}</h1>
      <p>{t('tagline')}</p>
      <div className="aio-dl-metrics">
        <div><strong>{jobs.filter((j) => j.status === 'published').length}</strong> {t('openPositions')}</div>
        <div><strong>{apps.length}</strong> {t('applications')}</div>
      </div>
      <div className="aio-dl-actions">
        <AIOButton to={aioPaths.portalDriverLinkOpportunities} variant="gold">{t('openPositions')}</AIOButton>
        <AIOButton to={aioPaths.portalDriverLinkCandidates} variant="outline-gold">{t('candidates')}</AIOButton>
      </div>
    </div>
  );
}

export function DriverLinkCompanyOpportunitiesPage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const orgId = resolveOrganizationId(store, 'carrier');
  const jobs = getOpportunitiesForOrg(orgId, store);
  usePageMeta({ title: t('openPositions') });

  return (
    <div className="aio-dl-page">
      <h1>{t('openPositions')}</h1>
      <ul className="aio-dl-job-list">
        {jobs.map((j) => (
          <li key={j.id}>
            <Link to={aioPaths.portalDriverLinkOpportunity(j.id)}>{j.jobTitle}</Link>
            <span>{t(`status.${j.status}`)}</span>
          </li>
        ))}
      </ul>
      <AIOButton to={aioPaths.portalDriverLinkCreateJob} variant="gold">{t('publishOpportunity')}</AIOButton>
    </div>
  );
}

export function DriverLinkCompanyOpportunityDetailPage({ opportunityId }: { opportunityId: string }) {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const job = store.driverlinkOpportunities?.find((o) => o.id === opportunityId);
  const matches = (store.driverlinkMatches ?? []).filter((m) => m.opportunityId === opportunityId && m.eligible);

  if (!job) return <p>Not found</p>;

  return (
    <div className="aio-dl-page">
      <h1>{job.jobTitle}</h1>
      <p>{job.description}</p>
      <h2>{t('matches')}</h2>
      <ul>
        {matches.map((m) => {
          const driver = store.driverlinkProfiles?.find((p) => p.id === m.driverProfileId);
          const creds = (store.driverlinkCredentials ?? []).filter((c) => c.driverProfileId === m.driverProfileId);
          if (!driver) return null;
          const view = buildPublicProfileView(driver, creds);
          return (
            <li key={m.id}>
              {view.displayName} — {m.matchScore}% — {view.generalLocation}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DriverLinkCompanyCandidatesPage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  const orgId = resolveOrganizationId(store, 'carrier');
  const apps = getApplicationsForOrg(orgId, store);

  usePageMeta({ title: t('candidates') });

  return (
    <div className="aio-dl-page">
      <h1>{t('candidates')}</h1>
      <p>{t('applicationPipeline')}</p>
      <ul>
        {apps.map((a) => {
          const driver = store.driverlinkProfiles?.find((p) => p.id === a.driverProfileId);
          const job = store.driverlinkOpportunities?.find((o) => o.id === a.opportunityId);
          return (
            <li key={a.id} className="aio-dl-candidate-row">
              <span>{driver ? `${driver.firstName} ${driver.lastName.charAt(0)}.` : a.driverProfileId}</span>
              <span>{job?.jobTitle}</span>
              <span>{t(`status.${a.status}`)}</span>
              {a.status === 'application_submitted' ? (
                <>
                  <button type="button" className="aio-btn aio-btn--sm" onClick={() => updateApplicationStatus(a.id, 'under_review')}>
                    Review
                  </button>
                  <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => markDriverHired(a.id)}>
                    {t('status.hired')}
                  </button>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DriverLinkCompanyCreateJobPage() {
  const { t } = useTranslation('driverLink');
  usePageMeta({ title: t('publishOpportunity') });
  return (
    <div className="aio-dl-page">
      <h1>{t('publishOpportunity')}</h1>
      <p>Structured job creation flow — use demo opportunities for MVP.</p>
      <AIOButton to={aioPaths.portalDriverLinkOpportunities} variant="outline-gold">{t('openPositions')}</AIOButton>
    </div>
  );
}
