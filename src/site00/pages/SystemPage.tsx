import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import { BracketHeading, EmptyState, PageIntro } from '../components/pages/Site00PagePrimitives';
import { SITE00_SYSTEM_STATUS_SEED } from '../config/seed/site00-page-seed';

export default function SystemPage() {
  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--system">
        <PageIntro
          title={<BracketHeading>SYSTEM</BracketHeading>}
          subtitle="REAL-TIME STATUS AND HEALTH OF SITE 00."
        />
        <div className="site00-system-status-grid">
          {SITE00_SYSTEM_STATUS_SEED.map((item) => (
            <article key={item.id} className="site00-system-status-card">
              <p className="site00-system-status-card__label">{item.label}</p>
              <p className="site00-system-status-card__state">Status unavailable</p>
              <p className="site00-system-status-card__meta">Health monitoring not connected</p>
            </article>
          ))}
        </div>
        <section className="site00-system-panel">
          <h2 className="site00-label-red">SYSTEM HEALTH</h2>
          <EmptyState title="HEALTH DATA NOT AVAILABLE" body="Connect operational monitoring to display uptime and incident history." />
        </section>
        <section className="site00-system-panel">
          <h2 className="site00-label-red">RECENT INCIDENTS</h2>
          <EmptyState title="NO INCIDENT DATA" body="Incident history will appear when monitoring is enabled." />
        </section>
      </div>
    </Site00PublicShell>
  );
}
