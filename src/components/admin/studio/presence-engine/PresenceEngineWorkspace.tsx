import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresenceEngineState } from '../../../../hooks/usePresenceEngineState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  ATMOSPHERE_STATE_LABELS,
  COMMUNICATION_CONTEXT_LABELS,
  PRESENCE_ENGINE_PHILOSOPHY,
} from '../../../../studio-os-core/presence-engine';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type PresenceTab = 'overview' | 'moments' | 'communication' | 'atmosphere';

const TABS: { id: PresenceTab; label: string }[] = [
  { id: 'overview', label: 'PRESENCE OVERVIEW' },
  { id: 'moments', label: 'EXECUTIVE PRESENCE' },
  { id: 'communication', label: 'COMMUNICATION STYLE' },
  { id: 'atmosphere', label: 'ORGANIZATIONAL ATMOSPHERE' },
];

const ACCENT = '#7C3AED';

function toneColor(tone: 'warm' | 'professional' | 'supportive' | 'celebratory'): string {
  if (tone === 'celebratory') return ACCENT;
  if (tone === 'supportive') return '#0D9488';
  return ADMIN_STUDIO_THEME.textSecondary;
}

export function PresenceEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PresenceTab>('overview');
  const { profile, refresh } = usePresenceEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PRESENCE ENGINE™ LOADING — ESTABLISHING EXECUTIVE PRESENCE
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 110 · PRESENCE ENGINE™"
        title={profile.companyName.toUpperCase()}
        subtitle="Living executive presence — calm, confident, continuous. Never noisy."
        progressPct={profile.presenceScore}
        stats={[
          { label: 'PRESENCE', value: `${profile.presenceScore}%` },
          { label: 'REASSURANCE', value: `${profile.reassuranceLevel}%` },
          { label: 'ATMOSPHERE', value: ATMOSPHERE_STATE_LABELS[profile.activeAtmosphere].toUpperCase() },
          { label: 'MOMENTS', value: String(profile.presenceMoments.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.reassuranceLevel} size={56} label="CALM" accent={ACCENT} />
        <div>
          {PRESENCE_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="EXECUTIVE PRESENCE LINE">
        <p className="text-[6px] font-futura" style={{ color: ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockPresenceLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="HEADQUARTERS ATMOSPHERE">
        <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
          {ATMOSPHERE_STATE_LABELS[profile.organizationalAtmosphere.state].toUpperCase()}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.organizationalAtmosphere.headquartersCue}
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
        REFRESH PRESENCE
      </button>
    </ExecutivePageShell>
  );

  const renderMoments = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXECUTIVE PRESENCE · PROFESSIONAL · AUTHENTIC · NEVER THEATRICAL">
        {profile.presenceMoments.map((moment) => (
          <ExecutiveSecondaryCard key={moment.id} title={moment.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: toneColor(moment.tone) }}>
              {moment.tone.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {moment.message}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCommunication = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`COMMUNICATION · ${COMMUNICATION_CONTEXT_LABELS[profile.activeCommunicationContext].toUpperCase()} ACTIVE`}>
        {profile.communicationStyles.map((style) => (
          <ExecutiveSecondaryCard key={style.context} title={style.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: style.active ? ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
              {style.active ? 'ACTIVE NOW' : 'AVAILABLE'}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {style.styleDescription}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
              {style.examplePhrase}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAtmosphere = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ORGANIZATIONAL ATMOSPHERE · HEADQUARTERS REFLECTS MOMENTUM">
        <ExecutiveSecondaryCard title={profile.organizationalAtmosphere.label.toUpperCase()}>
          <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
            INTENSITY {profile.organizationalAtmosphere.intensityPct}%
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {profile.organizationalAtmosphere.description}
          </p>
          <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
            HQ: {profile.organizationalAtmosphere.headquartersCue}
          </p>
        </ExecutiveSecondaryCard>
        {ATMOSPHERE_STATE_LABELS &&
          (['calm', 'celebratory', 'energized', 'focused'] as const).map((state) => (
            <ExecutiveSecondaryCard
              key={state}
              title={ATMOSPHERE_STATE_LABELS[state].toUpperCase()}
            >
              <p className="text-[6px] font-futura" style={{ color: profile.activeAtmosphere === state ? ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
                {profile.activeAtmosphere === state ? 'CURRENT STATE' : 'MONITORING'}
              </p>
            </ExecutiveSecondaryCard>
          ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="presence-engine" className="mb-2" />
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
      {tab === 'moments' && renderMoments()}
      {tab === 'communication' && renderCommunication()}
      {tab === 'atmosphere' && renderAtmosphere()}
    </div>
  );
}
