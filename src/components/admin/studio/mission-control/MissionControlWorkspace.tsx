import { useNavigate } from 'react-router-dom';
import { useCampusTransition } from '../../studio-os/campus/CampusTransitionProvider';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { useCompanyHealthIndexState } from '../../../../hooks/useCompanyHealthIndexState';
import { useAdminStudioMissionControl } from '../../../../hooks/useAdminStudioMissionControlState';
import { useAdminStudioKnowledgeHub } from '../../../../hooks/useAdminStudioKnowledgeHubState';
import { adminStudioKnowledgeHubPath, adminStudioChiefOfStaffPath } from '../../../../utils/adminStudioRoutes';
import { KNOWLEDGE_MISSION_STATS } from '../../../../utils/adminStudioKnowledgeHubDemo';
import {
  ACTIVE_MISSIONS,
  AI_DIRECTOR_DOCK,
  DEPARTMENT_GRID,
  EXECUTIVE_CALENDAR,
  LIVE_ACTIVITY_SEED,
  MISSION_CONTROL_HEADER,
  MISSION_CURRENT_PHASE,
  MISSION_EXECUTIVE_BRIEF,
  MISSION_OVERVIEW,
  MISSION_PHASES,
  MISSION_CONTROL_BLUEPRINT_STATS,
  MISSION_CONTROL_FACTORY_STATS,
  WORKSPACE_MEMORY,
} from '../../../../utils/adminStudioMissionControlDemo';
import { useStudioImmersion } from '../../../../hooks/useStudioImmersion';
import {
  ExecutiveCollapsibleSection,
  ExecutiveDepartmentCard,
  ExecutiveDepartmentCards,
  ExecutiveFocusList,
  ExecutiveFocusPanel,
  ExecutivePageShell,
  ExecutivePipelineViz,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
  ExecutiveTrendSparkline,
  ExecutiveVisualSummary,
  ExecutiveWorkspaceZone,
  eiaActionBtn,
  eiaCaption,
  eiaSectionTitle,
  healthToDepartmentStatus,
  useExecutiveDepartment,
  type PipelineStage,
} from '../executive-ia';
import {
  HqExperienceStyles,
  HqWingZone,
  LegacyTimelineStory,
  LegacyWallFeature,
  LivingHeadquartersShell,
  PriorityMissionHero,
  hqGrace,
  resolveHeadquartersEnvironment,
  resolveHeadquartersMaturity,
} from '../headquarters-experience';
import { useLivingHeadquartersState } from '../../../../hooks/useLivingHeadquartersState';
import { FrontalSlayerExecutiveLobby } from './FrontalSlayerExecutiveLobby';
import { MissionControlExecutiveHealthPanel } from './MissionControlExecutiveHealthPanel';
import { MissionControlOrganizationPulsePanel } from './MissionControlOrganizationPulsePanel';
import { MissionControlKnowledgeConfidencePanel } from './MissionControlKnowledgeConfidencePanel';
import { MissionControlAmbientBriefingPanel } from './MissionControlAmbientBriefingPanel';
import { MissionControlAnticipationPanel } from './MissionControlAnticipationPanel';
import { MissionControlFounderCognitiveLoadPanel } from './MissionControlFounderCognitiveLoadPanel';
import { MissionControlPresencePanel } from './MissionControlPresencePanel';
import { MissionControlCrossOrgIntelligencePanel } from './MissionControlCrossOrgIntelligencePanel';
import { MissionControlRelationshipMemoryPanel } from './MissionControlRelationshipMemoryPanel';
import { MissionControlPredictiveOrganizationPanel } from './MissionControlPredictiveOrganizationPanel';
import { MissionControlAutonomousPreparationPanel } from './MissionControlAutonomousPreparationPanel';
import { MissionControlOrganizationalConsciousnessPanel } from './MissionControlOrganizationalConsciousnessPanel';
import { MissionControlExecutiveTimelinePanel } from './MissionControlExecutiveTimelinePanel';
import { MissionControlWorldKnowledgeEnginePanel } from './MissionControlWorldKnowledgeEnginePanel';
import { MissionControlFounderOperatingSystemPanel } from './MissionControlFounderOperatingSystemPanel';
import { MissionControlInnovationLabPanel } from './MissionControlInnovationLabPanel';
import { MissionControlOrganizationOperatingManualPanel } from './MissionControlOrganizationOperatingManualPanel';
import { MissionControlLegacyNetworkPanel } from './MissionControlLegacyNetworkPanel';
import { MissionControlStudioIntelligenceArchitecturePanel } from './MissionControlStudioIntelligenceArchitecturePanel';
import { MissionControlModelOrchestratorPanel } from './MissionControlModelOrchestratorPanel';
import { MissionControlStudioFoundationModelsPanel } from './MissionControlStudioFoundationModelsPanel';
import { MissionControlDocumentationRegistryPanel } from './MissionControlDocumentationRegistryPanel';
import { MissionControlDocumentationGovernancePanel } from './MissionControlDocumentationGovernancePanel';
import { MissionControlSystemRegistryPanel } from './MissionControlSystemRegistryPanel';
import { MissionControlComponentRegistryPanel } from './MissionControlComponentRegistryPanel';
import { MissionControlDesignTokenEnginePanel } from './MissionControlDesignTokenEnginePanel';
import {
  MC_VISUAL,
  MISSION_CONTROL_STYLES,
  mcActionBtn,
  mcBreathingPanel,
  mcCaption,
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

function departmentStatus(dept: (typeof DEPARTMENT_GRID)[number]) {
  return healthToDepartmentStatus(dept.health, dept.blocked > 0, dept.pendingApprovals > 0);
}

type MissionDepartmentId = 'overview' | (typeof DEPARTMENT_GRID)[number]['id'];

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
  } = useAdminStudioMissionControl();
  const { unreadGuides, markGuideRead } = useAdminStudioKnowledgeHub();

  const { presenceFeed } = useStudioImmersion();
  const { profile: healthProfile } = useCompanyHealthIndexState();
  const { activeDepartment, selectDepartment } = useExecutiveDepartment<MissionDepartmentId>('overview');
  const header = MISSION_CONTROL_HEADER;
  const env = resolveHeadquartersEnvironment(workspace.id);
  const maturity = resolveHeadquartersMaturity(0, healthProfile?.executiveHealthScore ?? header.workspaceHealth);
  const living = useLivingHeadquartersState({
    organizationId: workspace.id,
    healthScore: healthProfile?.executiveHealthScore ?? header.workspaceHealth,
  });
  const currentPhaseIdx = MISSION_PHASES.findIndex((p) => p.id === MISSION_CURRENT_PHASE);
  const activeDeptMeta = DEPARTMENT_GRID.find((d) => d.id === activeDepartment);

  const pipelineStages: PipelineStage[] = MISSION_PHASES.map((phase, idx) => ({
    id: phase.id,
    label: phase.label,
    state: idx < currentPhaseIdx ? 'complete' : idx === currentPhaseIdx ? 'active' : 'pending',
  }));

  return (
    <div className="mission-control-root">
      <style>{MISSION_CONTROL_STYLES}</style>
      <HqExperienceStyles />

      <LivingHeadquartersShell living={living}>
      <ExecutivePageShell>
        <FrontalSlayerExecutiveLobby />

        <HqWingZone wing="COMPANY PULSE™" title="Organization health" accentHex={env.accentHex}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MissionControlExecutiveHealthPanel />
            <MissionControlOrganizationPulsePanel />
            <MissionControlKnowledgeConfidencePanel />
            <MissionControlAmbientBriefingPanel />
          </div>
        </HqWingZone>

        <HqWingZone wing="PRIORITY OF THE DAY" title="Today's mission" accentHex={env.accentHex}>
          <PriorityMissionHero
            title={MISSION_OVERVIEW.title}
            headline={MISSION_OVERVIEW.title}
            subtitle={`${header.currentCampaign} · READINESS ${MISSION_OVERVIEW.readinessScore}%`}
            countdown={`${MISSION_OVERVIEW.daysRemaining} DAYS REMAINING`}
            confidencePct={MISSION_OVERVIEW.readinessScore}
            predictedImpact={`${MISSION_OVERVIEW.progressPct}% COMPLETE · NEXT · ${MISSION_OVERVIEW.upcomingMilestone}`}
            recommendedAction={MISSION_EXECUTIVE_BRIEF.todayFocus}
            accentHex={env.accentHex}
          />
        </HqWingZone>

        <HqWingZone wing="OPERATIONS WING™" title="Walk the departments" subtitle="Enter another part of headquarters" accentHex={env.accentHex}>
        <ExecutiveDepartmentCards label="DEPARTMENT WINGS">
          <ExecutiveDepartmentCard
            id="overview"
            icon="📊"
            name="OVERVIEW"
            description="TODAY'S MISSION · EXECUTIVE BRIEFING"
            statusLabel={`WORKSPACE HEALTH ${header.workspaceHealth}%`}
            healthPct={header.workspaceHealth}
            status="active"
            selected={activeDepartment === 'overview'}
            onSelect={() => selectDepartment('overview')}
          />
          {DEPARTMENT_GRID.slice(0, 6).map((dept) => (
            <ExecutiveDepartmentCard
              key={dept.id}
              id={dept.id}
              icon={DEPARTMENT_ICONS[dept.id] ?? '📁'}
              name={dept.title}
              description={dept.currentTask}
              statusLabel={`BLOCKED ${dept.blocked} · APPROVALS ${dept.pendingApprovals}`}
              healthPct={dept.health}
              status={departmentStatus(dept)}
              selected={activeDepartment === dept.id}
              onSelect={() => selectDepartment(dept.id as MissionDepartmentId)}
              onEnter={() => navigate(dept.route)}
              enterLabel="ENTER WING →"
            />
          ))}
        </ExecutiveDepartmentCards>

        <ExecutiveWorkspaceZone departmentId={activeDepartment}>
          {/* VISUAL SUMMARY — graphics before text */}
          <ExecutiveVisualSummary
            title={
              activeDepartment === 'overview'
                ? 'MISSION TIMELINE · STATUS AT A GLANCE'
                : activeDepartment === 'production' || activeDepartment === 'automation'
                  ? 'PRODUCTION PIPELINE · LIVE STATUS'
                  : `${activeDeptMeta?.title ?? 'DEPARTMENT'} · PULSE`
            }
          >
            {activeDepartment === 'production' || activeDepartment === 'automation' ? (
              <ExecutivePipelineViz stages={pipelineStages} />
            ) : activeDepartment === 'analytics' || activeDepartment === 'audience' ? (
              <ExecutiveTrendSparkline
                values={[62, 68, 71, 74, 78, 82, 88]}
                label="30-DAY ENGAGEMENT TREND · ESTIMATE"
              />
            ) : (
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
            )}
          </ExecutiveVisualSummary>

          {/* PRIMARY FOCUS — one working area per department wing */}
          {activeDepartment === 'overview' ? (
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
          ) : activeDepartment === 'production' || activeDepartment === 'automation' ? (
            <ExecutiveFocusPanel
              title="CURRENT PRODUCTION BATCH"
              subtitle={`${MISSION_CONTROL_FACTORY_STATS.jobsRunning} JOBS RUNNING · ${MISSION_CONTROL_FACTORY_STATS.jobsWaiting} WAITING`}
              highlight={ACTIVE_MISSIONS[0]?.nextAction}
            >
              <div className="space-y-2">
                {ACTIVE_MISSIONS.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => navigate(m.route)}
                    className="w-full text-left py-2"
                    style={{ border: 'none', background: 'rgba(0,0,0,0.03)', cursor: 'pointer', padding: '8px 10px' }}
                  >
                    <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
                      {m.title}
                    </p>
                    <p style={{ ...eiaCaption, fontSize: '7px' }}>
                      {m.progressPct}% · {m.deadline} · {m.nextAction}
                    </p>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => navigate('/admin/studio/asset-factory')} style={{ ...eiaActionBtn, marginTop: 12 }}>
                ENTER ASSET FACTORY →
              </button>
            </ExecutiveFocusPanel>
          ) : activeDeptMeta ? (
            <ExecutiveFocusPanel
              title={`${activeDeptMeta.title} WING`}
              subtitle={activeDeptMeta.currentTask}
              highlight={`${activeDeptMeta.health}% HEALTH · ${activeDeptMeta.recentActivity}`}
            >
              <p style={{ ...eiaCaption, color: MC_VISUAL.black }}>
                READY {activeDeptMeta.ready} · BLOCKED {activeDeptMeta.blocked} · APPROVALS {activeDeptMeta.pendingApprovals}
              </p>
              <p style={{ ...eiaSectionTitle, marginTop: 12 }}>RECENT ACTIVITY</p>
              <p style={{ ...eiaCaption, color: MC_VISUAL.black }}>{activeDeptMeta.recentActivity}</p>
              <button type="button" onClick={() => navigate(activeDeptMeta.route)} style={{ ...eiaActionBtn, marginTop: 12 }}>
                ENTER {activeDeptMeta.title} →
              </button>
            </ExecutiveFocusPanel>
          ) : null}
        </ExecutiveWorkspaceZone>

        <div style={{ ...mcBreathingPanel, padding: '12px 14px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="MISSION SEARCH — PACKS · CAMPAIGNS · ASSETS · TALENT…"
            className="w-full bg-white/90 border text-black text-[8px] font-futura uppercase px-3 py-2 outline-none"
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
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={() => returnToCampus()} style={mcActionBtn}>
              SWITCH WORKSPACE
            </button>
            <button type="button" onClick={() => navigate(adminStudioChiefOfStaffPath())} style={mcActionBtn}>
              CHIEF OF STAFF
            </button>
            <span style={{ ...mcCaption, alignSelf: 'center' }}>{pendingApprovalCount} APPROVALS</span>
          </div>
        </div>

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
        </HqWingZone>

        <HqWingZone wing="INTELLIGENCE WING™" title="Executive systems" accentHex={env.accentHex}>
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
            <MissionControlAnticipationPanel />
            <MissionControlFounderCognitiveLoadPanel />
            <MissionControlPresencePanel />
            <MissionControlCrossOrgIntelligencePanel />
            <MissionControlRelationshipMemoryPanel />
            <MissionControlPredictiveOrganizationPanel />
            <MissionControlAutonomousPreparationPanel />
            <MissionControlOrganizationalConsciousnessPanel />
            <MissionControlWorldKnowledgeEnginePanel />
            <MissionControlFounderOperatingSystemPanel />
            <MissionControlInnovationLabPanel />
          </div>
        </HqWingZone>

        <HqWingZone wing="KNOWLEDGE WING™" title="Documentation & guides" accentHex={env.accentHex}>
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
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: MC_VISUAL.red }}>{s.value}</p>
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

        <MissionControlOrganizationOperatingManualPanel />

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
        </HqWingZone>

        {maturity.showInnovation ? (
        <HqWingZone wing="INNOVATION WING™" title="Blueprint & factory" accentHex={env.accentHex}>
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
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: MC_VISUAL.red }}>{s.value}</p>
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
        </HqWingZone>
        ) : null}

        {maturity.showLegacy ? (
        <HqWingZone wing="LEGACY WING™" title="Permanent organizational history" accentHex={env.accentHex}>
          <LegacyWallFeature
            entries={living.legacyWall}
            accentHex={env.accentHex}
            atmosphereLabel={living.atmosphereLabel}
          />
          <MissionControlExecutiveTimelinePanel />
          <MissionControlLegacyNetworkPanel />
          <MissionControlStudioIntelligenceArchitecturePanel />
          <MissionControlModelOrchestratorPanel />
          <MissionControlStudioFoundationModelsPanel />
          <MissionControlDocumentationRegistryPanel />
          <MissionControlDocumentationGovernancePanel />
          <MissionControlSystemRegistryPanel />
          <MissionControlComponentRegistryPanel />
          <MissionControlDesignTokenEnginePanel />
          <LegacyTimelineStory
            accentHex={env.accentHex}
            milestones={[
              {
                id: 'today',
                label: 'This day in history',
                description: WORKSPACE_MEMORY.thisDayInHistory,
                recordedAt: new Date().toISOString(),
              },
              {
                id: 'year-ago',
                label: 'One year ago',
                description: WORKSPACE_MEMORY.oneYearAgo,
                recordedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
              },
              ...WORKSPACE_MEMORY.recentMilestones.map((label, idx) => ({
                id: `milestone-${idx}`,
                label,
                description: WORKSPACE_MEMORY.biggestWins[idx] ?? 'Organization milestone recorded',
                recordedAt: new Date(Date.now() - (idx + 2) * 30 * 24 * 60 * 60 * 1000).toISOString(),
              })),
            ]}
          />
          <p style={{ ...hqGrace, fontSize: '12px', marginTop: 12 }}>{WORKSPACE_MEMORY.founderNotes}</p>
          <button type="button" onClick={() => navigate('/admin/studio/legacy-system')} style={{ ...eiaActionBtn, marginTop: 8 }}>
            OPEN LEGACY
          </button>

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
        </HqWingZone>
        ) : null}
      </ExecutivePageShell>
      </LivingHeadquartersShell>
    </div>
  );
}
