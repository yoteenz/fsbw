import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuccessionModeState } from '../../../../hooks/useSuccessionModeState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  KNOWLEDGE_DEPENDENCY_TYPES,
  SUCCESSION_MODE_PHILOSOPHY,
  SUCCESSION_READINESS_DIMENSIONS,
} from '../../../../studio-os-core/succession-mode';
import { adminStudioProfessionBrainPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type SuccessionTab = 'overview' | 'readiness' | 'dependencies' | 'recommendations' | 'legacy';

const TABS: { id: SuccessionTab; label: string }[] = [
  { id: 'overview', label: 'SUCCESSION OVERVIEW' },
  { id: 'readiness', label: 'READINESS SCORES' },
  { id: 'dependencies', label: 'DEPENDENCY MAP' },
  { id: 'recommendations', label: 'RECOMMENDATIONS' },
  { id: 'legacy', label: 'LEGACY CONTINUITY' },
];

function statusColor(status: string): string {
  if (status === 'strong') return '#16A34A';
  if (status === 'developing') return '#CA8A04';
  return ADMIN_STUDIO_THEME.accent;
}

export function SuccessionModeWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SuccessionTab>('overview');
  const { profile, refresh } = useSuccessionModeState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SUCCESSION MODE™ LOADING — MEASURING LEADERSHIP TRANSITION READINESS
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 98 · SUCCESSION READINESS SCORE"
        title={profile.companyName.toUpperCase()}
        subtitle="Not about replacing founders — preserving everything they have built."
        progressPct={profile.overallSuccessionReadiness}
        stats={[
          { label: 'READINESS', value: `${profile.overallSuccessionReadiness}%` },
          { label: 'STATUS', value: profile.overallStatus.toUpperCase() },
          { label: 'FOUNDER DEP', value: `${profile.founderDependencyPct}%` },
          { label: 'RISKS', value: String(profile.knowledgeDependencies.filter((d) => d.riskLevel === 'high').length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallSuccessionReadiness} size={56} label="SUCCESSION" />
        <div>
          {SUCCESSION_MODE_PHILOSOPHY.slice(2, 4).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="LEGACY CONTINUITY">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.legacyContinuity.canOperateWithoutFounder ? 'CAN OPERATE WITHOUT FOUNDER — TRENDING' : 'NEEDS MORE PRESERVATION'} · Continuity {profile.legacyContinuity.continuityScorePct}%
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.accent, color: ADMIN_STUDIO_THEME.accent }}
      >
        REFRESH SUCCESSION MODE
      </button>
      <button
        type="button"
        onClick={() => navigate(adminStudioProfessionBrainPath())}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        PROFESSION BRAIN →
      </button>
    </ExecutivePageShell>
  );

  const renderReadiness = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${SUCCESSION_READINESS_DIMENSIONS.length} READINESS DIMENSIONS`}>
        {profile.dimensionScores.map((d) => (
          <div key={d.id} className="flex items-start gap-2 mb-2 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <ExecutiveHealthRing value={d.scorePct} size={32} accent={statusColor(d.status)} />
            <div>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: statusColor(d.status) }}>
                {d.label} · {d.scorePct}%
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {d.signal.slice(0, 90)} · Improves when: {d.improvesWhen.slice(0, 60)}…
              </p>
            </div>
          </div>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDependencies = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`KNOWLEDGE DEPENDENCY MAP · ${KNOWLEDGE_DEPENDENCY_TYPES.join(' · ')}`}>
        {profile.knowledgeDependencies.map((d) => (
          <ExecutiveSecondaryCard key={d.id} title={`${d.area.toUpperCase()} · ${d.dependencyType.replace(/-/g, ' ').toUpperCase()}`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {d.riskLevel.toUpperCase()} RISK · {d.description.slice(0, 100)} · {d.recommendation.slice(0, 80)}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderRecommendations = () => (
    <ExecutivePageShell>
      {profile.recommendations.map((r) => (
        <ExecutiveSecondaryCard key={r.id} title={r.title}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {r.type.replace(/-/g, ' ').toUpperCase()} · {r.priority.toUpperCase()} · {r.rationale.slice(0, 120)}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderLegacy = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="LEGACY CONTINUITY · PRESERVE EXPERTISE · BUILD LEGACY">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.legacyContinuity.summary}
        </p>
        {profile.legacyContinuity.legacyActions.map((a) => (
          <p key={a} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {a}
          </p>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'readiness':
        return renderReadiness();
      case 'dependencies':
        return renderDependencies();
      case 'recommendations':
        return renderRecommendations();
      case 'legacy':
        return renderLegacy();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="succession-mode" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(146,112,74,0.06)' : 'white',
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
