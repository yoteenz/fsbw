import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisionAuditState } from '../../../../hooks/useDecisionAuditState';
import {
  DECISION_AUDIT_ACCENT,
  DECISION_AUDIT_PHILOSOPHY,
  AUDIT_SOURCE_LABELS,
  APPROVAL_STATUS_LABELS,
  TIMELINE_FILTERS,
  queryDecisionAudit,
  refreshDecisionAudit,
  selectDecision,
  setTimelineFilter,
  getFilteredTimeline,
  getSelectedDecision,
} from '../../../../studio-os-core/decision-audit';
import type { TimelineFilter } from '../../../../studio-os-core/decision-audit';
import { adminStudioSelfHealingEnginePath, adminStudioConfidenceEnginePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type DecisionAuditTab = 'overview' | 'timeline' | 'decisions' | 'detail';

const TABS: { id: DecisionAuditTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'timeline', label: 'DECISION TIMELINE™' },
  { id: 'decisions', label: 'ALL DECISIONS' },
  { id: 'detail', label: 'DECISION DETAIL' },
];

const STATUS_COLOR: Record<string, string> = {
  approved: '#10B981',
  rejected: '#EF4444',
  pending: '#F59E0B',
  'auto-approved': '#6366F1',
  escalated: '#F97316',
  informational: '#0EA5E9',
};

