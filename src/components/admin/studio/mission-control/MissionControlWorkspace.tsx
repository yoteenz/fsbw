import { useNavigate } from 'react-router-dom';
import { useCampusTransition } from '../../studio-os/campus/CampusTransitionProvider';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { useAdminStudioMissionControl } from '../../../../hooks/useAdminStudioMissionControlState';
import { useAdminStudioKnowledgeHub } from '../../../../hooks/useAdminStudioKnowledgeHubState';
import { adminStudioKnowledgeHubPath, adminStudioChiefOfStaffPath } from '../../../../utils/adminStudioRoutes';
import { KNOWLEDGE_MISSION_STATS } from '../../../../utils/adminStudioKnowledgeHubDemo';
import {
  ACTIVE_MISSIONS,
  AI_DIRECTOR_DOCK,
  BUSINESS_HEALTH_SCORECARDS,
  DEPARTMENT_GRID,
  EXECUTIVE_CALENDAR,
  LIVE_ACTIVITY_SEED,
  MISSION_CONTROL_HEADER,
  MISSION_CURRENT_PHASE,
  MISSION_EXECUTIVE_BRIEF,
  MISSION_OVERVIEW,
  MISSION_PHASES,
  MISSION_QUICK_ACTIONS,
  MISSION_CONTROL_BLUEPRINT_STATS,
  MISSION_CONTROL_FACTORY_STATS,
  SMART_NOTIFICATIONS,
  WORKSPACE_MEMORY,
} from '../../../../utils/adminStudioMissionControlDemo';
import { StudioLivingIndicator } from '../immersion/StudioLivingIndicator';
import { useStudioImmersion } from '../../../../hooks/useStudioImmersion';
import {
  ExecutiveCollapsibleSection,
  ExecutiveFocusList,
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutiveIconNav,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
  ExecutiveVisualSummary,
  eiaActionBtn,
  eiaCaption,
  eiaGrace,
  eiaPanel,
  eiaSectionTitle,
} from '../executive-ia';
import {
  MC_VISUAL,
  MISSION_CONTROL_STYLES,
  mcActionBtn,
  mcBreathingPanel,
  mcCaption,
  mcGrace,
  mcLiveDot,
} from './missionControlTheme';

const DEPARTMENT_ICONS: Record<string, string> = {
  creative: '🎨',
  production: '🎬',
  'asset-director': '🖼️',
  distribution: '🚀',
  audience: '📈',
  legacy: '🏛️',
  analytics: '📊',
  automation: '⚙️',
};

function departmentStatus(dept: (typeof DEPARTMENT_GRID)[number]): 'active' | 'attention' | 'idle' | 'blocked' {
  if (dept.blocked > 0) return 'blocked';
  if (dept.pendingApprovals > 0) return 'attention';
  if (dept.health >= 90) return 'active';
  return 'idle';
}

