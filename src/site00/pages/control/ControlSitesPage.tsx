import { CtrlRoomShell } from '../../components/control/CtrlRoomShell';
import { BracketHeading, EmptyState, PageIntro, SearchField } from '../../components/pages/Site00PagePrimitives';
import { CtrlRoomMetricCard } from '../../components/control/CtrlRoomMetricCard';
import { useCtrlRoomData } from '../../hooks/useCtrlRoomData';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { StatusBadge } from '../../components/pages/Site00PagePrimitives';

export default function ControlSitesPage() {
  const { metrics, sites } = useCtrlRoomData();
  const [query, setQuery] = useState('');
  const filtered = sites.filter((s) => !query.trim() || s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <CtrlRoomShell>
      <div className="site00-page site00-page--control-sites">
        <PageIntro title={<BracketHeading>SITES</BracketHeading>} subtitle="MANAGE ALL OF YOUR SITE 00 PROJECTS." />
        <div className="site00-ctrl-metrics site00-ctrl-metrics--4">
          <CtrlRoomMetricCard
            label="ACTIVE SITES"
            value={metrics.activeSites.value}
            state={metrics.activeSites.state}
            actionLabel="View all active →"
            actionHref={SITE00_ROUTES.controlSites}
            icon="globe"
          />
          <CtrlRoomMetricCard
            label="DRAFT SITES"
            value="—"
            state="empty"
            actionLabel="View all drafts →"
            actionHref={SITE00_ROUTES.controlSites}
            icon="cube"
          />
          <CtrlRoomMetricCard
            label="TOTAL SITES"
            value="—"
            state="empty"
            actionLabel="All time →"
            actionHref={SITE00_ROUTES.controlSites}
            icon="calendar"
          />
          <CtrlRoomMetricCard
            label="TEAM SITES"
            value="—"
            state="empty"
            actionLabel="Manage team →"
            actionHref={SITE00_ROUTES.controlTeam}
            icon="target"
          />
        </div>
        <div className="site00-page-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search sites…" id="sites-search" />
          <Link to={SITE00_ROUTES.bldr} className="site00-btn-outline">
            + NEW SITE
          </Link>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="NO SITES YET" body="Start a build from BLDR to create your first site." />
        ) : (
          <ul className="site00-sites-table">
            {filtered.map((site) => (
              <li key={site.id} className="site00-sites-table__row">
                <div>
                  <p className="site00-sites-table__name">{site.name}</p>
                </div>
                <StatusBadge status={site.status} tone={site.status === 'Published' ? 'published' : 'draft'} />
                <Link to={SITE00_ROUTES.controlSites} className="site00-btn-ghost-sm">
                  MANAGE
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CtrlRoomShell>
  );
}
