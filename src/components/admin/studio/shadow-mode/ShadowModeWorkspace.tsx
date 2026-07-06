import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShadowModeState } from '../../../../hooks/useShadowModeState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  PHASE_DESCRIPTIONS,
  SHADOW_LEARNING_PHASES,
  SHADOW_MODE_PHILOSOPHY,
} from '../../../../studio-os-core/shadow-mode';
import { adminStudioConciergeLayerPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type ShadowTab = 'overview' | 'phases' | 'confidence' | 'transparency';

const TABS: { id: ShadowTab; label: string }[] = [
  { id: 'overview', label: 'SHADOW OVERVIEW' },
  { id: 'phases', label: 'LEARNING PHASES' },
  { id: 'confidence', label: 'CONFIDENCE ENGINE' },
  { id: 'transparency', label: 'TRANSPARENCY LOG' },
];

function phaseColor(phase: string): string {
  if (phase === 'observe') return '#64748B';
  if (phase === 'recommend') return '#6366F1';
  if (phase === 'assist') return '#0891B2';
  return '#16A34A';
}

export function ShadowModeWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ShadowTab>('overview');
  const { profile, refresh } = useShadowModeState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SHADOW MODE™ LOADING — DIGITAL CONCIERGES OBSERVING BEFORE ACTING
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 102 · SHADOW MODE"
        title={profile.companyName.toUpperCase()}
        subtitle="Trust through observation — Digital Staff learn before they automate."
        progressPct={profile.overallTrustScore}
        stats={[
          { label: 'TRUST', value: `${profile.overallTrustScore}%` },
          { label: 'CONCIERGES', value: String(profile.conciergeProfiles.length) },
          { label: 'OBSERVING', value: String(profile.conciergesInShadow) },
          { label: 'AUTOMATE', value: String(profile.conciergesReadyToAutomate) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallTrustScore} size={56} label="TRUST" accent="#4F46E5" />
        <div>
          {SHADOW_MODE_PHILOSOPHY.slice(0, 3).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate(adminStudioConciergeLayerPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: '#4F46E5', color: '#4F46E5' }}
      >
        CONCIERGE LAYER →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH SHADOW MODE
      </button>
    </ExecutivePageShell>
  );

  const renderPhases = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${SHADOW_LEARNING_PHASES.length} LEARNING PHASES · OBSERVATION BEFORE EXECUTION`}>
        {SHADOW_LEARNING_PHASES.map((phase) => (
          <ExecutiveSecondaryCard key={phase} title={PHASE_DESCRIPTIONS[phase].label}>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {PHASE_DESCRIPTIONS[phase].summary}
            </p>
            <p className="text-[6px] font-futura" style={{ color: phaseColor(phase) }}>
              {profile.conciergeProfiles.filter((c) => c.currentPhase === phase).length} concierge(s) in this phase
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      {profile.conciergeProfiles.map((c) => (
        <ExecutiveSecondaryCard key={c.conciergeId} title={`${c.conciergeName.toUpperCase()} · ${c.currentPhase.toUpperCase()}`}>
          <p className="text-[6px] font-futura" style={{ color: phaseColor(c.currentPhase) }}>
            {c.phaseRationale.slice(0, 140)}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderConfidence = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONFIDENCE ENGINE · FOUNDER-DEFINED THRESHOLDS">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Automate threshold default {profile.conciergeProfiles[0]?.automationThreshold ?? 85}% — never automate below founder approval.
        </p>
        {profile.conciergeProfiles.map((c) => (
          <div key={c.conciergeId} className="flex items-start gap-2 mb-3 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <ExecutiveHealthRing value={c.confidence.overallConfidence} size={36} accent={phaseColor(c.currentPhase)} />
            <div>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: phaseColor(c.currentPhase) }}>
                {c.conciergeName} · {c.currentPhase.replace(/-/g, ' ').toUpperCase()}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Knowledge: {c.confidence.knowledgeConfidence}% · Workflow: {c.confidence.workflowConfidence}%
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Decision: {c.confidence.decisionConfidence}% · Automation: {c.confidence.automationReadiness}%
              </p>
            </div>
          </div>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTransparency = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="TRANSPARENCY · NOTHING HAPPENS INVISIBLY">
        {profile.transparencyLog.map((entry) => (
          <ExecutiveSecondaryCard key={entry.id} title={`${entry.conciergeName.toUpperCase()} · ${entry.phase.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ color: '#4F46E5' }}>Observed:</span> {entry.observed}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ color: '#6366F1' }}>Learned:</span> {entry.learned}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ color: '#0891B2' }}>Can automate:</span> {entry.canAutomate}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ color: '#16A34A' }}>Why confidence changed:</span> {entry.confidenceReason}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'phases':
        return renderPhases();
      case 'confidence':
        return renderConfidence();
      case 'transparency':
        return renderTransparency();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="shadow-mode" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#4F46E5' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#4F46E5' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(79,70,229,0.06)' : 'white',
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
