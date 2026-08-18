import { CtrlRoomShell } from '../components/control/CtrlRoomShell';
import { BracketHeading, EmptyState, PageIntro, SearchField } from '../components/pages/Site00PagePrimitives';
import { useCtrlRoomData } from '../hooks/useCtrlRoomData';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';

export default function ProjectsPage() {
  const { metrics } = useCtrlRoomData();
  const [query, setQuery] = useState('');

  return (
    <CtrlRoomShell>
      <div className="site00-page site00-page--projects">
        <PageIntro
          title={<BracketHeading>PROJECTS</BracketHeading>}
          subtitle="ALL PROJECTS AND WORKSPACES ACROSS SITE 00."
        />
        <div className="site00-ctrl-metrics site00-ctrl-metrics--4">
          <article className="site00-metric-card">
            <p className="site00-metric-card__label">TOTAL PROJECTS</p>
            <p className="site00-metric-card__value">{metrics.activeSites.value === '—' ? '0' : metrics.activeSites.value}</p>
          </article>
          <article className="site00-metric-card">
            <p className="site00-metric-card__label">ACTIVE PROJECTS</p>
            <p className="site00-metric-card__value">—</p>
          </article>
          <article className="site00-metric-card">
            <p className="site00-metric-card__label">COMPLETED</p>
            <p className="site00-metric-card__value">—</p>
          </article>
          <article className="site00-metric-card">
            <p className="site00-metric-card__label">ARCHIVED</p>
            <p className="site00-metric-card__value">—</p>
          </article>
        </div>
        <div className="site00-page-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="SEARCH PROJECTS…" id="projects-search" />
          <Link to={SITE00_ROUTES.bldr} className="site00-btn-outline">
            + NEW PROJECT
          </Link>
        </div>
        <EmptyState
          title="NO PROJECTS YET"
          body="START A BUILD FROM BLDR TO CREATE YOUR FIRST SITE 00 PROJECT."
        />
      </div>
    </CtrlRoomShell>
  );
}