export function DecisionAuditWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DecisionAuditTab>('overview');
  const [searchQuery, setSearchQuery] = useState('workflow');
  const { profile, refresh } = useDecisionAuditState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DECISION AUDIT™ LOADING — RECORDING ORGANIZATIONAL ACCOUNTABILITY
      </p>
    );
  }

  const selected = getSelectedDecision(profile);
  const filteredTimeline = getFilteredTimeline(profile);
  const searchHits = queryDecisionAudit(searchQuery, profile, 8);

  const handleSelect = (id: string) => {
    selectDecision(profile.organizationId, id);
    refresh();
    setTab('detail');
  };

  const handleRefresh = () => {
    refreshDecisionAudit(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 151 · DECISION AUDIT™ · PERMANENT ACCOUNTABILITY"
        title={profile.companyName.toUpperCase()}
        subtitle="Every significant recommendation, approval, rejection, automation, and AI decision — permanently recorded with evidence, confidence, and explanation."
        progressPct={profile.accountabilityScore}
        stats={[
          { label: 'DECISIONS', value: `${profile.totalDecisions}` },
          { label: 'EXPLAINABLE', value: `${profile.explainableDecisions}` },
          { label: 'PENDING', value: `${profile.pendingApprovals}` },
          { label: 'TODAY', value: `${profile.decisionsToday}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.accountabilityScore} size={56} label="DA" accent={DECISION_AUDIT_ACCENT} />
        <div>
          {DECISION_AUDIT_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="NEVER A BLACK BOX">
        <p className="text-[6px] font-futura" style={{ color: DECISION_AUDIT_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockDecisionAuditLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="9 AUDIT SOURCES">
        {Object.values(AUDIT_SOURCE_LABELS).map((label) => (
          <p key={label} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="RECENT DECISIONS">
        {profile.decisions.slice(0, 4).map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => handleSelect(d.id)}
            className="block w-full text-left mb-2 px-1 py-1 border-0 bg-transparent cursor-pointer"
          >
            <p className="text-[6px] font-futura" style={{ color: STATUS_COLOR[d.approvalStatus], fontWeight: 515 }}>
              {d.decisionTypeLabel} · {APPROVAL_STATUS_LABELS[d.approvalStatus]}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {d.decision.slice(0, 70)}…
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('timeline')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: DECISION_AUDIT_ACCENT, color: DECISION_AUDIT_ACCENT }}>
        OPEN DECISION TIMELINE™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioSelfHealingEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SELF-HEALING →
      </button>
      <button type="button" onClick={() => navigate(adminStudioConfidenceEnginePath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        CONFIDENCE ENGINE →
      </button>
    </ExecutivePageShell>
  );

  const renderTimeline = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DECISION TIMELINE™ — CHRONOLOGICAL REPLAY">
        <div className="flex flex-wrap gap-1 mb-3">
          {TIMELINE_FILTERS.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => { setTimelineFilter(profile.organizationId, { period: period as TimelineFilter }); refresh(); }}
              className="px-2 py-1 text-[6px] font-futura uppercase border"
              style={{
                borderColor: profile.activeFilter.period === period ? DECISION_AUDIT_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                color: profile.activeFilter.period === period ? DECISION_AUDIT_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              }}
            >
              {period.toUpperCase()}
            </button>
          ))}
        </div>
        {filteredTimeline.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => handleSelect(entry.decisionId)}
            className="block w-full text-left mb-2 px-2 py-2 border"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'transparent' }}
          >
            <p className="text-[6px] font-futura mb-1" style={{ color: DECISION_AUDIT_ACCENT, fontWeight: 515 }}>
              {new Date(entry.timestamp).toLocaleString()} · {entry.label}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: STATUS_COLOR[entry.approvalStatus] }}>
              {entry.decisionMaker} · {APPROVAL_STATUS_LABELS[entry.approvalStatus]}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {entry.summary}…
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDecisions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ALL RECORDED DECISIONS">
        {profile.decisions.map((d) => (
          <ExecutiveSecondaryCard key={d.id} title={`${d.decisionTypeLabel.toUpperCase()} · ${d.confidencePct}% CONFIDENCE`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: DECISION_AUDIT_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {d.decision}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: STATUS_COLOR[d.approvalStatus] }}>
              {d.auditSourceLabel} · {d.decisionMaker} · {APPROVAL_STATUS_LABELS[d.approvalStatus]}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {d.department} · {d.workflow} · {new Date(d.timestamp).toLocaleString()}
            </p>
            <button type="button" onClick={() => handleSelect(d.id)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: DECISION_AUDIT_ACCENT, color: DECISION_AUDIT_ACCENT }}>
              VIEW FULL EXPLANATION →
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
        <ExecutiveFocusPanel title={`DECISION DETAIL · ${selected.decisionTypeLabel.toUpperCase()}`}>
          <ExecutiveSecondaryCard title="DECISION">
            <p className="text-[6px] font-futura mb-1" style={{ color: DECISION_AUDIT_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {selected.decision}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {new Date(selected.timestamp).toLocaleString()} · {selected.confidencePct}% confidence · {APPROVAL_STATUS_LABELS[selected.approvalStatus]}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="WHY IT HAPPENED">
            <p className="text-[6px] font-futura" style={{ color: DECISION_AUDIT_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {selected.whyItHappened}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="DECISION MAKER · APPROVED BY">
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Maker: {selected.decisionMaker}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Approved by: {selected.approvedBy ?? 'Pending approval'}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="SUPPORTING EVIDENCE">
            {selected.supportingEvidence.map((e) => (
              <p key={e} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                · {e}
              </p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="KNOWLEDGE SOURCES USED">
            {selected.knowledgeSourcesUsed.map((s) => (
              <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {s}
              </p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="ALTERNATIVE OPTIONS CONSIDERED">
            {selected.alternativeOptionsConsidered.map((o) => (
              <p key={o} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                · {o}
              </p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="POTENTIAL RISKS · BUSINESS IMPACT">
            {selected.potentialRisks.map((r) => (
              <p key={r} className="text-[6px] font-futura mb-1" style={{ color: '#F59E0B', lineHeight: 1.4 }}>
                ⚠ {r}
              </p>
            ))}
            <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              Impact: {selected.businessImpact}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RELATED DOCUMENTS">
            {selected.relatedDocuments.map((doc) => (
              <p key={doc} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                📄 {doc}
              </p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RELATED CONVERSATIONS">
            {selected.relatedConversations.length > 0 ? selected.relatedConversations.map((c) => (
              <p key={c} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                💬 {c}
              </p>
            )) : (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>No linked conversations</p>
            )}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RELATED WORKFLOWS">
            {selected.relatedWorkflows.map((w) => (
              <p key={w} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                ⚙ {w}
              </p>
            ))}
          </ExecutiveSecondaryCard>
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="decision-audit" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? DECISION_AUDIT_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? DECISION_AUDIT_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: DECISION_AUDIT_ACCENT, color: DECISION_AUDIT_ACCENT }}>
          SYNC DECISION AUDIT
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search decisions, timeline, approvers…"
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
              onClick={() => {
                if (h.type === 'decision') handleSelect(h.id);
                else {
                  const entry = profile.timeline.find((t) => t.id === h.id);
                  if (entry) handleSelect(entry.decisionId);
                }
              }}
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
      {tab === 'timeline' && renderTimeline()}
      {tab === 'decisions' && renderDecisions()}
      {tab === 'detail' && renderDetail()}
    </div>
  );
}
