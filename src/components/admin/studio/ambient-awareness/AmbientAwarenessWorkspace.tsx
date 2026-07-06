import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAmbientAwarenessState } from '../../../../hooks/useAmbientAwarenessState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import { AMBIENT_AWARENESS_PHILOSOPHY, AWARENESS_LAYER_LABELS } from '../../../../studio-os-core/ambient-awareness';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type AwarenessTab = 'overview' | 'briefing' | 'layers' | 'departments';

const TABS: { id: AwarenessTab; label: string }[] = [
  { id: 'overview', label: 'AWARENESS OVERVIEW' },
  { id: 'briefing', label: 'DAILY BRIEFING' },
  { id: 'layers', label: 'AWARENESS LAYERS' },
  { id: 'departments', label: 'DEPARTMENT CONTEXT' },
];

const ACCENT = '#475569';

function layerStatusColor(status: 'active' | 'stable' | 'attention'): string {
  if (status === 'attention') return '#DC2626';
  if (status === 'active') return ACCENT;
  return ADMIN_STUDIO_THEME.textSecondary;
}

function momentumColor(momentum: 'rising' | 'steady' | 'strained'): string {
  if (momentum === 'rising') return '#16A34A';
  if (momentum === 'strained') return '#DC2626';
  return ACCENT;
}

export function AmbientAwarenessWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AwarenessTab>('overview');
  const { profile, refresh } = useAmbientAwarenessState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AMBIENT AWARENESS™ LOADING — SYNCHRONIZING ORGANIZATIONAL CONTEXT
      </p>
    );
  }

  const ctx = profile.intelligentContext;

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 107 · AMBIENT AWARENESS™"
        title={profile.companyName.toUpperCase()}
        subtitle="Continuous context — present, not reactive. Studio OS already knows."
        progressPct={profile.awarenessScore}
        stats={[
          { label: 'AWARENESS', value: `${profile.awarenessScore}%` },
          { label: 'LAYERS', value: String(profile.layerSnapshots.length) },
          { label: 'DEPARTMENTS', value: String(profile.departmentSnapshots.length) },
          { label: 'SOURCES', value: String(profile.syncedSources.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.awarenessScore} size={56} label="CONTEXT" accent={ACCENT} />
        <div>
          {AMBIENT_AWARENESS_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveFocusPanel title="INTELLIGENT CONTEXT · NEVER ASK UNNECESSARY QUESTIONS">
        <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
          ACTIVE: {ctx.activeOrganization}
        </p>
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          FOUNDER FOCUS: {ctx.founderFocus}
        </p>
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          RECENT: {ctx.recentConversationTheme}
        </p>
        {ctx.waitingProjects[0] ? (
          <p className="text-[6px] font-futura" style={{ color: '#DC2626' }}>
            WAITING: {ctx.waitingProjects[0]}
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="TODAY'S TOP PRIORITY">
        <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
          {profile.dailyBriefing.topPriority}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ACCENT, color: ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH AWARENESS
      </button>
    </ExecutivePageShell>
  );

  const renderBriefing = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="PROACTIVE BRIEFING · NO PROMPT REQUIRED"
        title="DAILY EXECUTIVE BRIEFING"
        subtitle="Command Dock delivers this automatically when Headquarters opens."
        progressPct={profile.awarenessScore}
        stats={[
          { label: 'GENERATED', value: new Date(profile.dailyBriefing.generatedAt).toLocaleDateString() },
          { label: 'LINES', value: String(profile.dailyBriefing.briefingLines.length) },
        ]}
      />
      <ExecutiveFocusPanel title={profile.dailyBriefing.greeting.toUpperCase()}>
        {profile.dailyBriefing.briefingLines.map((line) => (
          <p key={line} className="text-[6px] font-futura mb-1.5" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
            · {line}
          </p>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ACCENT, fontWeight: 515 }}>
          {profile.dailyBriefing.topPriority}
        </p>
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="FULL BRIEFING">
        <pre
          className="text-[6px] font-futura whitespace-pre-wrap"
          style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.55, fontFamily: 'inherit' }}
        >
          {profile.dailyBriefing.fullBriefing}
        </pre>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderLayers = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${profile.layerSnapshots.length} AWARENESS LAYERS · CONTINUOUS CONTEXT`}>
        {profile.layerSnapshots.map((layer) => (
          <ExecutiveSecondaryCard key={layer.layer} title={AWARENESS_LAYER_LABELS[layer.layer].toUpperCase()}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[6px] font-futura" style={{ color: layerStatusColor(layer.status) }}>
                {layer.status.toUpperCase()} · {layer.confidencePct}%
              </p>
            </div>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {layer.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDepartments = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DEPARTMENT AWARENESS · NO CONCIERGE OPERATES IN ISOLATION">
        {profile.departmentSnapshots.map((dept) => (
          <ExecutiveSecondaryCard key={dept.departmentId} title={dept.departmentName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: momentumColor(dept.momentum) }}>
              MOMENTUM: {dept.momentum.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {dept.currentFocus}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
              COLLABORATING: {dept.collaboratingWith.join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="ambient-awareness" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'briefing' && renderBriefing()}
      {tab === 'layers' && renderLayers()}
      {tab === 'departments' && renderDepartments()}
    </div>
  );
}
