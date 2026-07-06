import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderCognitiveLoadState } from '../../../../hooks/useFounderCognitiveLoadState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  ATTENTION_MODE_LABELS,
  COGNITIVE_FACTOR_LABELS,
  COGNITIVE_LOAD_PHILOSOPHY,
  FILTERING_ACTION_LABELS,
  LOAD_STATE_LABELS,
} from '../../../../studio-os-core/founder-cognitive-load';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type CognitiveTab = 'overview' | 'factors' | 'filtering' | 'attention';

const TABS: { id: CognitiveTab; label: string }[] = [
  { id: 'overview', label: 'LOAD OVERVIEW' },
  { id: 'factors', label: 'COGNITIVE ANALYSIS' },
  { id: 'filtering', label: 'INTELLIGENT FILTERING' },
  { id: 'attention', label: 'ATTENTION MANAGEMENT' },
];

const ACCENT = '#0D9488';

function demandColor(status: 'low' | 'moderate' | 'high' | 'critical'): string {
  if (status === 'critical') return '#DC2626';
  if (status === 'high') return '#EA580C';
  if (status === 'moderate') return ACCENT;
  return ADMIN_STUDIO_THEME.textSecondary;
}

export function FounderCognitiveLoadWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<CognitiveTab>('overview');
  const { profile, refresh } = useFounderCognitiveLoadState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        FOUNDER COGNITIVE LOAD™ LOADING — ANALYZING MENTAL WORKLOAD
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 109 · FOUNDER COGNITIVE LOAD™"
        title={profile.companyName.toUpperCase()}
        subtitle="Protect founder attention — better prioritization, not more information."
        progressPct={profile.focusProtectionPct}
        stats={[
          { label: 'DEMAND', value: `${profile.cognitiveDemandPct}%` },
          { label: 'PROTECTION', value: `${profile.focusProtectionPct}%` },
          { label: 'LOAD', value: LOAD_STATE_LABELS[profile.loadState].toUpperCase() },
          { label: 'MODE', value: ATTENTION_MODE_LABELS[profile.activeAttentionMode].toUpperCase() },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.focusProtectionPct} size={56} label="FOCUS" accent={ACCENT} />
        <div>
          {COGNITIVE_LOAD_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="EXECUTIVE ASSISTANCE">
        <p className="text-[6px] font-futura mb-2" style={{ color: ACCENT, fontWeight: 515 }}>
          {profile.dockHeadline}
        </p>
        {profile.executiveAssistance.slice(0, 3).map((action) => (
          <p key={action.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {action.message}
          </p>
        ))}
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
        REFRESH COGNITIVE LOAD
      </button>
    </ExecutivePageShell>
  );

  const renderFactors = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${profile.factorSnapshots.length} COGNITIVE FACTORS · DEMAND ESTIMATED ${profile.cognitiveDemandPct}%`}>
        {profile.factorSnapshots.map((factor) => (
          <ExecutiveSecondaryCard key={factor.factor} title={COGNITIVE_FACTOR_LABELS[factor.factor].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: demandColor(factor.status) }}>
              {factor.status.toUpperCase()} · {factor.demandPct}% DEMAND
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {factor.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFiltering = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="INTELLIGENT FILTERING · ACTIVE WHEN LOAD IS HIGH">
        {profile.activeFilters.map((filter) => (
          <ExecutiveSecondaryCard key={filter.action} title={FILTERING_ACTION_LABELS[filter.action].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: filter.active ? ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
              {filter.active ? 'ACTIVE' : 'STANDBY'}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {filter.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAttention = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ATTENTION MANAGEMENT · COMMUNICATION ADJUSTS TO FOUNDER MODE">
        {profile.attentionModes.map((mode) => (
          <ExecutiveSecondaryCard key={mode.mode} title={ATTENTION_MODE_LABELS[mode.mode].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: mode.detected ? ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
              {mode.detected ? 'DETECTED NOW' : 'MONITORING'}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {mode.communicationStyle}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="founder-cognitive-load" className="mb-2" />
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
      {tab === 'factors' && renderFactors()}
      {tab === 'filtering' && renderFiltering()}
      {tab === 'attention' && renderAttention()}
    </div>
  );
}
