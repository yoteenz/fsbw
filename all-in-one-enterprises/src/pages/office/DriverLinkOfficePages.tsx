import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { usePageMeta } from '../../hooks/usePageMeta';

export function DriverLinkOfficeOverviewPage() {
  const { t } = useTranslation('driverLink');
  const store = useDemoStore();
  usePageMeta({ title: 'DriverLink — AIO Office' });

  const drivers = store.driverlinkProfiles?.length ?? 0;
  const jobs = store.driverlinkOpportunities?.filter((o) => o.status === 'published').length ?? 0;
  const apps = store.driverlinkApplications?.length ?? 0;
  const credReview = store.driverlinkCredentials?.filter((c) => c.verificationStatus === 'pending_review').length ?? 0;

  return (
    <div className="aio-dl-office aio-mgmt-page">
      <h1>{t('productName')}</h1>
      <div className="aio-dl-metrics aio-dl-metrics--office">
        <div><strong>{drivers}</strong> Active driver profiles</div>
        <div><strong>{jobs}</strong> {t('openPositions')}</div>
        <div><strong>{apps}</strong> {t('applications')}</div>
        <div><strong>{credReview}</strong> Credentials pending review</div>
      </div>
      <nav className="aio-dl-office-tabs">
        <Link to={aioPaths.officeDriverLink}>Overview</Link>
        <Link to={aioPaths.officeDriverLinkDrivers}>Drivers</Link>
        <Link to={aioPaths.officeDriverLinkJobs}>Jobs</Link>
        <Link to={aioPaths.officeDriverLinkApplications}>Applications</Link>
      </nav>
    </div>
  );
}

export function DriverLinkOfficeDriversPage() {
  const store = useDemoStore();
  return (
    <div className="aio-dl-office">
      <h1>Drivers</h1>
      <ul>
        {(store.driverlinkProfiles ?? []).map((d) => (
          <li key={d.id}>{d.firstName} {d.lastName} — {d.marketplaceStatus}</li>
        ))}
      </ul>
    </div>
  );
}

export function DriverLinkOfficeJobsPage() {
  const store = useDemoStore();
  return (
    <div className="aio-dl-office">
      <h1>Job opportunities</h1>
      <ul>
        {(store.driverlinkOpportunities ?? []).map((j) => (
          <li key={j.id}>{j.jobTitle} — {j.status}</li>
        ))}
      </ul>
    </div>
  );
}

export function DriverLinkOfficeApplicationsPage() {
  const store = useDemoStore();
  return (
    <div className="aio-dl-office">
      <h1>Applications</h1>
      <ul>
        {(store.driverlinkApplications ?? []).map((a) => (
          <li key={a.id}>{a.id} — {a.status}</li>
        ))}
      </ul>
    </div>
  );
}
