import type { CampaignPlan } from '../../../../utils/adminStudioCampaignOrchestratorDemo';
import { CAMPAIGN_DEPARTMENTS, DELIVERABLE_CATALOG } from '../../../../utils/adminStudioCampaignOrchestratorDemo';
import { getTaskDependencyChain } from '../../../../utils/adminStudioCampaignOrchestratorPlan';
import { CO_VISUAL, coActionBtn, coCaption, coPanelStyle, coSectionTitle } from './campaignOrchestratorTheme';

type CampaignOrchestratorDashboardProps = {
  plan: CampaignPlan;
  onBack: () => void;
  onToggleApproval: (id: string) => void;
  onToggleAutomation: (id: string) => void;
  onAdvanceTask: (id: string) => void;
};

export function CampaignOrchestratorDashboard({
  plan,
  onBack,
  onToggleApproval,
  onToggleAutomation,
  onAdvanceTask,
}: CampaignOrchestratorDashboardProps) {
  const w = plan.wizard;
  const upcoming = plan.tasks.filter((t) => t.status !== 'complete').slice(0, 5);
  const completed = plan.tasks.filter((t) => t.status === 'complete');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-2 flex-wrap">
        <div>
          <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '18px', color: CO_VISUAL.red }}>{w.name || 'CAMPAIGN'}</p>
          <p style={coCaption}>{w.goals || w.theme} · LAUNCH {w.launchDate}</p>
        </div>
        <button type="button" onClick={onBack} style={coActionBtn}>← HUB</button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="PROGRESS" value={`${plan.progressPct}%`} />
        <Stat label="READINESS" value={`${plan.readinessScore}%`} />
        <Stat label="RISK" value={`${plan.riskScore}`} highlight={plan.riskScore > 50} />
        <Stat label="BUDGET" value={w.budgetPlaceholder} />
      </div>

      <section style={{ ...coPanelStyle, padding: '12px' }}>
        <p style={coSectionTitle}>CAMPAIGN TIMELINE</p>
        <div className="space-y-1">
          {plan.timeline.map((phase, i) => (
            <div key={phase.id}>
              <div className="flex gap-2 items-center py-2" style={{ borderBottom: CO_VISUAL.divider }}>
                <span style={{ ...coCaption, fontFamily: '"Futura PT Medium"', color: CO_VISUAL.black, minWidth: '56px' }}>{phase.label}</span>
                <span style={coCaption}>{phase.focus}</span>
              </div>
              {i < plan.timeline.length - 1 ? <p style={{ ...coCaption, textAlign: 'center', color: CO_VISUAL.red }}>↓</p> : null}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section style={{ ...coPanelStyle, padding: '12px' }}>
          <p style={coSectionTitle}>UPCOMING TASKS</p>
          {upcoming.map((t) => (
            <div key={t.id} className="mb-2 pb-2" style={{ borderBottom: CO_VISUAL.divider }}>
              <div className="flex justify-between gap-2">
                <span style={{ ...coCaption, color: CO_VISUAL.black }}>{t.title}</span>
                <button type="button" onClick={() => onAdvanceTask(t.id)} style={{ ...coActionBtn, fontSize: '7px', padding: '2px 4px' }}>ADVANCE</button>
              </div>
              <p style={{ ...coCaption, fontSize: '7px' }}>{CAMPAIGN_DEPARTMENTS.find((d) => d.id === t.department)?.label} · WEEK {t.week} · {t.status.toUpperCase()}</p>
              {t.dependsOn?.length ? (
                <p style={{ ...coCaption, fontSize: '6px' }}>DEPENDS: {getTaskDependencyChain(plan.tasks, t.id).join(' → ')}</p>
              ) : null}
            </div>
          ))}
        </section>

        <section style={{ ...coPanelStyle, padding: '12px' }}>
          <p style={coSectionTitle}>DELIVERABLES</p>
          {plan.deliverables.map((d) => (
            <p key={d.id} style={coCaption}>{d.type} · {d.channel} · {d.status.toUpperCase()}</p>
          ))}
          <p style={{ ...coCaption, marginTop: '8px', fontSize: '7px' }}>CATALOG: {DELIVERABLE_CATALOG.slice(0, 6).join(' · ')}…</p>
        </section>
      </div>

      <section style={{ ...coPanelStyle, padding: '12px' }}>
        <p style={coSectionTitle}>EXECUTIVE AI DIRECTOR REVIEW</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-2">
          <Stat label="TIMELINE" value={`${plan.executiveReview.timelineScore}%`} />
          <Stat label="RESOURCES" value={`${plan.executiveReview.resourcesScore}%`} />
          <Stat label="BRAND" value={`${plan.executiveReview.brandAlignment}%`} />
          <Stat label="AUDIENCE" value={`${plan.executiveReview.audienceAlignment}%`} />
          <Stat label="RISK" value={plan.executiveReview.riskLevel.toUpperCase()} />
        </div>
        {plan.executiveReview.suggestions.map((s, i) => (
          <p key={i} style={coCaption}>{s}</p>
        ))}
      </section>

      <section style={{ ...coPanelStyle, padding: '12px' }}>
        <p style={coSectionTitle}>SMART RECOMMENDATIONS</p>
        {plan.recommendations.map((r) => (
          <div key={r.id} className="mb-2">
            <p style={{ ...coCaption, color: CO_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{r.title}</p>
            <p style={coCaption}>{r.reasoning}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section style={{ ...coPanelStyle, padding: '12px' }}>
          <p style={coSectionTitle}>APPROVAL GATES · NO AUTO-EXECUTE</p>
          {plan.approvals.map((a) => (
            <label key={a.id} className="flex items-center gap-2 py-1 cursor-pointer">
              <input type="checkbox" checked={a.approved} onChange={() => onToggleApproval(a.id)} />
              <span style={{ ...coCaption, color: a.approved ? CO_VISUAL.pass : CO_VISUAL.gray }}>{a.label}</span>
            </label>
          ))}
        </section>

        <section style={{ ...coPanelStyle, padding: '12px' }}>
          <p style={coSectionTitle}>AUTOMATION RULES · STOPS AT APPROVAL</p>
          {plan.automation.map((rule) => (
            <div key={rule.id} className="mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rule.enabled} onChange={() => onToggleAutomation(rule.id)} />
                <span style={coCaption}>{rule.trigger} → {rule.action}</span>
              </label>
            </div>
          ))}
        </section>
      </div>

      <section style={{ ...coPanelStyle, padding: '12px' }}>
        <p style={coSectionTitle}>WHAT-IF MODE</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {plan.whatIfScenarios.map((s, i) => (
            <div key={s.id} style={{ border: CO_VISUAL.border, padding: '8px', background: '#fff' }}>
              {i > 0 ? <p style={{ ...coCaption, color: CO_VISUAL.red }}>VS.</p> : null}
              <p style={{ ...coCaption, fontFamily: '"Futura PT Medium"', color: CO_VISUAL.black }}>{s.label}</p>
              <p style={coCaption}>REACH: {s.estimatedReach}</p>
              <p style={coCaption}>REVENUE: {s.estimatedRevenue}</p>
              <p style={{ ...coCaption, fontSize: '7px' }}>{s.confidence}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...coPanelStyle, padding: '12px' }}>
        <p style={coSectionTitle}>RESOURCE VIEW</p>
        <p style={coCaption}>CONTENT PACKS · {plan.deliverables.length} PLANNED</p>
        <p style={coCaption}>STUDIOS · {w.studios.join(', ') || '—'}</p>
        <p style={coCaption}>TALENT · {w.talent.join(', ') || '—'}</p>
        <p style={coCaption}>COMPLETED TASKS · {completed.length} / {plan.tasks.length}</p>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ ...coPanelStyle, padding: '8px' }}>
      <p style={{ ...coCaption, fontSize: '7px' }}>{label}</p>
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: highlight ? CO_VISUAL.red : CO_VISUAL.black }}>{value}</p>
    </div>
  );
}
