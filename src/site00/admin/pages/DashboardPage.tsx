import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import { site00ProductionApi } from '../services/productionApi';

type NextAction = {
  id: string;
  title: string;
  reason: string;
  priority: string;
  destination: string;
  site00_projects?: { name: string; slug: string };
};

export default function Site00AdminDashboardPage() {
  const [nextActions, setNextActions] = useState<NextAction[]>([]);
  const [approvalCount, setApprovalCount] = useState(0);
  const [accessAlerts, setAccessAlerts] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .dashboard()
      .then((data) => {
        setNextActions(data.nextActions as NextAction[]);
        setApprovalCount(data.approvalCount);
        setAccessAlerts(data.accessAlerts);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD DASHBOARD'));
  }, []);

  return (
    <Site00AdminShell approvalBadge={approvalCount || undefined}>
      <h1 className="site00-admin-page-title">[ DASHBOARD ]</h1>
      <p className="site00-admin-page-subtitle">WHAT SHOULD HAPPEN NEXT ACROSS SITE 00 PRODUCTION.</p>

      {error ? <p className="site00-admin-panel">{error.toUpperCase()}</p> : null}

      <section className="site00-admin-panel">
        <h2 className="site00-admin-panel__title">WHAT SHOULD HAPPEN NEXT?</h2>
        {nextActions.length === 0 ? (
          <p>NO ACTION REQUIRED RIGHT NOW.</p>
        ) : (
          nextActions.map((action) => (
            <div key={action.id} className="site00-admin-action-row">
              <div>
                <p className="site00-admin-action-row__project">{action.site00_projects?.name ?? 'PROJECT'}</p>
                <p className="site00-admin-action-row__title">{action.title}</p>
                <p className="site00-admin-action-row__reason">{action.reason}</p>
              </div>
              <Link className="site00-admin-btn site00-admin-btn--primary" to={action.destination}>
                GO →
              </Link>
            </div>
          ))
        )}
      </section>

      {accessAlerts.length > 0 ? (
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">ACCESS REQUIRED — {accessAlerts.length} PROJECTS</h2>
          <Link className="site00-admin-btn" to={SITE00_ADMIN_ROUTES.projects}>
            VIEW ACCESS →
          </Link>
        </section>
      ) : null}
    </Site00AdminShell>
  );
}
