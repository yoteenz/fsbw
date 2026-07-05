import { useNavigate } from 'react-router-dom';
import { useCampusTransition } from '../../studio-os/campus/CampusTransitionProvider';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { useAdminStudioMissionControl } from '../../../../hooks/useAdminStudioMissionControlState';
import { useAdminStudioKnowledgeHub } from '../../../../hooks/useAdminStudioKnowledgeHubState';
import { adminStudioKnowledgeHubPath, adminStudioKnowledgeHubProfilePath, adminStudioChiefOfStaffPath } from '../../../../utils/adminStudioRoutes';
import { KNOWLEDGE_MISSION_STATS } from '../../../../utils/adminStudioKnowledgeHubDemo';
import { AdminStudioExecutiveCard } from '../AdminStudioExecutiveCard';
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
  missionStatusColor,
} from '../../../../utils/adminStudioMissionControlDemo';
import { StudioLivingIndicator } from '../immersion/StudioLivingIndicator';
import { useStudioImmersion } from '../../../../hooks/useStudioImmersion';
import {
  MC_VISUAL,
  MISSION_CONTROL_STYLES,
  mcActionBtn,
  mcBreathingPanel,
  mcCaption,
  mcGrace,
  mcLiveDot,
  mcPanelStyle,
  mcSectionTitle,
} from './missionControlTheme';

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

  return (
    <div className="mission-control-root">
      <style>{MISSION_CONTROL_STYLES}</style>

      {/* WORKSPACE HEADER */}
      <header className="studio-wing-section" style={{ ...mcBreathingPanel, padding: '12px', marginBottom: '12px' }}>
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
              TODAY&apos;S QUESTION · WHAT SHOULD THE FOUNDER KNOW RIGHT NOW?
            </p>
            <p style={mcCaption}>
              {header.quarter} · {header.season} · {header.currentCampaign}
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
            {visibleNotifications.slice(0, 3).map((n) => (
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
          <button type="button" onClick={() => navigate('/admin/studio/executive-ai-director')} style={mcActionBtn}>
            AI DIRECTOR
          </button>
          <span style={{ ...mcCaption, alignSelf: 'center' }}>{pendingApprovalCount} APPROVALS</span>
        </div>
      </header>

      {/* MISSION OVERVIEW — CENTER HERO */}
      <section className="studio-wing-section studio-living-panel" style={{ ...mcPanelStyle, padding: '14px', marginBottom: '12px' }}>
        <p style={{ ...mcGrace, fontSize: '22px' }}>{MISSION_OVERVIEW.title}</p>
        <p style={mcCaption}>CURRENT MISSION · PHASE {MISSION_OVERVIEW.phase}</p>
        <div className="mt-3 relative h-3 w-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)', border: MC_VISUAL.border }}>
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${MISSION_OVERVIEW.progressPct}%`, background: `linear-gradient(90deg, ${MC_VISUAL.red} 0%, #C41E3A 100%)` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
          {[
            { label: 'PROGRESS', value: `${MISSION_OVERVIEW.progressPct}%` },
            { label: 'DAYS LEFT', value: String(MISSION_OVERVIEW.daysRemaining) },
            { label: 'READINESS', value: `${MISSION_OVERVIEW.readinessScore}%` },
            { label: 'NEXT', value: MISSION_OVERVIEW.upcomingMilestone },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <p style={{ ...mcGrace, fontSize: '16px', color: MC_VISUAL.red }}>{stat.value}</p>
              <p style={mcCaption}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KNOWLEDGE HUB — LEARNING LAYER */}
      <section style={{ ...mcPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={mcSectionTitle}>KNOWLEDGE HUB · DOCUMENTATION HEALTH</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
          {[
            { label: 'KNOWLEDGE HEALTH', value: `${KNOWLEDGE_MISSION_STATS.knowledgeHealthPct}%` },
            { label: 'UNREAD GUIDES', value: String(KNOWLEDGE_MISSION_STATS.unreadGuides) },
            { label: 'NEW FEATURES', value: String(KNOWLEDGE_MISSION_STATS.newFeatures) },
            { label: 'DOC UPDATES', value: String(KNOWLEDGE_MISSION_STATS.documentationUpdates.length) },
          ].map((s) => (
            <div key={s.label} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <p style={{ ...mcGrace, fontSize: '14px', color: MC_VISUAL.red }}>{s.value}</p>
              <p style={{ ...mcCaption, fontSize: '7px' }}>{s.label}</p>
            </div>
          ))}
        </div>
        <p style={{ ...mcSectionTitle, marginTop: 4 }}>RECOMMENDED LEARNING</p>
        {KNOWLEDGE_MISSION_STATS.recommendedLearning.map((item) => (
          <p key={item} style={{ ...mcCaption, color: MC_VISUAL.black }}>• {item}</p>
        ))}
        <p style={{ ...mcSectionTitle, marginTop: 10 }}>UNREAD GUIDES</p>
        {unreadGuides.length === 0 ? (
          <p style={mcCaption}>ALL GUIDES READ — KNOWLEDGE HUB CURRENT</p>
        ) : (
          unreadGuides.slice(0, 4).map((guide) => (
            <div key={guide.id} className="flex items-center justify-between gap-2 py-1" style={{ borderBottom: '1px solid #eee' }}>
              <p style={{ ...mcCaption, color: MC_VISUAL.black, flex: 1 }}>{guide.title}</p>
              <button type="button" onClick={() => markGuideRead(guide.id)} style={mcActionBtn}>
                MARK READ
              </button>
            </div>
          ))
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" onClick={() => navigate(adminStudioKnowledgeHubPath())} style={mcActionBtn}>
            OPEN KNOWLEDGE HUB
          </button>
          <button type="button" onClick={() => navigate(adminStudioKnowledgeHubProfilePath('weather-studio'))} style={mcActionBtn}>
            WEATHER STUDIO PROFILE
          </button>
        </div>
      </section>

      {/* LEFT BRIEF + RIGHT AI DIRECTOR */}
      <div className="grid grid-cols-1 gap-3 mb-3 lg:grid-cols-2">
        <section className="studio-wing-section studio-living-panel" style={{ ...mcBreathingPanel, padding: '12px' }}>
          <p style={mcSectionTitle}>TODAY&apos;S BRIEFING · EXECUTIVE BRIEF</p>
          <p style={{ ...mcGrace, fontSize: '16px' }}>{MISSION_EXECUTIVE_BRIEF.greeting}</p>
          <p style={{ ...mcCaption, color: MC_VISUAL.black, marginTop: 4 }}>{MISSION_EXECUTIVE_BRIEF.welcome}</p>
          <p style={{ ...mcCaption, marginTop: 8 }}>
            CURRENT MISSION: <span style={{ color: MC_VISUAL.red }}>{MISSION_EXECUTIVE_BRIEF.currentMission}</span>
          </p>
          <p style={{ ...mcSectionTitle, marginTop: 10 }}>TODAY&apos;S PRIORITIES</p>
          <ul className="space-y-1">
            {MISSION_EXECUTIVE_BRIEF.todayPriorities.map((p) => (
              <li key={p} style={{ ...mcCaption, color: MC_VISUAL.black }}>• {p}</li>
            ))}
          </ul>
          <p style={{ ...mcSectionTitle, marginTop: 10 }}>YESTERDAY</p>
          {MISSION_EXECUTIVE_BRIEF.yesterday.map((y) => (
            <p key={y} style={mcCaption}>• {y}</p>
          ))}
          <p style={{ ...mcSectionTitle, marginTop: 10 }}>TODAY&apos;S FOCUS</p>
          <p style={{ ...mcGrace, fontSize: '14px', color: MC_VISUAL.red }}>{MISSION_EXECUTIVE_BRIEF.todayFocus}</p>
        </section>

        <section style={{ ...mcPanelStyle, padding: '12px' }}>
          <p style={mcSectionTitle}>EXECUTIVE AI DIRECTOR</p>
          <p style={{ ...mcCaption, color: MC_VISUAL.black, marginBottom: 8 }}>{AI_DIRECTOR_DOCK.recommendation}</p>
          <div className="space-y-2">
            {AI_DIRECTOR_DOCK.insights.map((ins) => (
              <div key={ins.id} style={{ borderLeft: `3px solid ${ins.accentHex}`, paddingLeft: 8 }}>
                <p style={{ ...mcCaption, color: ins.accentHex, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{ins.label}</p>
                <p style={{ ...mcCaption, color: MC_VISUAL.black }}>{ins.text}</p>
                <p style={{ ...mcCaption, fontSize: '7px' }}>{ins.source === 'history' ? 'WORKSPACE HISTORY' : ins.source === 'config' ? 'CURRENT CONFIGURATION' : 'PREDICTIVE ESTIMATE'}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => navigate('/admin/studio/executive-ai-director')} style={{ ...mcActionBtn, marginTop: 10 }}>
            REVIEW MISSION
          </button>
        </section>
      </div>

      {/* ACTIVE MISSIONS */}
      <section style={{ marginBottom: '12px' }}>
        <p style={mcSectionTitle}>ACTIVE MISSIONS</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACTIVE_MISSIONS.slice(0, 4).map((m) => (
            <AdminStudioExecutiveCard
              key={m.id}
              title={m.title}
              metric={`${m.progressPct}%`}
              description={`${m.status.toUpperCase()} · ${m.deadline} · ${m.nextAction}`}
              accentHex={missionStatusColor(m.status)}
              onClick={() => navigate(m.route)}
            />
          ))}
        </div>
      </section>

      {/* MISSION TIMELINE */}
      <section style={{ ...mcPanelStyle, padding: '12px', marginBottom: '12px', overflowX: 'auto' }}>
        <p style={mcSectionTitle}>MISSION TIMELINE</p>
        <div className="flex items-center gap-1 min-w-max pb-1">
          {MISSION_PHASES.map((phase, idx) => {
            const active = idx === currentPhaseIdx;
            const past = idx < currentPhaseIdx;
            return (
              <div key={phase.id} className="flex items-center">
                <div
                  className="px--2 py-1 text-center"
                  style={{
                    padding: '6px 10px',
                    border: active ? `2px solid ${MC_VISUAL.red}` : MC_VISUAL.border,
                    background: active ? 'rgba(235,28,36,0.08)' : past ? 'rgba(22,163,74,0.08)' : MC_VISUAL.glass,
                  }}
                >
                  <p style={{ ...mcCaption, color: active ? MC_VISUAL.red : MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
                    {phase.label}
                  </p>
                </div>
                {idx < MISSION_PHASES.length - 1 ? (
                  <span style={{ color: MC_VISUAL.gray, margin: '0 4px', fontSize: '10px' }}>↓</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* BLUEPRINT FACTORY FOUNDATION */}
      <section style={{ ...mcPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={mcSectionTitle}>BLUEPRINT MANAGER · ASSET FACTORY FOUNDATION</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 mb-3">
          {[
            { label: 'READY', value: MISSION_CONTROL_BLUEPRINT_STATS.ready },
            { label: 'MISSING ASSETS', value: MISSION_CONTROL_BLUEPRINT_STATS.missingAssets },
            { label: 'AWAITING APPROVAL', value: MISSION_CONTROL_BLUEPRINT_STATS.awaitingApproval },
            { label: 'BLUEPRINT HEALTH', value: `${MISSION_CONTROL_BLUEPRINT_STATS.health}%` },
            { label: 'FACTORY READINESS', value: `${MISSION_CONTROL_BLUEPRINT_STATS.factoryReadiness}%` },
          ].map((s) => (
            <div key={s.label} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <p style={{ ...mcGrace, fontSize: '14px', color: MC_VISUAL.red }}>{s.value}</p>
              <p style={{ ...mcCaption, fontSize: '7px' }}>{s.label}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => navigate('/admin/studio/blueprint-manager')} style={mcActionBtn}>
          OPEN BLUEPRINT MANAGER
        </button>
        <button type="button" onClick={() => navigate('/admin/studio/asset-factory')} style={{ ...mcActionBtn, marginLeft: 8 }}>
          ENTER ASSET FACTORY
        </button>
      </section>

      {/* ASSET FACTORY */}
      <section style={{ ...mcPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={mcSectionTitle}>ASSET FACTORY · MANUFACTURING</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-3">
          {[
            { label: 'FACTORY HEALTH', value: `${MISSION_CONTROL_FACTORY_STATS.factoryHealth}%` },
            { label: 'JOBS RUNNING', value: MISSION_CONTROL_FACTORY_STATS.jobsRunning },
            { label: 'JOBS WAITING', value: MISSION_CONTROL_FACTORY_STATS.jobsWaiting },
            { label: 'JOBS FAILED', value: MISSION_CONTROL_FACTORY_STATS.jobsFailed },
            { label: 'CREDITS LEFT', value: MISSION_CONTROL_FACTORY_STATS.creditsRemaining },
            { label: 'EFFICIENCY', value: `${MISSION_CONTROL_FACTORY_STATS.factoryEfficiency}%` },
          ].map((s) => (
            <div key={s.label} className="text-center py-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <p style={{ ...mcGrace, fontSize: '14px', color: MC_VISUAL.red }}>{s.value}</p>
              <p style={{ ...mcCaption, fontSize: '7px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPARTMENT GRID */}
      <section style={{ marginBottom: '12px' }}>
        <p style={mcSectionTitle}>DEPARTMENT GRID</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DEPARTMENT_GRID.slice(0, 8).map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => navigate(dept.route)}
              className="text-left p-2 transition-transform active:scale-[0.98]"
              style={{ ...mcBreathingPanel, cursor: 'pointer' }}
            >
              <p style={{ ...mcCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{dept.title}</p>
              <p style={{ ...mcGrace, fontSize: '14px', color: MC_VISUAL.red }}>{dept.health}%</p>
              <p style={mcCaption}>{dept.currentTask}</p>
              <p style={{ ...mcCaption, fontSize: '7px' }}>
                BLOCKED {dept.blocked} · READY {dept.ready} · APPROVALS {dept.pendingApprovals}
              </p>
              <p style={{ ...mcCaption, fontSize: '7px', marginTop: 4 }}>{dept.recentActivity}</p>
            </button>
          ))}
        </div>
      </section>

      {/* EXECUTIVE CALENDAR */}
      <section style={{ ...mcPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={mcSectionTitle}>EXECUTIVE CALENDAR</p>
        <div className="space-y-1">
          {EXECUTIVE_CALENDAR.map((e) => (
            <div key={e.id} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid #eee' }}>
              <p style={{ ...mcCaption, color: MC_VISUAL.black }}>{e.label}</p>
              <span style={{ ...mcCaption, color: MC_VISUAL.red }}>{e.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* APPROVAL CENTER */}
      <section id="approvals" style={{ ...mcPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={mcSectionTitle}>APPROVAL CENTER · {pendingApprovalCount} PENDING</p>
        <div className="space-y-2">
          {approvals.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-center gap-2 py-1" style={{ borderBottom: '1px solid #eee' }}>
              <div className="flex-1 min-w-0">
                <p style={{ ...mcCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{a.title}</p>
                <p style={mcCaption}>{a.type.toUpperCase()} · {a.department} · {a.due}</p>
              </div>
              {a.status === 'pending' ? (
                <button type="button" onClick={() => approveItem(a.id)} style={mcActionBtn}>
                  APPROVE
                </button>
              ) : (
                <span style={{ ...mcCaption, color: MC_VISUAL.pass }}>APPROVED</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BUSINESS HEALTH */}
      <section style={{ marginBottom: '12px' }}>
        <p style={mcSectionTitle}>BUSINESS HEALTH</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BUSINESS_HEALTH_SCORECARDS.map((h) => (
            <div key={h.id} style={{ ...mcPanelStyle, padding: '10px', textAlign: 'center' }}>
              <p style={{ ...mcGrace, fontSize: '18px', color: MC_VISUAL.red }}>{h.score}</p>
              <p style={mcCaption}>{h.label}</p>
              <div className="mt-1 h-1 w-full" style={{ background: '#eee' }}>
                <div className="h-full" style={{ width: `${h.score}%`, background: h.trend === 'down' ? MC_VISUAL.warn : MC_VISUAL.pass }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section style={{ marginBottom: '12px' }}>
        <p style={mcSectionTitle}>QUICK ACTIONS</p>
        <div className="flex flex-wrap gap-2">
          {MISSION_QUICK_ACTIONS.map((qa) => (
            <button key={qa.id} type="button" onClick={() => navigate(qa.route)} style={mcActionBtn}>
              {qa.label}
            </button>
          ))}
        </div>
      </section>

      {/* WORKSPACE MEMORY */}
      <section style={{ ...mcPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={mcSectionTitle}>WORKSPACE MEMORY</p>
        <p style={mcCaption}>THIS DAY IN HISTORY · {WORKSPACE_MEMORY.thisDayInHistory}</p>
        <p style={mcCaption}>ONE YEAR AGO · {WORKSPACE_MEMORY.oneYearAgo}</p>
        <p style={{ ...mcSectionTitle, marginTop: 8 }}>BIGGEST WINS</p>
        {WORKSPACE_MEMORY.biggestWins.map((w) => (
          <p key={w} style={mcCaption}>• {w}</p>
        ))}
        <p style={{ ...mcSectionTitle, marginTop: 8 }}>HALL OF FAME</p>
        <p style={{ ...mcCaption, color: MC_VISUAL.black }}>{WORKSPACE_MEMORY.hallOfFame}</p>
        <p style={{ ...mcSectionTitle, marginTop: 8 }}>FOUNDER NOTES</p>
        <p style={{ ...mcGrace, fontSize: '12px' }}>{WORKSPACE_MEMORY.founderNotes}</p>
        <button type="button" onClick={() => navigate('/admin/studio/legacy-system')} style={{ ...mcActionBtn, marginTop: 8 }}>
          OPEN LEGACY
        </button>
      </section>

      {/* LIVE ACTIVITY FEED — BOTTOM BAR */}
      <footer
        style={{
          ...mcBreathingPanel,
          padding: '10px 12px',
          position: 'sticky',
          bottom: 0,
          zIndex: 20,
          marginTop: '8px',
        }}
      >
        <p style={{ ...mcSectionTitle, marginBottom: 4 }}>
          <span style={mcLiveDot} />
          LIVE ACTIVITY
        </p>
        <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {LIVE_ACTIVITY_SEED.slice(0, 6).map((act, idx) => (
            <div
              key={act.id}
              className="studio-activity-entry flex-shrink-0 min-w-[180px]"
              style={{
                borderLeft: `2px solid ${MC_VISUAL.red}`,
                paddingLeft: 8,
                animationDelay: `${idx * 0.06}s`,
              }}
            >
              <p style={{ ...mcCaption, color: MC_VISUAL.black, fontSize: '8px' }}>{act.text}</p>
              <p style={{ ...mcCaption, fontSize: '7px' }}>{act.time} · {act.category}</p>
            </div>
          ))}
          {presenceFeed.slice(0, 2).map((p, idx) => (
            <div
              key={p.id}
              className="studio-activity-entry flex-shrink-0 min-w-[160px]"
              style={{
                borderLeft: `2px solid #92704A`,
                paddingLeft: 8,
                animationDelay: `${(idx + 6) * 0.06}s`,
              }}
            >
              <p style={{ ...mcCaption, color: MC_VISUAL.black, fontSize: '8px' }}>
                {p.concierge} · {p.activity}
              </p>
              <p style={{ ...mcCaption, fontSize: '7px' }}>{p.location} · CONCIERGE</p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
