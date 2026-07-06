import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfidenceEngineState } from '../../../../hooks/useConfidenceEngineState';
import {
  CONFIDENCE_ENGINE_ACCENT,
  CONFIDENCE_ENGINE_PHILOSOPHY,
  CONFIDENCE_LEVEL_LABELS,
  queryConfidenceEngine,
  refreshConfidenceEngine,
  selectRecommendation,
  getSelectedRecommendation,
  explainConfidenceChange,
} from '../../../../studio-os-core/confidence-engine';
import { adminStudioDecisionAuditPath, adminStudioOrganizationalGuardianPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type ConfidenceTab = 'overview' | 'recommendations' | 'explorer' | 'detail';

const TABS: { id: ConfidenceTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'recommendations', label: 'RECOMMENDATIONS' },
  { id: 'explorer', label: 'CONFIDENCE EXPLORER™' },
  { id: 'detail', label: 'DETAIL' },
];

const LEVEL_COLOR: Record<string, string> = {
  'very-high': '#10B981',
  high: '#6366F1',
  moderate: '#F59E0B',
  low: '#F97316',
  'insufficient-evidence': '#EF4444',
};

const RISK_COLOR: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export function ConfidenceEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ConfidenceTab>('overview');
  const [searchQuery, setSearchQuery] = useState('publish');
  const { profile, refresh } = useConfidenceEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        CONFIDENCE ENGINE™ LOADING — MEASURING INTELLIGENCE CONFIDENCE
      </p>
    );
  }

  const selected = getSelectedRecommendation(profile);
  const searchHits = queryConfidenceEngine(searchQuery, profile, 8);

  const handleSelect = (id: string) => {
    selectRecommendation(profile.organizationId, id);
    refresh();
    setTab('detail');
  };

  const handleRefresh = () => {
    refreshConfidenceEngine(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 152 · CONFIDENCE ENGINE™ · VISIBLE INTELLIGENCE"
        title={profile.companyName.toUpperCase()}
        subtitle="Every Studio Intelligence™ recommendation displays confidence, evidence, reasoning, and what we don't know — confidence is a conversation, not a black box."
        progressPct={profile.overallConfidenceScore}
        stats={[
          { label: 'ACTIVE', value: `${profile.recommendationsActive}` },
          { label: 'AVG', value: `${profile.averageRecommendationConfidence}%` },
          { label: 'LOW', value: `${profile.lowConfidenceCount}` },
          { label: 'EXPLORER', value: `${profile.explorerEntries}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallConfidenceScore} size={56} label="CE" accent={CONFIDENCE_ENGINE_ACCENT} />
        <div>
          {CONFIDENCE_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="CONFIDENCE IS A CONVERSATION">
        <p className="text-[6px] font-futura" style={{ color: CONFIDENCE_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockConfidenceLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="5 CONFIDENCE LEVELS">
        {Object.entries(CONFIDENCE_LEVEL_LABELS).map(([key, label]) => (
          <p key={key} className="text-[6px] font-futura mb-1" style={{ color: LEVEL_COLOR[key] ?? ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="EXAMPLE — NOT JUST &quot;PUBLISH TUESDAY&quot;">
        {profile.recommendations.find((r) => r.category === 'publishing-schedule') ? (
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {profile.recommendations.find((r) => r.category === 'publishing-schedule')!.conversationalExplanation}
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('recommendations')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: CONFIDENCE_ENGINE_ACCENT, color: CONFIDENCE_ENGINE_ACCENT }}>
        VIEW RECOMMENDATIONS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioDecisionAuditPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DECISION AUDIT →
      </button>
      <button type="button" onClick={() => navigate(adminStudioOrganizationalGuardianPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        GUARDIAN →
      </button>
    </ExecutivePageShell>
  );

  const renderRecommendations = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STUDIO INTELLIGENCE™ RECOMMENDATIONS WITH CONFIDENCE">
        {profile.recommendations.map((r) => (
          <ExecutiveSecondaryCard key={r.id} title={`${r.categoryLabel.toUpperCase()} · ${r.confidenceScore}% · ${r.confidenceLevelLabel.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-2" style={{ color: CONFIDENCE_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {r.conversationalExplanation}
            </p>
            {r.lowConfidenceDisclaimer ? (
              <p className="text-[6px] font-futura mb-2" style={{ color: '#F97316', lineHeight: 1.45 }}>
                ⚠ {r.lowConfidenceDisclaimer}
              </p>
            ) : null}
            <ExecutiveSecondaryCard title="SUPPORTING EVIDENCE">
              {r.supportingEvidence.map((e) => (
                <p key={e} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {e}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: RISK_COLOR[r.riskLevel] }}>
              Risk: {r.riskLevel.toUpperCase()}
            </p>
            <button type="button" onClick={() => handleSelect(r.id)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: CONFIDENCE_ENGINE_ACCENT, color: CONFIDENCE_ENGINE_ACCENT }}>
              FULL EXPLANATION →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderExplorer = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONFIDENCE EXPLORER™ — WHY CONFIDENCE CHANGED">
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Inspect how confidence changed over time — what we learned, what improved, and what reduced our certainty.
        </p>
        {profile.explorerHistory.map((entry) => (
          <ExecutiveSecondaryCard key={entry.id} title={`${entry.label.toUpperCase()} · ${entry.previousScore}% → ${entry.currentScore}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: entry.delta >= 0 ? '#10B981' : '#EF4444', fontWeight: 515 }}>
              {entry.delta >= 0 ? '+' : ''}{entry.delta}% · {CONFIDENCE_LEVEL_LABELS[entry.previousLevel]} → {CONFIDENCE_LEVEL_LABELS[entry.currentLevel]}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {explainConfidenceChange(entry)}
            </p>
            <ExecutiveSecondaryCard title="REASONS">
              {entry.changeReasons.map((reason) => (
                <p key={reason} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {reason}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <button type="button" onClick={() => handleSelect(entry.recommendationId)} className="mt-1 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: CONFIDENCE_ENGINE_ACCENT, color: CONFIDENCE_ENGINE_ACCENT }}>
              VIEW RECOMMENDATION →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDetail = () => {
    if (!selected) return null;
    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={`${selected.categoryLabel.toUpperCase()} · ${selected.confidenceLevelLabel.toUpperCase()} CONFIDENCE`}>
          <ExecutiveSecondaryCard title="RECOMMENDATION">
            <p className="text-[6px] font-futura mb-1" style={{ color: CONFIDENCE_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {selected.recommendation}
            </p>
            <p className="text-[6px] font-futura" style={{ color: LEVEL_COLOR[selected.confidenceLevel], fontWeight: 515 }}>
              Confidence: {selected.confidenceScore}% · {selected.confidenceLevelLabel} · Risk: {selected.riskLevel}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="CONVERSATIONAL EXPLANATION">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {selected.conversationalExplanation}
            </p>
          </ExecutiveSecondaryCard>
          {selected.lowConfidenceDisclaimer ? (
            <ExecutiveSecondaryCard title="LOW CONFIDENCE — STUDIO INTELLIGENCE™ IS TRANSPARENT">
              <p className="text-[6px] font-futura" style={{ color: '#F97316', lineHeight: 1.45 }}>
                {selected.lowConfidenceDisclaimer}
              </p>
            </ExecutiveSecondaryCard>
          ) : null}
          <ExecutiveSecondaryCard title="WHAT WE KNOW">
            {selected.whatWeKnow.map((k) => (
              <p key={k} className="text-[6px] font-futura mb-1" style={{ color: '#10B981', lineHeight: 1.4 }}>
                ✓ {k}
              </p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="WHAT WE DON'T KNOW">
            {selected.whatWeDontKnow.map((k) => (
              <p key={k} className="text-[6px] font-futura mb-1" style={{ color: '#F59E0B', lineHeight: 1.4 }}>
                ? {k}
              </p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="REASONING SUMMARY">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>{selected.reasoningSummary}</p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="KNOWLEDGE SOURCES">
            {selected.knowledgeSources.map((s) => (
              <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>· {s}</p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RECENT VALIDATION">
            {selected.recentValidation.map((v) => (
              <p key={v} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>· {v}</p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="SIMULATION RESULTS">
            {selected.simulationResults.map((s) => (
              <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>· {s}</p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RELATED HISTORICAL OUTCOMES">
            {selected.relatedHistoricalOutcomes.map((o) => (
              <p key={o} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>· {o}</p>
            ))}
          </ExecutiveSecondaryCard>
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="confidence-engine" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? CONFIDENCE_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? CONFIDENCE_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: CONFIDENCE_ENGINE_ACCENT, color: CONFIDENCE_ENGINE_ACCENT }}>
          SYNC CONFIDENCE
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recommendations, confidence changes…"
          className="flex-1 px-2 py-1 text-[6px] font-futura border bg-transparent"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
        />
      </div>
      {searchHits.length > 0 && searchQuery.trim() ? (
        <ExecutiveSecondaryCard title="SEARCH RESULTS">
          {searchHits.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => h.type === 'recommendation' && handleSelect(h.id)}
              className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer"
            >
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {h.label} — {h.matchReason}
              </p>
            </button>
          ))}
        </ExecutiveSecondaryCard>
      ) : null}
      {tab === 'overview' && renderOverview()}
      {tab === 'recommendations' && renderRecommendations()}
      {tab === 'explorer' && renderExplorer()}
      {tab === 'detail' && renderDetail()}
    </div>
  );
}
