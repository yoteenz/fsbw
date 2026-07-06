import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredictiveQaState } from '../../../../hooks/usePredictiveQaState';
import {
  PREDICTIVE_QA_ACCENT,
  PREDICTIVE_QA_PHILOSOPHY,
  ANALYSIS_SOURCE_LABELS,
  PREDICTION_PATTERN_LABELS,
  queryPredictiveQa,
  refreshPredictiveQa,
  dismissPrediction,
  mitigatePrediction,
} from '../../../../studio-os-core/predictive-qa';
import {
  adminStudioExecutiveTrustDashboardPath,
  adminStudioTimeMachinePath,
  adminStudioSelfHealingEnginePath,
} from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type PredictiveQaTab = 'overview' | 'predictions' | 'patterns' | 'actions';

const TABS: { id: PredictiveQaTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'predictions', label: 'PREDICTIONS' },
  { id: 'patterns', label: 'PATTERNS' },
  { id: 'actions', label: 'PREVENTATIVE ACTIONS' },
];

const SEVERITY_COLOR: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

const TREND_ICON: Record<string, string> = {
  emerging: '◌',
  stable: '→',
  accelerating: '↑',
};

export function PredictiveQaWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PredictiveQaTab>('overview');
  const [searchQuery, setSearchQuery] = useState('onboarding');
  const { profile, refresh } = usePredictiveQaState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PREDICTIVE QA™ LOADING — ANALYZING FUTURE OPERATIONAL RISKS
      </p>
    );
  }

  const activePredictions = profile.predictions.filter((p) => p.status === 'active');
  const searchHits = queryPredictiveQa(searchQuery, profile, 8);

  const handleRefresh = () => {
    refreshPredictiveQa(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 149 · PREDICTIVE QA™ · FUTURE RISK PROTECTION"
        title={profile.companyName.toUpperCase()}
        subtitle="Identify tomorrow's problems while there is still time to prevent them — confidence, evidence, timeline, impact, and action for every prediction."
        progressPct={profile.predictiveQaScore}
        stats={[
          { label: 'ACTIVE', value: `${profile.activePredictions}` },
          { label: 'HIGH-RISK', value: `${profile.highRiskPredictions}` },
          { label: 'PATTERNS', value: `${profile.patternsDetected}` },
          { label: 'PREVENTABLE', value: `${profile.preventableRisks}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.predictiveQaScore} size={56} label="PQ" accent={PREDICTIVE_QA_ACCENT} />
        <div>
          {PREDICTIVE_QA_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="STUDIO OS PROTECTS THE FUTURE">
        <p className="text-[6px] font-futura" style={{ color: PREDICTIVE_QA_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockPredictiveQaLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="10 CONTINUOUS ANALYSIS SOURCES">
        {Object.values(ANALYSIS_SOURCE_LABELS).slice(0, 6).map((label) => (
          <p key={label} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
          </p>
        ))}
        <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          + Workflow history · Performance · System changes · User behavior
        </p>
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="TOP PREDICTIONS — ACT NOW">
        {activePredictions.slice(0, 3).map((p) => (
          <p key={p.id} className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            <span style={{ color: SEVERITY_COLOR[p.severity], fontWeight: 515 }}>[{p.severity.toUpperCase()}]</span>{' '}
            {p.title} — {p.confidencePct}% · {p.timelineLabel}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('predictions')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PREDICTIVE_QA_ACCENT, color: PREDICTIVE_QA_ACCENT }}>
        VIEW ALL PREDICTIONS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioTimeMachinePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        TIME MACHINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioSelfHealingEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SELF-HEALING →
      </button>
      <button type="button" onClick={() => navigate(adminStudioExecutiveTrustDashboardPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        TRUST DASHBOARD →
      </button>
    </ExecutivePageShell>
  );

  const renderPredictions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="FUTURE RISK PREDICTIONS">
        {profile.predictions.map((p) => (
          <ExecutiveSecondaryCard key={p.id} title={`${p.title.toUpperCase()} · ${p.confidencePct}% CONFIDENCE`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PREDICTIVE_QA_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {p.statement}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[p.severity] }}>
              {p.patternLabel} · {p.timelineLabel} · {p.status.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <strong>Impact:</strong> {p.businessImpact}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <strong>Departments:</strong> {p.departmentsAffected.join(' · ')}
            </p>
            <ExecutiveSecondaryCard title="SUPPORTING EVIDENCE">
              {p.supportingEvidence.map((e) => (
                <p key={e} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {e}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="RECOMMENDED PREVENTATIVE ACTION">
              <p className="text-[6px] font-futura" style={{ color: PREDICTIVE_QA_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
                {p.recommendedPreventativeAction}
              </p>
            </ExecutiveSecondaryCard>
            {p.status === 'active' ? (
              <div className="flex gap-1 mt-2">
                <button type="button" onClick={() => { mitigatePrediction(profile.organizationId, p.id); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PREDICTIVE_QA_ACCENT, color: PREDICTIVE_QA_ACCENT }}>
                  START MITIGATION
                </button>
                <button type="button" onClick={() => { dismissPrediction(profile.organizationId, p.id); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  DISMISS
                </button>
              </div>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderPatterns = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DETECTED PATTERNS">
        {profile.patterns.map((pat) => (
          <ExecutiveSecondaryCard key={pat.id} title={`${pat.label.toUpperCase()} · ${pat.signalStrength}% SIGNAL`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {pat.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: PREDICTIVE_QA_ACCENT }}>
              Trend {TREND_ICON[pat.trend]} {pat.trend} · Sources: {pat.analysisSources.map((s) => ANALYSIS_SOURCE_LABELS[s]).join(', ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="10 PATTERN TYPES MONITORED">
        {Object.entries(PREDICTION_PATTERN_LABELS).map(([key, label]) => (
          <p key={key} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
          </p>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderActions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RECOMMENDED PREVENTATIVE ACTIONS">
        {profile.preventativeActions.map((a) => (
          <ExecutiveSecondaryCard key={a.id} title={`${a.priority.toUpperCase()} · ${a.ownerDepartment.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PREDICTIVE_QA_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {a.action}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Effort: {a.estimatedEffort}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="predictive-qa" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? PREDICTIVE_QA_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? PREDICTIVE_QA_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: PREDICTIVE_QA_ACCENT, color: PREDICTIVE_QA_ACCENT }}>
          SYNC PREDICTIVE QA
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search predictions, patterns, actions…"
          className="flex-1 px-2 py-1 text-[6px] font-futura border bg-transparent"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
        />
      </div>
      {searchHits.length > 0 && searchQuery.trim() ? (
        <ExecutiveSecondaryCard title="SEARCH RESULTS">
          {searchHits.map((h) => (
            <p key={h.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {h.label} — {h.matchReason}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      ) : null}
      {tab === 'overview' && renderOverview()}
      {tab === 'predictions' && renderPredictions()}
      {tab === 'patterns' && renderPatterns()}
      {tab === 'actions' && renderActions()}
    </div>
  );
}
