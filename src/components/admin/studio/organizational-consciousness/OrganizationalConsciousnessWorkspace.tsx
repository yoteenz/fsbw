import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationalConsciousnessState } from '../../../../hooks/useOrganizationalConsciousnessState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  CONNECTED_SYSTEM_LABELS,
  CONSCIOUSNESS_PHILOSOPHY,
  EXECUTIVE_IDENTITY_PILLARS,
  LEARNING_CONTRIBUTION_LABELS,
  REASONING_FACTOR_LABELS,
} from '../../../../studio-os-core/organizational-consciousness';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type ConsciousnessTab = 'overview' | 'systems' | 'reasoning' | 'learning';

const TABS: { id: ConsciousnessTab; label: string }[] = [
  { id: 'overview', label: 'CONSCIOUSNESS OVERVIEW' },
  { id: 'systems', label: 'CONNECTED SYSTEMS' },
  { id: 'reasoning', label: 'ORGANIZATIONAL REASONING' },
  { id: 'learning', label: 'CONTINUOUS LEARNING' },
];

const ACCENT = '#6366F1';

export function OrganizationalConsciousnessWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ConsciousnessTab>('overview');
  const { profile, refresh } = useOrganizationalConsciousnessState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ORGANIZATIONAL CONSCIOUSNESS™ LOADING — UNIFYING INTELLIGENCE
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 115 · ORGANIZATIONAL CONSCIOUSNESS™"
        title={profile.companyName.toUpperCase()}
        subtitle="One intelligence. One memory. The executive consciousness of the organization."
        progressPct={profile.consciousnessScore}
        stats={[
          { label: 'CONSCIOUSNESS', value: `${profile.consciousnessScore}%` },
          { label: 'SYSTEMS', value: `${profile.systemsConnected}/${profile.systemsTotal}` },
          { label: 'REASONING', value: String(profile.reasoningFactorsActive) },
          { label: 'LEARNING', value: String(profile.learningSignalsCount) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.consciousnessScore} size={56} label="UNIFIED" accent={ACCENT} />
        <div>
          {CONSCIOUSNESS_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="EXECUTIVE IDENTITY">
        <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.executiveIdentityLine}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {EXECUTIVE_IDENTITY_PILLARS.join(' · ').toUpperCase()}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="PRESERVE EXPERTISE. BUILD LEGACY.">
        <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
          {profile.dockConsciousnessLine}
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
        REFRESH CONSCIOUSNESS
      </button>
    </ExecutivePageShell>
  );

  const renderSystems = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONNECTED SYSTEMS · CONTINUOUS CONTEXT SHARING">
        {profile.connectedSystems.map((sys) => (
          <ExecutiveSecondaryCard key={sys.systemId} title={CONNECTED_SYSTEM_LABELS[sys.systemId].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: sys.connected ? ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
              {sys.connected ? 'CONNECTED' : 'STANDBY'} · VITALITY {sys.vitalityPct}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {sys.contextShared}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderReasoning = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ORGANIZATIONAL REASONING · HOLISTIC RECOMMENDATIONS">
        {profile.reasoningContext.map((factor) => (
          <ExecutiveSecondaryCard key={factor.factor} title={REASONING_FACTOR_LABELS[factor.factor].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              WEIGHT {factor.weightPct}% · CONSIDERED
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {factor.insight}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        {profile.holisticRecommendations.slice(0, 3).map((rec) => (
          <ExecutiveSecondaryCard key={rec.id} title="HOLISTIC RECOMMENDATION">
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT, fontWeight: 515 }}>
              {rec.recommendation}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {rec.reasoning} ({rec.confidencePct}% confidence)
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderLearning = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONTINUOUS LEARNING · EVERY INTERACTION STRENGTHENS CONSCIOUSNESS">
        {profile.continuousLearning.map((signal) => (
          <ExecutiveSecondaryCard key={signal.id} title={LEARNING_CONTRIBUTION_LABELS[signal.type].toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {signal.contribution}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="organizational-consciousness" className="mb-2" />
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
      {tab === 'systems' && renderSystems()}
      {tab === 'reasoning' && renderReasoning()}
      {tab === 'learning' && renderLearning()}
    </div>
  );
}
