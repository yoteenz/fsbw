import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFounderOperatingSystemState } from '../../../../hooks/useFounderOperatingSystemState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  COACHING_CATEGORY_LABELS,
  FOCUS_PROTECTION_LABELS,
  FOUNDER_INTELLIGENCE_LABELS,
  FOUNDER_OS_ACCENT,
  FOUNDER_OS_PHILOSOPHY,
  STUDIO_OS_V1_FINAL_PROMISE,
} from '../../../../studio-os-core/founder-operating-system';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type FounderOsTab = 'dashboard' | 'intelligence' | 'coaching' | 'focus';

const TABS: { id: FounderOsTab; label: string }[] = [
  { id: 'dashboard', label: 'PERSONAL DASHBOARD' },
  { id: 'intelligence', label: 'FOUNDER INTELLIGENCE' },
  { id: 'coaching', label: 'EXECUTIVE COACHING' },
  { id: 'focus', label: 'FOCUS MANAGEMENT' },
];

export function FounderOperatingSystemWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<FounderOsTab>('dashboard');
  const { profile, refresh } = useFounderOperatingSystemState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        FOUNDER OPERATING SYSTEM™ LOADING — OPERATING THE FOUNDER
      </p>
    );
  }

  const d = profile.personalDashboard;

  const renderDashboard = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 118 · FOUNDER OPERATING SYSTEM™ · STUDIO OS V1"
        title={profile.companyName.toUpperCase()}
        subtitle="While Studio OS operates the organization — Founder OS operates the founder."
        progressPct={profile.founderEffectivenessScore}
        stats={[
          { label: 'EFFECTIVENESS', value: `${profile.founderEffectivenessScore}%` },
          { label: 'FOCUS', value: `${d.focusScorePct}%` },
          { label: 'LEADERSHIP', value: `${d.leadershipGrowthPct}%` },
          { label: 'BURNOUT RISK', value: `${d.burnoutRiskPct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.founderEffectivenessScore} size={56} label="FOUNDER" accent={FOUNDER_OS_ACCENT} />
        <div>
          {FOUNDER_OS_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title={STUDIO_OS_V1_FINAL_PROMISE}>
        <p className="text-[6px] font-futura" style={{ color: FOUNDER_OS_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockFounderLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="PERSONAL METRICS · COMPLEMENTS ORGANIZATION DASHBOARD">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['LEADERSHIP GROWTH', d.leadershipGrowthPct],
              ['FOCUS SCORE', d.focusScorePct],
              ['DECISION LOAD', d.decisionLoadPct],
              ['EXECUTIVE HEALTH', d.executiveHealthPct],
              ['LEARNING PROGRESS', d.learningProgressPct],
              ['DELEGATION OPS', d.delegationOpportunities],
              ['MEETING EFFECTIVENESS', d.meetingEffectivenessPct],
              ['STRATEGIC TIME', d.strategicTimePct],
              ['BURNOUT RISK', d.burnoutRiskPct],
              ['CREATIVE MOMENTUM', d.creativeMomentumPct],
            ] as const
          ).map(([label, value]) => (
            <p key={label} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {label}: <span style={{ color: FOUNDER_OS_ACCENT }}>{typeof value === 'number' ? `${value}%` : value}</span>
            </p>
          ))}
        </div>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: FOUNDER_OS_ACCENT, color: FOUNDER_OS_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH FOUNDER OS
      </button>
    </ExecutivePageShell>
  );

  const renderIntelligence = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="FOUNDER INTELLIGENCE · ADAPT RECOMMENDATIONS ACCORDINGLY">
        {profile.founderIntelligence.map((intel) => (
          <ExecutiveSecondaryCard key={intel.dimension} title={FOUNDER_INTELLIGENCE_LABELS[intel.dimension].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: FOUNDER_OS_ACCENT }}>
              {intel.scorePct}% · {intel.trend.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {intel.insight}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCoaching = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXECUTIVE COACHING · CONTINUOUSLY HELP FOUNDERS BECOME STRONGER LEADERS">
        {profile.coachingInsights.map((coach) => (
          <ExecutiveSecondaryCard key={coach.id} title={COACHING_CATEGORY_LABELS[coach.category].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: FOUNDER_OS_ACCENT, fontWeight: 515 }}>
              {coach.headline}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {coach.observation}
            </p>
            <p className="text-[6px] font-futura" style={{ color: FOUNDER_OS_ACCENT }}>
              {coach.recommendation} ({coach.confidencePct}% confidence)
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFocus = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="FOCUS MANAGEMENT · PROTECT DEEP WORK · BATCH · DELEGATE · OPTIMIZE">
        {profile.focusActions.map((action) => (
          <ExecutiveSecondaryCard key={action.id} title={FOCUS_PROTECTION_LABELS[action.target].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: action.protected ? FOUNDER_OS_ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
              {action.protected ? 'PROTECTED' : 'RECOMMENDED'} · {action.scheduledBlock}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {action.action}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="founder-operating-system" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? FOUNDER_OS_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? FOUNDER_OS_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'dashboard' && renderDashboard()}
      {tab === 'intelligence' && renderIntelligence()}
      {tab === 'coaching' && renderCoaching()}
      {tab === 'focus' && renderFocus()}
    </div>
  );
}
