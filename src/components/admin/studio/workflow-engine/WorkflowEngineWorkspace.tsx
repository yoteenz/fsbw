import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowEngineState } from '../../../../hooks/useWorkflowEngineState';
import {
  WORKFLOW_ENGINE_ACCENT,
  WORKFLOW_ENGINE_PHILOSOPHY,
  queryWorkflowEngine,
} from '../../../../studio-os-core/workflow-engine';
import { adminStudioMissionControlPath, adminStudioPluginSdkPath, adminStudioStateEnginePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type WorkflowTab = 'overview' | 'builder' | 'types' | 'testing' | 'analytics' | 'governance' | 'discovery';

const TABS: { id: WorkflowTab; label: string }[] = [
  { id: 'overview', label: 'CHOREOGRAPHY OVERVIEW' },
  { id: 'builder', label: 'VISUAL BUILDER' },
  { id: 'types', label: 'WORKFLOW TYPES' },
  { id: 'testing', label: 'TESTING' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'governance', label: 'GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function WorkflowEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<WorkflowTab>('overview');
  const [searchQuery, setSearchQuery] = useState('onboarding');
  const { profile, refresh } = useWorkflowEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        WORKFLOW ENGINE™ LOADING — ORGANIZATIONAL CHOREOGRAPHY
      </p>
    );
  }

  const searchHits = queryWorkflowEngine(searchQuery, profile.organizationId, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 138 · WORKFLOW ENGINE™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Visual orchestration for every business process — understandable by humans and Digital Concierges."
        progressPct={profile.choreographyScore}
        stats={[
          { label: 'CHOREOGRAPHY', value: `${profile.choreographyScore}%` },
          { label: 'BUILDER', value: `${profile.builderReadyPct}%` },
          { label: 'TESTING', value: `${profile.testingScorePct}%` },
          { label: 'PUBLISHED', value: String(profile.publishedWorkflowCount) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.choreographyScore} size={56} label="WE" accent={WORKFLOW_ENGINE_ACCENT} />
        <div>
          {WORKFLOW_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="LIVING SYSTEMS · VISUALIZE · IMPROVE · AUTOMATE · EVOLVE">
        <p className="text-[6px] font-futura" style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockChoreographyLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioStateEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: WORKFLOW_ENGINE_ACCENT, color: WORKFLOW_ENGINE_ACCENT }}>
        STATE ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPluginSdkPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PLUGIN SDK →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC WORKFLOWS
      </button>
    </ExecutivePageShell>
  );

  const renderBuilder = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="VISUAL WORKFLOW BUILDER — DRAG-AND-DROP NODES">
        {profile.nodeCatalog.map((n) => (
          <ExecutiveSecondaryCard key={n.nodeType} title={`${n.label.toUpperCase()} · ${n.category.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515 }}>
              draggable · {n.iconHint} · no code required
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {n.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="ACTIVE WORKFLOWS">
        {profile.workflows.map((w) => (
          <ExecutiveSecondaryCard key={w.workflowId} title={`${w.name.toUpperCase()} · ${w.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515 }}>
              {w.nodeCount} nodes · {w.completionRatePct}% completion
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTypes = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WORKFLOW TYPES — REPEATABLE ORGANIZATIONAL PROCESSES">
        {profile.processTemplates.map((p) => (
          <ExecutiveSecondaryCard key={p.processId} title={`${p.name.toUpperCase()} · ${p.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515 }}>
              {p.nodeCount} nodes · repeatable process template
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {p.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTesting = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WORKFLOW TESTING — NOTHING GOES LIVE WITHOUT TESTING">
        {profile.testingCapabilities.map((t) => (
          <ExecutiveSecondaryCard key={t.mode} title={t.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515 }}>
              {t.requiredBeforePublish ? 'Required before publish' : 'Optional'} · {t.mode}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {t.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAnalytics = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WORKFLOW ANALYTICS · CONTINUOUS IMPROVEMENT">
        {profile.analyticsMetrics.map((m) => (
          <ExecutiveSecondaryCard key={m.metricId} title={m.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515 }}>
              {m.value} · {m.scorePct}% · trend {m.trend}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {m.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="OPTIMIZATION SUGGESTIONS">
          {profile.optimizationSuggestions.slice(0, 4).map((s) => (
            <p key={s.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515 }}>{s.priority.toUpperCase()}:</span> {s.title} — {s.estimatedImpact}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WORKFLOW GOVERNANCE · POLICY & PERMISSION ENFORCED">
        {profile.governanceFindings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WORKFLOW DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try onboarding, approval, bottleneck, simulate, permit…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={`${hit.type}-${hit.id}`} title={hit.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKFLOW_ENGINE_ACCENT, fontWeight: 515 }}>
              {hit.type} · {hit.matchReason}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'builder':
        return renderBuilder();
      case 'types':
        return renderTypes();
      case 'testing':
        return renderTesting();
      case 'analytics':
        return renderAnalytics();
      case 'governance':
        return renderGovernance();
      case 'discovery':
        return renderDiscovery();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="workflow-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? WORKFLOW_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? WORKFLOW_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
