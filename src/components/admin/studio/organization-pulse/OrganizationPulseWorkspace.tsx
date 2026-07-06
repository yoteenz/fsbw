import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationPulseState } from '../../../../hooks/useOrganizationPulseState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  ORGANIZATION_PULSE_PHILOSOPHY,
  PULSE_INDICATORS,
} from '../../../../studio-os-core/organization-pulse';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type PulseTab = 'overview' | 'indicators' | 'alerts' | 'actions';

const TABS: { id: PulseTab; label: string }[] = [
  { id: 'overview', label: 'PULSE OVERVIEW' },
  { id: 'indicators', label: 'ALL INDICATORS' },
  { id: 'alerts', label: 'PROACTIVE ALERTS' },
  { id: 'actions', label: 'RECOMMENDED ACTIONS' },
];

function stateColor(state: string): string {
  if (state === 'thriving' || state === 'healthy' || state === 'growing') return '#16A34A';
  if (state === 'stable') return '#0891B2';
  if (state === 'needs-attention') return '#CA8A04';
  return ADMIN_STUDIO_THEME.accent;
}

function severityColor(severity: string): string {
  if (severity === 'info') return '#0891B2';
  if (severity === 'watch') return '#CA8A04';
  return ADMIN_STUDIO_THEME.accent;
}

export function OrganizationPulseWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PulseTab>('overview');
  const { profile, refresh } = useOrganizationPulseState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ORGANIZATION PULSE™ LOADING — MONITORING ORGANIZATIONAL WELL-BEING
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 100 · ORGANIZATION PULSE"
        title={profile.companyName.toUpperCase()}
        subtitle="How is our organization really doing? Organizationally — not financially."
        progressPct={profile.overallPulseScore}
        stats={[
          { label: 'PULSE', value: `${profile.overallPulseScore}%` },
          { label: 'STATE', value: profile.pulseState.replace(/-/g, ' ').toUpperCase() },
          { label: 'INDICATORS', value: String(PULSE_INDICATORS.length) },
          { label: 'ALERTS', value: String(profile.proactiveAlerts.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallPulseScore} size={56} label="PULSE" accent="#0891B2" />
        <div>
          {ORGANIZATION_PULSE_PHILOSOPHY.slice(0, 3).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="HOW THE ORGANIZATION FEELS">
        <p className="text-[6px] font-futura" style={{ color: stateColor(profile.pulseState) }}>
          {profile.pulseFeeling}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: '#0891B2', color: '#0891B2' }}
      >
        VIEW IN MISSION CONTROL
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH PULSE
      </button>
    </ExecutivePageShell>
  );

  const renderIndicators = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${profile.indicatorScores.length} PULSE INDICATORS · REAL-TIME SIGNALS`}>
        {profile.indicatorScores.map((i) => (
          <div key={i.id} className="flex items-start gap-2 mb-2 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <ExecutiveHealthRing value={i.scorePct} size={32} accent={stateColor(i.state)} />
            <div>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: stateColor(i.state) }}>
                {i.label} · {i.scorePct}% · {i.trend.toUpperCase()}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {i.signal.slice(0, 100)}…
              </p>
            </div>
          </div>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAlerts = () => (
    <ExecutivePageShell>
      {profile.proactiveAlerts.length === 0 ? (
        <ExecutiveSecondaryCard title="NO URGENT ALERTS">
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Studio OS monitors pulse continuously — alerts appear before problems become crises.
          </p>
        </ExecutiveSecondaryCard>
      ) : (
        profile.proactiveAlerts.map((a) => (
          <ExecutiveSecondaryCard key={a.id} title={`${a.title.toUpperCase()} · ${a.severity.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: severityColor(a.severity) }}>
              {a.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              → {a.recommendedAction}
            </p>
          </ExecutiveSecondaryCard>
        ))
      )}
    </ExecutivePageShell>
  );

  const renderActions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RECOMMENDED ACTIONS · CHIEF OF STAFF GUIDANCE">
        {profile.recommendedActions.map((action) => (
          <p key={action} className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {action}
          </p>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'indicators':
        return renderIndicators();
      case 'alerts':
        return renderAlerts();
      case 'actions':
        return renderActions();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="organization-pulse" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0891B2' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0891B2' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(8,145,178,0.06)' : 'white',
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