export function MissionControlWorkspace() {
  const navigate = useNavigate();
  const { returnToCampus } = useCampusTransition();
  const { workspace } = useWorkspace();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    approvals,
    pendingApprovalCount,
    approveItem,
    dismissedNotifications,
    dismissNotification,
  } = useAdminStudioMissionControl();
  const { unreadGuides, markGuideRead } = useAdminStudioKnowledgeHub();

  const { presenceFeed } = useStudioImmersion();
  const header = MISSION_CONTROL_HEADER;
  const visibleNotifications = SMART_NOTIFICATIONS.filter((n) => !dismissedNotifications.includes(n.id));
  const currentPhaseIdx = MISSION_PHASES.findIndex((p) => p.id === MISSION_CURRENT_PHASE);

  const departmentNavItems = [
    {
      id: 'overview',
      icon: '📊',
      title: 'OVERVIEW',
      subtitle: 'MISSION CONTROL · HQ',
      status: 'active' as const,
    },
    ...DEPARTMENT_GRID.slice(0, 7).map((dept) => ({
    id: dept.id,
    icon: DEPARTMENT_ICONS[dept.id] ?? '📁',
    title: dept.title,
    subtitle: `${dept.health}% · ${dept.currentTask}`,
    status: departmentStatus(dept),
    onSelect: () => navigate(dept.route),
  })),
  ];

  return (
    <div className="mission-control-root">
      <style>{MISSION_CONTROL_STYLES}</style>

      <ExecutivePageShell>
        {/* HEADER — workspace context, search, notifications */}
        <header className="studio-wing-section" style={{ ...mcBreathingPanel, padding: '12px 14px' }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 border overflow-hidden" style={{ width: 44, height: 44, borderColor: MC_VISUAL.black }}>
              <img src={workspace.logoSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ ...mcGrace, fontSize: '18px', lineHeight: 1.1 }}>{workspace.displayName}</p>
              <p style={mcCaption}>
                <span style={mcLiveDot} />
                MISSION STATUS · {header.missionStatus.replace('-', ' ').toUpperCase()} · HEALTH {header.workspaceHealth}%
              </p>
              <p style={{ ...mcCaption, color: MC_VISUAL.black, marginTop: 4 }}>
                <StudioLivingIndicator label="HEADQUARTERS ACTIVE" state="busy" />
                {' · '}
                {header.quarter} · {header.season}
              </p>
            </div>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="MISSION SEARCH — PACKS · CAMPAIGNS · ASSETS · TALENT…"
            className="w-full mt-3 bg-white/90 border text-black text-[8px] font-futura uppercase px-3 py-2 outline-none"
            style={{ fontWeight: 515, borderColor: MC_VISUAL.black, borderWidth: '1.3px' }}
          />
          {searchResults.length > 0 ? (
            <div className="mt-2 border max-h-32 overflow-y-auto" style={{ borderColor: MC_VISUAL.border, background: '#fff' }}>
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(r.route)}
                  className="w-full text-left px-2 py-1.5 border-b"
                  style={{ ...mcCaption, color: MC_VISUAL.black, borderColor: '#eee', cursor: 'pointer' }}
                >
                  {r.label} · <span style={{ color: MC_VISUAL.red }}>{r.category}</span>
                </button>
              ))}
            </div>
          ) : null}

          {visibleNotifications.length > 0 ? (
            <div className="mt-2 space-y-1">
              {visibleNotifications.slice(0, 2).map((n) => (
                <div key={n.id} className="flex items-start gap-2 px-2 py-1" style={{ background: 'rgba(235,28,36,0.06)', border: MC_VISUAL.border }}>
                  <p style={{ ...mcCaption, flex: 1, color: MC_VISUAL.black, fontSize: '8px' }}>
                    <span style={{ color: MC_VISUAL.red, fontFamily: '"Futura PT Medium"' }}>{n.title}</span> — {n.text}
                  </p>
                  <button type="button" onClick={() => dismissNotification(n.id)} style={{ ...mcCaption, color: MC_VISUAL.gray, fontSize: '7px', border: 'none', background: 'none', cursor: 'pointer' }}>
                    DISMISS
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={() => returnToCampus()} style={mcActionBtn}>
              SWITCH WORKSPACE
            </button>
            <button type="button" onClick={() => navigate(adminStudioChiefOfStaffPath())} style={mcActionBtn}>
              CHIEF OF STAFF
            </button>
            <span style={{ ...mcCaption, alignSelf: 'center' }}>{pendingApprovalCount} APPROVALS</span>
          </div>
        </header>

        {/* HERO — single visual anchor */}
        <ExecutiveHeroCard
          eyebrow={`TODAY'S PRIORITY · PHASE ${MISSION_OVERVIEW.phase}`}
          title={MISSION_OVERVIEW.title}
          subtitle={`${header.currentCampaign} · READINESS ${MISSION_OVERVIEW.readinessScore}% · ${MISSION_OVERVIEW.daysRemaining} DAYS LEFT`}
          progressPct={MISSION_OVERVIEW.progressPct}
          stats={[
            { label: 'PROGRESS', value: `${MISSION_OVERVIEW.progressPct}%` },
            { label: 'DAYS LEFT', value: String(MISSION_OVERVIEW.daysRemaining) },
            { label: 'READINESS', value: `${MISSION_OVERVIEW.readinessScore}%` },
            { label: 'NEXT', value: MISSION_OVERVIEW.upcomingMilestone },
          ]}
        />

        {/* ICON NAV — department destinations */}
        <ExecutiveIconNav
          label="WALK THE DEPARTMENTS"
          items={departmentNavItems}
          activeId="overview"
        />

        {/* VISUAL SUMMARY — mission timeline at a glance */}
        <ExecutiveVisualSummary title="MISSION TIMELINE · STATUS AT A GLANCE">
          <div className="flex items-center gap-1 min-w-max pb-1 overflow-x-auto">
            {MISSION_PHASES.map((phase, idx) => {
              const active = idx === currentPhaseIdx;
              const past = idx < currentPhaseIdx;
              return (
                <div key={phase.id} className="flex items-center">
                  <div
                    style={{
                      padding: '8px 12px',
                      border: active ? `2px solid ${MC_VISUAL.red}` : MC_VISUAL.border,
                      background: active ? 'rgba(235,28,36,0.08)' : past ? 'rgba(22,163,74,0.08)' : MC_VISUAL.glass,
                    }}
                  >
                    <p
                      style={{
                        ...mcCaption,
                        color: active ? MC_VISUAL.red : MC_VISUAL.black,
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '8px',
                      }}
                    >
                      {phase.label}
                    </p>
                  </div>
                  {idx < MISSION_PHASES.length - 1 ? (
                    <span style={{ color: MC_VISUAL.gray, margin: '0 6px', fontSize: '10px' }}>→</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </ExecutiveVisualSummary>

        {/* FOCUS PANEL — primary working area */}
        <ExecutiveFocusPanel
          title="TODAY'S EXECUTIVE BRIEFING"
          subtitle={MISSION_EXECUTIVE_BRIEF.greeting}
          highlight={MISSION_EXECUTIVE_BRIEF.todayFocus}
        >
          <p style={{ ...eiaCaption, color: MC_VISUAL.black }}>{MISSION_EXECUTIVE_BRIEF.welcome}</p>
          <p style={{ ...eiaCaption, marginTop: 8 }}>
            CURRENT MISSION: <span style={{ color: MC_VISUAL.red }}>{MISSION_EXECUTIVE_BRIEF.currentMission}</span>
          </p>
          <p style={{ ...eiaSectionTitle, marginTop: 14 }}>TODAY&apos;S PRIORITIES</p>
          <ExecutiveFocusList items={MISSION_EXECUTIVE_BRIEF.todayPriorities} />
          <p style={{ ...eiaSectionTitle, marginTop: 14 }}>YESTERDAY</p>
          <ExecutiveFocusList items={MISSION_EXECUTIVE_BRIEF.yesterday} />
        </ExecutiveFocusPanel>

        {/* SECONDARY — grouped supporting information */}
        <ExecutiveSecondaryGrid title="ACTIVE MISSIONS & APPROVALS">
          <ExecutiveSecondaryCard title="ACTIVE MISSIONS">
            <div className="space-y-2">
              {ACTIVE_MISSIONS.slice(0, 3).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(m.route)}
                  className="w-full text-left py-1"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
                    {m.title}
                  </p>
                  <p style={{ ...eiaCaption, fontSize: '7px' }}>
                    {m.progressPct}% · {m.deadline}
                  </p>
                </button>
              ))}
            </div>
          </ExecutiveSecondaryCard>

          <ExecutiveSecondaryCard title={`APPROVAL CENTER · ${pendingApprovalCount} PENDING`} accent={MC_VISUAL.red}>
            <div className="space-y-2">
              {approvals.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-2 py-1" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex-1 min-w-0">
                    <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
                      {a.title}
                    </p>
                    <p style={{ ...eiaCaption, fontSize: '7px' }}>{a.type.toUpperCase()} · {a.due}</p>
                  </div>
                  {a.status === 'pending' ? (
                    <button type="button" onClick={() => approveItem(a.id)} style={eiaActionBtn}>
                      APPROVE
                    </button>
                  ) : (
                    <span style={{ ...eiaCaption, color: MC_VISUAL.pass }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </ExecutiveSecondaryCard>
        </ExecutiveSecondaryGrid>

        {/* SECONDARY — calendar + business health (lighter rhythm) */}
        <ExecutiveSecondaryGrid title="UPCOMING & BUSINESS HEALTH" columns={1}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ExecutiveSecondaryCard title="EXECUTIVE CALENDAR">
              <div className="space-y-1">
                {EXECUTIVE_CALENDAR.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex justify-between items-center py-1">
                    <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontSize: '8px' }}>{e.label}</p>
                    <span style={{ ...eiaCaption, color: MC_VISUAL.red, fontSize: '7px' }}>{e.date}</span>
                  </div>
                ))}
              </div>
            </ExecutiveSecondaryCard>

            <ExecutiveSecondaryCard title="BUSINESS HEALTH">
              <div className="grid grid-cols-2 gap-2">
                {BUSINESS_HEALTH_SCORECARDS.slice(0, 4).map((h) => (
                  <div key={h.id} className="text-center py-1">
                    <p style={{ ...eiaGrace, fontSize: '16px', color: MC_VISUAL.red }}>{h.score}</p>
                    <p style={{ ...eiaCaption, fontSize: '7px' }}>{h.label}</p>
                  </div>
                ))}
              </div>
            </ExecutiveSecondaryCard>
          </div>
        </ExecutiveSecondaryGrid>

        {/* QUICK ACTIONS — compact strip */}
        <section style={{ paddingTop: 4 }}>
          <p style={eiaSectionTitle}>QUICK ACTIONS</p>
          <div className="flex flex-wrap gap-2">
            {MISSION_QUICK_ACTIONS.map((qa) => (
              <button key={qa.id} type="button" onClick={() => navigate(qa.route)} style={eiaActionBtn}>
                {qa.label}
              </button>
            ))}
          </div>
        </section>

        {/* COLLAPSIBLE — progressive disclosure */}
        <ExecutiveCollapsibleSection
          title="EXECUTIVE AI DIRECTOR"
          subtitle={AI_DIRECTOR_DOCK.recommendation.slice(0, 80)}
          badge={`${AI_DIRECTOR_DOCK.insights.length} INSIGHTS`}
        >
          <div className="space-y-2">
            {AI_DIRECTOR_DOCK.insights.map((ins) => (
              <div key={ins.id} style={{ borderLeft: `3px solid ${ins.accentHex}`, paddingLeft: 8 }}>
                <p style={{ ...eiaCaption, color: ins.accentHex, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
                  {ins.label}
                </p>
                <p style={{ ...eiaCaption, color: MC_VISUAL.black }}>{ins.text}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => navigate('/admin/studio/executive-ai-director')} style={{ ...eiaActionBtn, marginTop: 10 }}>
            OPEN AI DIRECTOR
          </button>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection
          title="KNOWLEDGE HUB · DOCUMENTATION HEALTH"
          subtitle={`${KNOWLEDGE_MISSION_STATS.knowledgeHealthPct}% HEALTH · ${KNOWLEDGE_MISSION_STATS.unreadGuides} UNREAD`}
          badge={unreadGuides.length > 0 ? `${unreadGuides.length} GUIDES` : undefined}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
            {[
              { label: 'KNOWLEDGE HEALTH', value: `${KNOWLEDGE_MISSION_STATS.knowledgeHealthPct}%` },
              { label: 'UNREAD GUIDES', value: String(KNOWLEDGE_MISSION_STATS.unreadGuides) },
              { label: 'NEW FEATURES', value: String(KNOWLEDGE_MISSION_STATS.newFeatures) },
              { label: 'DOC UPDATES', value: String(KNOWLEDGE_MISSION_STATS.documentationUpdates.length) },
            ].map((s) => (
              <div key={s.label} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
                <p style={{ ...eiaGrace, fontSize: '14px', color: MC_VISUAL.red }}>{s.value}</p>
                <p style={{ ...eiaCaption, fontSize: '7px' }}>{s.label}</p>
              </div>
            ))}
          </div>
          {unreadGuides.slice(0, 4).map((guide) => (
            <div key={guide.id} className="flex items-center justify-between gap-2 py-1" style={{ borderBottom: '1px solid #eee' }}>
              <p style={{ ...eiaCaption, color: MC_VISUAL.black, flex: 1 }}>{guide.title}</p>
              <button type="button" onClick={() => markGuideRead(guide.id)} style={eiaActionBtn}>
                MARK READ
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={() => navigate(adminStudioKnowledgeHubPath())} style={eiaActionBtn}>
              OPEN KNOWLEDGE HUB
            </button>
          </div>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection
          title="BLUEPRINT MANAGER · ASSET FACTORY"
          subtitle={`${MISSION_CONTROL_BLUEPRINT_STATS.ready} READY · ${MISSION_CONTROL_FACTORY_STATS.jobsRunning} JOBS RUNNING`}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-3">
            {[
              { label: 'BLUEPRINT HEALTH', value: `${MISSION_CONTROL_BLUEPRINT_STATS.health}%` },
              { label: 'FACTORY READINESS', value: `${MISSION_CONTROL_BLUEPRINT_STATS.factoryReadiness}%` },
              { label: 'FACTORY HEALTH', value: `${MISSION_CONTROL_FACTORY_STATS.factoryHealth}%` },
              { label: 'JOBS RUNNING', value: MISSION_CONTROL_FACTORY_STATS.jobsRunning },
              { label: 'JOBS WAITING', value: MISSION_CONTROL_FACTORY_STATS.jobsWaiting },
              { label: 'EFFICIENCY', value: `${MISSION_CONTROL_FACTORY_STATS.factoryEfficiency}%` },
            ].map((s) => (
              <div key={s.label} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
                <p style={{ ...eiaGrace, fontSize: '14px', color: MC_VISUAL.red }}>{s.value}</p>
                <p style={{ ...eiaCaption, fontSize: '7px' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => navigate('/admin/studio/blueprint-manager')} style={eiaActionBtn}>
            OPEN BLUEPRINT MANAGER
          </button>
          <button type="button" onClick={() => navigate('/admin/studio/asset-factory')} style={{ ...eiaActionBtn, marginLeft: 8 }}>
            ENTER ASSET FACTORY
          </button>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection
          title="ALL DEPARTMENTS"
          subtitle="FULL GRID · HEALTH · BLOCKERS"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DEPARTMENT_GRID.slice(0, 8).map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => navigate(dept.route)}
                className="text-left p-2 transition-transform active:scale-[0.98]"
                style={{ ...eiaPanel, cursor: 'pointer' }}
              >
                <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{dept.title}</p>
                <p style={{ ...eiaGrace, fontSize: '14px', color: MC_VISUAL.red }}>{dept.health}%</p>
                <p style={{ ...eiaCaption, fontSize: '7px' }}>{dept.currentTask}</p>
              </button>
            ))}
          </div>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection title="WORKSPACE MEMORY · LEGACY" subtitle={WORKSPACE_MEMORY.thisDayInHistory.slice(0, 60)}>
          <p style={eiaCaption}>THIS DAY IN HISTORY · {WORKSPACE_MEMORY.thisDayInHistory}</p>
          <p style={eiaCaption}>ONE YEAR AGO · {WORKSPACE_MEMORY.oneYearAgo}</p>
          <p style={{ ...eiaSectionTitle, marginTop: 8 }}>BIGGEST WINS</p>
          <ExecutiveFocusList items={WORKSPACE_MEMORY.biggestWins} />
          <p style={{ ...eiaGrace, fontSize: '12px', marginTop: 8 }}>{WORKSPACE_MEMORY.founderNotes}</p>
          <button type="button" onClick={() => navigate('/admin/studio/legacy-system')} style={{ ...eiaActionBtn, marginTop: 8 }}>
            OPEN LEGACY
          </button>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection
          title="LIVE ACTIVITY FEED"
          subtitle={`${LIVE_ACTIVITY_SEED.length + presenceFeed.length} RECENT EVENTS`}
        >
          <div className="space-y-2">
            {LIVE_ACTIVITY_SEED.slice(0, 6).map((act) => (
              <div key={act.id} style={{ borderLeft: `2px solid ${MC_VISUAL.red}`, paddingLeft: 8 }}>
                <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontSize: '8px' }}>{act.text}</p>
                <p style={{ ...eiaCaption, fontSize: '7px' }}>{act.time} · {act.category}</p>
              </div>
            ))}
            {presenceFeed.slice(0, 3).map((p) => (
              <div key={p.id} style={{ borderLeft: '2px solid #92704A', paddingLeft: 8 }}>
                <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontSize: '8px' }}>
                  {p.concierge} · {p.activity}
                </p>
                <p style={{ ...eiaCaption, fontSize: '7px' }}>{p.location} · CONCIERGE</p>
              </div>
            ))}
          </div>
        </ExecutiveCollapsibleSection>
      </ExecutivePageShell>
    </div>
  );
}
