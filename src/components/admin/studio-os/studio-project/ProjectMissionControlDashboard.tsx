import { Link } from 'react-router-dom';
import type { ProjectDashboardSnapshot } from '../../../../studio-os-core/studio-project/types';
import {
  adminStudioNdxbookCreativeDirectionPath,
  adminStudioNdxbookNewsroomDepartmentPath,
} from '../../../../utils/adminStudioRoutes';
import { NR, nrLabel, nrPanel, nrSectionTitle } from '../ndxbook-newsroom/ndxbookNewsroomTheme';

type Props = {
  dashboard: ProjectDashboardSnapshot;
  compact?: boolean;
};

export function ProjectMissionControlDashboard({ dashboard, compact = false }: Props) {
  const { project: p } = dashboard;

  return (
    <section className="project-mission-control p-3 border mb-3" style={{ ...nrPanel, borderLeft: `4px solid ${NR.indigo}` }}>
      <p style={{ ...nrLabel, fontSize: '5px', color: NR.indigo }}>MISSION CONTROL · PROJECT DASHBOARD</p>
      <p style={nrSectionTitle}>{p.displayCode}</p>
      <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black, fontSize: '8px' }}>{p.name.toUpperCase()}</p>
      <p style={{ ...nrLabel, fontSize: '6px', color: NR.gray }}>{p.initiativeType}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="PROGRESS" value={`${p.status.progressPct}%`} accent />
        <Metric label="DEPARTMENT" value={p.status.departmentLabel.replace(' Department', '').toUpperCase()} />
        <Metric label="OUTPUTS" value={`${dashboard.outputsCreated.length} / ${dashboard.outputsCreated.length + dashboard.outputsRemaining.length}`} />
        <Metric label="NOTES" value={String(dashboard.openFounderNotes)} warn={dashboard.openFounderNotes > 0} />
      </div>

      <div className="mt-3 p-2 border" style={{ borderColor: NR.panelBorder }}>
        <p style={{ ...nrLabel, fontSize: '6px' }}>
          <strong style={{ color: NR.black }}>Current objective · </strong>
          {p.status.currentObjective}
        </p>
        {p.status.pendingReview ? (
          <p style={{ ...nrLabel, fontSize: '6px', color: NR.gold, marginTop: 4 }}>
            Pending · {p.status.pendingReview}
          </p>
        ) : null}
        {p.status.nextDepartmentLabel ? (
          <p style={{ ...nrLabel, fontSize: '6px', marginTop: 4, color: NR.indigo }}>
            Next department · {p.status.nextDepartmentLabel}
          </p>
        ) : null}
      </div>

      {!compact ? (
        <>
          <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
            <Panel title="CREATIVE DIRECTION">
              <p style={nrLabel}>{dashboard.creativeDirectionBranch}</p>
              <p style={{ ...nrLabel, fontSize: '6px' }}>{dashboard.creativeDirectionNorthStar.slice(0, 120)}…</p>
              <p style={{ ...nrLabel, fontSize: '5px', marginTop: 4, color: NR.gray }}>
                Mood board · {dashboard.moodBoardHighlight}
              </p>
            </Panel>
            <Panel title="CONCIERGE · REVIEWS">
              <p style={nrLabel}>{dashboard.conciergeStatus}</p>
              {dashboard.pendingReviews.map((r) => (
                <p key={r} style={{ ...nrLabel, fontSize: '6px', color: NR.gold }}>
                  · {r}
                </p>
              ))}
            </Panel>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
            <Panel title="OUTPUTS CREATED">
              {dashboard.outputsCreated.length === 0 ? (
                <p style={{ ...nrLabel, fontSize: '6px' }}>No outputs in production yet.</p>
              ) : (
                dashboard.outputsCreated.map((o) => (
                  <p key={o.id} style={{ ...nrLabel, fontSize: '6px' }}>
                    ✓ {o.label} · {o.status.replace('-', ' ')}
                  </p>
                ))
              )}
            </Panel>
            <Panel title="OUTPUTS REMAINING">
              {dashboard.outputsRemaining.slice(0, 4).map((o) => (
                <p key={o.id} style={{ ...nrLabel, fontSize: '6px', color: NR.gray }}>
                  · {o.label}
                </p>
              ))}
            </Panel>
          </div>

          <Panel title="PRODUCTION TIMELINE">
            {dashboard.productionTimeline.slice(0, 8).map((ev) => (
              <p key={ev.id} style={{ ...nrLabel, fontSize: '5px' }}>
                {ev.label} · {ev.detail}
              </p>
            ))}
          </Panel>

          <Panel title="AI RECOMMENDATIONS">
            {dashboard.aiRecommendations.map((rec) => (
              <p key={rec} style={{ ...nrLabel, fontSize: '6px' }}>
                · {rec}
              </p>
            ))}
          </Panel>

          <p style={{ ...nrLabel, fontSize: '6px', marginTop: 4 }}>{dashboard.performanceSummary}</p>
        </>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1">
        <Link
          to={adminStudioNdxbookCreativeDirectionPath()}
          className="px-2 py-1 text-[6px] font-futura border"
          style={{ borderColor: NR.indigo, color: NR.indigo }}
        >
          CREATIVE DIRECTION →
        </Link>
        <Link
          to={adminStudioNdxbookNewsroomDepartmentPath(p.status.department)}
          className="px-2 py-1 text-[6px] font-futura border"
          style={{ borderColor: NR.black, color: NR.black }}
        >
          OPEN {p.status.departmentLabel.toUpperCase()} →
        </Link>
      </div>
    </section>
  );
}

function Metric({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="p-2 border text-center" style={{ borderColor: NR.panelBorder }}>
      <p
        style={{
          ...nrLabel,
          fontFamily: '"Futura PT Medium"',
          fontSize: '8px',
          color: warn ? NR.gold : accent ? NR.indigo : NR.black,
        }}
      >
        {value}
      </p>
      <p style={{ ...nrLabel, fontSize: '5px' }}>{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-2 border" style={{ borderColor: NR.panelBorder }}>
      <p style={{ ...nrSectionTitle, fontSize: '7px' }}>{title}</p>
      {children}
    </div>
  );
}
