import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioIntelligenceState } from '../../../../hooks/useAdminStudioIntelligenceState';
import {
  STUDIO_INTELLIGENCE_TABS,
  type StudioIntelligenceTabId,
} from '../../../../utils/adminStudioStudioIntelligenceDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  BRIEFING_CADENCE_LABELS,
  BUSINESS_HEALTH_CATEGORY_LABELS,
  CONNECTED_SYSTEMS,
} from '../../../../studio-os-core/studio-intelligence/constants';
import {
  adminStudioGovernancePath,
  adminStudioGrowthNetworkPath,
} from '../../../../utils/adminStudioRoutes';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
      {children}
    </p>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 border" style={panelStyle}>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      <p
        className="text-[14px] leading-none mt-1"
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          color: accent ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function StudioIntelligenceWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as StudioIntelligenceTabId | null) ?? 'overview';
  const [tab, setTab] = useState<StudioIntelligenceTabId>(
    STUDIO_INTELLIGENCE_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    briefings,
    workspaceSignals,
    opportunities,
    risks,
    executiveSynthesis,
    crossWorkspaceInsights,
    institutionalLearnings,
    recommendations,
    businessHealth,
    decisionJournal,
    learningRecords,
    confidenceBreakdowns,
    dashboard,
  } = useAdminStudioIntelligenceState();

  const selectTab = (id: StudioIntelligenceTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (briefings.length === 0) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        STUDIO INTELLIGENCE LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const morningBriefing = briefings.find((b) => b.cadence === 'morning') ?? briefings[0];

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="BUSINESS HEALTH" value={`${dashboard.businessHealthScore}`} accent />
              <MetricCard label="PRIORITY QUEUE" value={`${dashboard.priorityQueueCount}`} accent />
              <MetricCard label="OPPORTUNITIES" value={`${dashboard.opportunityCount}`} />
              <MetricCard label="RISK ALERTS" value={`${dashboard.riskAlertCount}`} />
              <MetricCard label="RECOMMENDATIONS" value={`${dashboard.activeRecommendations}`} />
              <MetricCard label="LEARNING HIGHLIGHTS" value={`${dashboard.learningHighlights}`} />
              <MetricCard label="INSTITUTIONAL UPDATES" value={`${dashboard.institutionalUpdates}`} />
              <MetricCard label="EXEC SUMMARIES" value={`${dashboard.executiveSummaries}`} />
              <MetricCard label="CROSS-WORKSPACE" value={`${dashboard.crossWorkspaceInsights}`} />
              <MetricCard label="BRIEFING" value={dashboard.briefingReady ? 'READY' : 'PENDING'} />
            </div>
            <SectionLabel>CHIEF INTELLIGENCE OFFICER · FOUNDER DECIDES</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Studio Intelligence recommends, explains, and learns — never acts autonomously on high-impact decisions. Augment judgment with context and historical learning.
            </p>
            {morningBriefing ? (
              <>
                <SectionLabel>TODAY&apos;S TOP ACTIONS</SectionLabel>
                {morningBriefing.recommendedActions.map((a) => (
                  <p key={a} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {a}
                  </p>
                ))}
              </>
            ) : null}
          </div>
        );

      case 'briefing':
        return (
          <div className="space-y-3">
            <SectionLabel>EXECUTIVE BRIEFING · PERSONALIZED PER WORKSPACE</SectionLabel>
            {(Object.keys(BRIEFING_CADENCE_LABELS) as Array<keyof typeof BRIEFING_CADENCE_LABELS>).map((cadence) => {
              const b = briefings.find((br) => br.cadence === cadence);
              return (
                <p key={cadence} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: b ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                  {BRIEFING_CADENCE_LABELS[cadence]} · {b ? `Generated ${b.generatedAt.slice(0, 10)}` : 'Not yet generated'}
                </p>
              );
            })}
            {morningBriefing ? (
              <div className="p-2 border space-y-2" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {BRIEFING_CADENCE_LABELS[morningBriefing.cadence].toUpperCase()}
                </p>
                <SectionLabel>OPPORTUNITIES</SectionLabel>
                {morningBriefing.topOpportunities.map((o) => (
                  <p key={o} className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>{o}</p>
                ))}
                <SectionLabel>RISKS</SectionLabel>
                {morningBriefing.topRisks.map((r) => (
                  <p key={r} className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>{r}</p>
                ))}
                <SectionLabel>EXECUTIVE AI SUMMARIES</SectionLabel>
                {morningBriefing.executiveAiSummaries.map((s) => (
                  <p key={s} className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>{s}</p>
                ))}
              </div>
            ) : null}
          </div>
        );

      case 'workspace':
        return (
          <div className="space-y-3">
            <SectionLabel>WORKSPACE INTELLIGENCE · TRENDS BEFORE PROBLEMS</SectionLabel>
            {workspaceSignals.map((s) => (
              <div key={s.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {s.category.replace(/-/g, ' ').toUpperCase()} · {s.metric} · {s.value} · {s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'} {s.trendPct}%
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {s.insight}
                </p>
              </div>
            ))}
          </div>
        );

      case 'opportunities':
        return (
          <div className="space-y-3">
            <SectionLabel>OPPORTUNITY ENGINE · PROACTIVE · WHY · IMPACT · CONFIDENCE</SectionLabel>
            {opportunities.map((o) => (
              <div key={o.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {o.confidence}% · {o.title}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  Why: {o.why}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Impact: {o.expectedImpact}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Evidence: {o.supportingEvidence.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-3">
            <SectionLabel>RISK ENGINE · SEVERITY · CONFIDENCE · ACTION</SectionLabel>
            {risks.map((r) => (
              <div key={r.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {r.severity.toUpperCase()} · {r.confidence}% · {r.title}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Action: {r.recommendedAction}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Evidence: {r.supportingEvidence.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'executive':
        return (
          <div className="space-y-3">
            <SectionLabel>EXECUTIVE SYNTHESIS · ONE UNIFIED SUMMARY</SectionLabel>
            {executiveSynthesis.map((e) => (
              <div key={e.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {e.executiveName} · {e.role}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {e.unifiedSummary}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {e.keyFindings.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'cross-workspace':
        return (
          <div className="space-y-3">
            <SectionLabel>CROSS-WORKSPACE INTELLIGENCE · PORTFOLIO INSIGHTS</SectionLabel>
            {crossWorkspaceInsights.map((c) => (
              <div key={c.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {c.insightType.replace(/-/g, ' ').toUpperCase()} · {c.confidence}% · {c.title}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {c.recommendation}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Workspaces: {c.workspaceIds.join(', ')} · Impact: {c.expectedImpact}
                </p>
              </div>
            ))}
          </div>
        );

      case 'institutional':
        return (
          <div className="space-y-3">
            <SectionLabel>INSTITUTIONAL INTELLIGENCE · FOUNDER-APPROVED LEARNINGS</SectionLabel>
            {institutionalLearnings.map((l) => (
              <div key={l.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {l.outcome.toUpperCase()} · {l.title} {l.approvedByFounder ? '· ✓ APPROVED' : ''}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {l.learning}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Memory Bible: {l.memoryBibleLinked ? 'LINKED' : 'PENDING'} · KG {l.knowledgeGraphNodeId}
                </p>
              </div>
            ))}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-3">
            <SectionLabel>RECOMMENDATION CENTER · HISTORICAL EVIDENCE REQUIRED</SectionLabel>
            {recommendations.map((r) => (
              <div key={r.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {r.confidence}% · {r.recommendType.replace(/-/g, ' ').toUpperCase()} · {r.title}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {r.why}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Evidence: {r.historicalEvidence.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'health':
        return businessHealth ? (
          <div className="space-y-3">
            <SectionLabel>BUSINESS HEALTH SCORE · HOLISTIC</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="OVERALL" value={`${businessHealth.overall}`} accent />
              <MetricCard label="TREND" value={businessHealth.trend.toUpperCase()} />
            </div>
            {(Object.keys(BUSINESS_HEALTH_CATEGORY_LABELS) as Array<keyof typeof BUSINESS_HEALTH_CATEGORY_LABELS>).map((cat) => (
              <p key={cat} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {BUSINESS_HEALTH_CATEGORY_LABELS[cat]} · {businessHealth.categoryScores[cat]}
              </p>
            ))}
            <SectionLabel>PRIORITY IMPROVEMENTS</SectionLabel>
            {businessHealth.priorityImprovements.map((p) => (
              <p key={p} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, lineHeight: 1.4 }}>
                {p}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>No health score computed yet.</p>
        );

      case 'decisions':
        return (
          <div className="space-y-3">
            <SectionLabel>DECISION JOURNAL · MEMORY BIBLE · KG LINKED</SectionLabel>
            {decisionJournal.map((d) => (
              <div key={d.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {d.decision}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  Reason: {d.reason}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Expected: {d.expectedOutcome}
                </p>
                {d.actualOutcome ? (
                  <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    Actual: {d.actualOutcome} {d.lessonsLearned ? `· Lesson: ${d.lessonsLearned}` : ''}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        );

      case 'learning':
        return (
          <div className="space-y-3">
            <SectionLabel>LEARNING ENGINE · DURABLE PATTERNS VS TEMPORARY TRENDS</SectionLabel>
            {learningRecords.map((l) => (
              <div key={l.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {l.pattern.replace(/-/g, ' ').toUpperCase()} · {l.confidence}% · {l.title}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {l.insight}
                </p>
              </div>
            ))}
          </div>
        );

      case 'confidence':
        return (
          <div className="space-y-3">
            <SectionLabel>CONFIDENCE ENGINE · NEVER CERTAINTY</SectionLabel>
            {confidenceBreakdowns.map((c) => (
              <div key={c.recommendationId} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {c.confidenceScore}% confidence · {c.recommendationId}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Data: {c.supportingData.join(' · ')}
                </p>
                {c.relatedExperiments.length > 0 ? (
                  <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    Experiments: {c.relatedExperiments.join(', ')}
                  </p>
                ) : null}
                {c.potentialRisks.length > 0 ? (
                  <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    Risks: {c.potentialRisks.join(' · ')}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-3">
            <SectionLabel>KNOWLEDGE GRAPH INTEGRATION · WHY RECOMMENDATIONS</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Every recommendation connects to Memory Bible, Knowledge Graph, Creative DNA, Company DNA, Labs, Growth Network, Marketplace, BME, and Governance — explore exactly why.
            </p>
            <SectionLabel>CONNECTED SYSTEMS</SectionLabel>
            {CONNECTED_SYSTEMS.map((s) => (
              <p key={s} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {s.toUpperCase()} · REPORTS INTO STUDIO INTELLIGENCE
              </p>
            ))}
            <SectionLabel>SAMPLE KG LINKS (MORNING BRIEFING)</SectionLabel>
            {opportunities.flatMap((o) => o.knowledgeGraphNodeIds).filter((id, i, arr) => arr.indexOf(id) === i).map((nodeId) => (
              <p key={nodeId} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {nodeId}
              </p>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-3">
        {STUDIO_INTELLIGENCE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioGovernancePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← GOVERNANCE
        </button>
        <button
          type="button"
          onClick={() => navigate(adminStudioGrowthNetworkPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          GROWTH NETWORK →
        </button>
      </div>
    </div>
  );
}
