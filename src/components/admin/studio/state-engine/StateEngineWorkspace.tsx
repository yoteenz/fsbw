import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateEngineState } from '../../../../hooks/useStateEngineState';
import {
  STATE_ENGINE_ACCENT,
  STATE_ENGINE_PHILOSOPHY,
  queryStateEngine,
} from '../../../../studio-os-core/state-engine';
import { adminStudioMissionControlPath, adminStudioAssetRegistryPath, adminStudioWorkflowEnginePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type StateTab = 'overview' | 'states' | 'transitions' | 'objects' | 'history' | 'governance' | 'discovery';

const TABS: { id: StateTab; label: string }[] = [
  { id: 'overview', label: 'LIFECYCLE OVERVIEW' },
  { id: 'states', label: 'SUPPORTED STATES' },
  { id: 'transitions', label: 'TRANSITIONS' },
  { id: 'objects', label: 'MANAGED OBJECTS' },
  { id: 'history', label: 'STATE HISTORY' },
  { id: 'governance', label: 'GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function StateEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<StateTab>('overview');
  const [searchQuery, setSearchQuery] = useState('approval');
  const { profile, refresh } = useStateEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        STATE ENGINE™ LOADING — LIFECYCLE MANAGEMENT
      </p>
    );
  }

  const searchHits = queryStateEngine(searchQuery, profile.organizationId, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 139 · STATE ENGINE™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Every object has a clearly defined state — every transition intentional, traceable, and predictable."
        progressPct={profile.consistencyScore}
        stats={[
          { label: 'CONSISTENCY', value: `${profile.consistencyScore}%` },
          { label: 'COVERAGE', value: `${profile.lifecycleCoveragePct}%` },
          { label: 'HISTORY', value: `${profile.historyCompletenessPct}%` },
          { label: 'AWAITING', value: String(profile.objectsAwaitingApproval) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.consistencyScore} size={56} label="SE" accent={STATE_ENGINE_ACCENT} />
        <div>
          {STATE_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PREDICTABLE LIFECYCLE · CONSISTENCY · TRUST">
        <p className="text-[6px] font-futura" style={{ color: STATE_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockConsistencyLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioAssetRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: STATE_ENGINE_ACCENT, color: STATE_ENGINE_ACCENT }}>
        ASSET REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioWorkflowEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        WORKFLOW ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC STATE ENGINE
      </button>
    </ExecutivePageShell>
  );

  const renderStates = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SUPPORTED LIFECYCLE STATES — NOTHING UNDEFINED">
        {profile.lifecycleStates.map((s) => (
          <ExecutiveSecondaryCard key={s.state} title={`${s.label.toUpperCase()} · ${s.state.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STATE_ENGINE_ACCENT, fontWeight: 515 }}>
              {s.terminal ? 'Terminal state' : 'Active lifecycle'} · extensible
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {s.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTransitions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STATE TRANSITIONS — POLICY ENFORCED · NEVER BYPASS">
        <ExecutiveSecondaryCard title="CANONICAL PATH">
          <p className="text-[6px] font-futura" style={{ color: STATE_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
            Draft → Review → Approved → Published → Archived
          </p>
        </ExecutiveSecondaryCard>
        {profile.transitionRules.map((t) => (
          <ExecutiveSecondaryCard key={t.transitionId} title={t.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STATE_ENGINE_ACCENT, fontWeight: 515 }}>
              {t.from} → {t.to} · approval: {t.requiresApproval ? 'required' : 'none'} · permission: {t.requiresPermission ? 'required' : 'none'}
            </p>
            {t.automationTrigger && (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                automation: {t.automationTrigger} · {t.notification ?? 'no notification'}
              </p>
            )}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderObjects = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MANAGED OBJECTS — EVERY STUDIO OS ENTITY">
        {profile.stateObjects.map((o) => (
          <ExecutiveSecondaryCard key={o.objectType} title={`${o.label.toUpperCase()} · ${o.currentCount} MANAGED`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {o.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHistory = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STATE HISTORY — NOTHING LOSES ITS PAST">
        {profile.historyRecords.map((h) => (
          <ExecutiveSecondaryCard key={h.recordId} title={h.objectName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STATE_ENGINE_ACCENT, fontWeight: 515 }}>
              {h.previousState} → {h.currentState} · {h.user} · {new Date(h.date).toLocaleString()}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              Reason: {h.reason}
            </p>
            {h.approvalChain && (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Approval: {h.approvalChain} · {h.comments ?? ''}
              </p>
            )}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STATE GOVERNANCE · INTENTIONAL TRANSITIONS ONLY">
        {profile.governanceFindings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: STATE_ENGINE_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="RECOMMENDATIONS">
          {profile.recommendations.slice(0, 4).map((r) => (
            <p key={r.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: STATE_ENGINE_ACCENT, fontWeight: 515 }}>{r.priority.toUpperCase()}:</span> {r.title}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STATE DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try approval, paused, archived, draft, workflow failed…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={`${hit.type}-${hit.id}`} title={hit.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STATE_ENGINE_ACCENT, fontWeight: 515 }}>
              {hit.type} · {hit.matchReason}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'states':
        return renderStates();
      case 'transitions':
        return renderTransitions();
      case 'objects':
        return renderObjects();
      case 'history':
        return renderHistory();
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
      <StudioOsBrandTagline systemId="state-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? STATE_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? STATE_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
