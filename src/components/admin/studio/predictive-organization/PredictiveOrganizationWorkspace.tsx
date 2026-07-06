import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredictiveOrganizationState } from '../../../../hooks/usePredictiveOrganizationState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  FORECAST_HORIZON_LABELS,
  PREDICTIVE_INTELLIGENCE_LABELS,
  PREDICTIVE_ORGANIZATION_PHILOSOPHY,
  PREDICTION_CATEGORY_LABELS,
} from '../../../../studio-os-core/predictive-organization';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type PredictiveTab = 'overview' | 'intelligence' | 'predictions' | 'forecasts';

const TABS: { id: PredictiveTab; label: string }[] = [
  { id: 'overview', label: 'PREDICTIVE OVERVIEW' },
  { id: 'intelligence', label: 'PREDICTIVE INTELLIGENCE' },
  { id: 'predictions', label: 'PREDICTIONS' },
  { id: 'forecasts', label: 'EXECUTIVE FORECASTS' },
];

const ACCENT = '#EA580C';

function severityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  if (severity === 'critical') return '#EB1C24';
  if (severity === 'high') return ACCENT;
  return ADMIN_STUDIO_THEME.textSecondary;
}

function trendLabel(trend: 'rising' | 'stable' | 'declining' | 'volatile'): string {
  return trend.toUpperCase();
}

export function PredictiveOrganizationWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PredictiveTab>('overview');
  const { profile, refresh } = usePredictiveOrganizationState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PREDICTIVE ORGANIZATION™ LOADING — ANALYZING HISTORICAL INTELLIGENCE
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 113 · PREDICTIVE ORGANIZATION™"
        title={profile.companyName.toUpperCase()}
        subtitle="Prepare for tomorrow before it arrives — prediction with reasoning and confidence."
        progressPct={profile.predictiveScore}
        stats={[
          { label: 'PREDICTIVE', value: `${profile.predictiveScore}%` },
          { label: 'DOMAINS', value: String(profile.domainsAnalyzed) },
          { label: 'PREDICTIONS', value: String(profile.predictionsActive) },
          { label: 'FORECASTS', value: String(profile.forecastsReady) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.predictiveScore} size={56} label="READY" accent={ACCENT} />
        <div>
          {PREDICTIVE_ORGANIZATION_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK PREDICTION">
        <p className="text-[6px] font-futura" style={{ color: ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockPredictionLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="PREPARE — DON'T REACT">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Forecasts continuously improve as Studio OS learns from historical organizational intelligence.
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
        REFRESH FORECASTS
      </button>
    </ExecutivePageShell>
  );

  const renderIntelligence = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PREDICTIVE INTELLIGENCE · 12 DOMAINS CONTINUOUSLY ANALYZED">
        {profile.intelligenceSnapshots.map((snap) => (
          <ExecutiveSecondaryCard key={snap.domain} title={PREDICTIVE_INTELLIGENCE_LABELS[snap.domain].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              {trendLabel(snap.trend)} · {snap.confidencePct}% CONFIDENCE · {snap.dataPoints} DATA POINTS
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {snap.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderPredictions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PREDICTIONS · RECOMMENDED ACTIONS BEFORE PROBLEMS OCCUR">
        {profile.predictions.map((pred) => (
          <ExecutiveSecondaryCard key={pred.id} title={PREDICTION_CATEGORY_LABELS[pred.category].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: severityColor(pred.severity), fontWeight: 515 }}>
              {pred.prediction}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Reasoning: {pred.reasoning}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              Action: {pred.recommendedAction}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {pred.predictedWindow} · {pred.confidencePct}% confidence
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderForecasts = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXECUTIVE FORECASTS · MISSION CONTROL DASHBOARDS">
        {profile.executiveForecasts.map((forecast) => (
          <ExecutiveSecondaryCard key={forecast.id} title={FORECAST_HORIZON_LABELS[forecast.horizon].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              {forecast.probabilityPct}% PROBABILITY · {forecast.riskLevel.toUpperCase()} RISK
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {forecast.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="predictive-organization" className="mb-2" />
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
      {tab === 'intelligence' && renderIntelligence()}
      {tab === 'predictions' && renderPredictions()}
      {tab === 'forecasts' && renderForecasts()}
    </div>
  );
}
