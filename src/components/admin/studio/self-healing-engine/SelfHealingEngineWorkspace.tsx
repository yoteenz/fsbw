import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelfHealingEngineState } from '../../../../hooks/useSelfHealingEngineState';
import {
  SELF_HEALING_ENGINE_ACCENT,
  SELF_HEALING_ENGINE_PHILOSOPHY,
  HEALING_CATEGORY_LABELS,
  HEALING_MODE_LABELS,
  HEALING_MODES,
  querySelfHealingEngine,
  refreshSelfHealingEngine,
  approveRepair,
  dismissIssue,
  rollbackRepair,
  updateHealingMode,
  updateHealingThresholds,
} from '../../../../studio-os-core/self-healing-engine';
import type { HealingMode } from '../../../../studio-os-core/self-healing-engine';
import { adminStudioPredictiveQaPath, adminStudioDecisionAuditPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type SelfHealingTab = 'overview' | 'healing' | 'recovery' | 'audit' | 'settings';

const TABS: { id: SelfHealingTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'healing', label: 'HEALING CENTER' },
  { id: 'recovery', label: 'RECOVERY CENTER™' },
  { id: 'audit', label: 'AUDIT LOG' },
  { id: 'settings', label: 'SETTINGS' },
];

const RISK_COLOR: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  restricted: '#EF4444',
};

const PRIORITY_COLOR: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export function SelfHealingEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SelfHealingTab>('overview');
  const [searchQuery, setSearchQuery] = useState('broken');
  const { profile, refresh } = useSelfHealingEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SELF-HEALING™ ENGINE LOADING — PROTECTING ORGANIZATIONAL RESILIENCE
      </p>
    );
  }

  const searchHits = querySelfHealingEngine(searchQuery, profile, 8);
  const pendingIssues = profile.issues.filter((i) => i.status === 'pending-approval');
  const autoRepaired = profile.repairs;

  const handleRefresh = () => {
    refreshSelfHealingEngine(profile.organizationId);
    refresh();
  };

  const handleModeChange = (mode: HealingMode) => {
    updateHealingMode(profile.organizationId, mode);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 150 · SELF-HEALING™ ENGINE · INTELLIGENT RESILIENCE"
        title={profile.companyName.toUpperCase()}
        subtitle="Safely correct low-risk issues automatically. Prepare complete recovery strategies for higher-risk situations — before anyone asks how to fix them."
        progressPct={profile.resilienceScore}
        stats={[
          { label: 'ISSUES', value: `${profile.issuesDetected}` },
          { label: 'AUTO-FIXED', value: `${profile.autoRepairsToday}` },
          { label: 'PENDING', value: `${profile.pendingApprovals}` },
          { label: 'RECOVERY', value: `${profile.recoveryPlansReady}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.resilienceScore} size={56} label="SH" accent={SELF_HEALING_ENGINE_ACCENT} />
        <div>
          {SELF_HEALING_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="RESILIENT OPERATING SYSTEM">
        <p className="text-[6px] font-futura" style={{ color: SELF_HEALING_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockSelfHealingLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="10 SELF-HEALING CATEGORIES">
        {Object.values(HEALING_CATEGORY_LABELS).slice(0, 6).map((label) => (
          <p key={label} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
          </p>
        ))}
        <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          + Duplicate records · Unused assets · Minor UI · Config drift · Dependencies
        </p>
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title={`ACTIVE MODE · ${HEALING_MODE_LABELS[profile.activeHealingMode].toUpperCase()}`}>
        {HEALING_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
            className="mr-1 mb-1 px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: profile.activeHealingMode === mode ? SELF_HEALING_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: profile.activeHealingMode === mode ? SELF_HEALING_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
            }}
          >
            {HEALING_MODE_LABELS[mode]}
          </button>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('healing')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: SELF_HEALING_ENGINE_ACCENT, color: SELF_HEALING_ENGINE_ACCENT }}>
        OPEN HEALING CENTER →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPredictiveQaPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PREDICTIVE QA →
      </button>
      <button type="button" onClick={() => navigate(adminStudioDecisionAuditPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DECISION AUDIT →
      </button>
    </ExecutivePageShell>
  );

  const renderHealing = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="HEALING CENTER — ISSUES & REPAIRS">
        {profile.issues.map((issue) => (
          <ExecutiveSecondaryCard key={issue.id} title={`${issue.title.toUpperCase()} · ${issue.confidencePct}% CONFIDENCE`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: SELF_HEALING_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {issue.description}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: RISK_COLOR[issue.riskLevel] }}>
              {issue.categoryLabel} · {issue.riskLevel} risk · {issue.status.replace(/-/g, ' ')}
              {issue.restrictedDomain ? ` · RESTRICTED: ${issue.restrictedDomain}` : ''}
            </p>
            <ExecutiveSecondaryCard title="ROOT CAUSE">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>{issue.rootCause}</p>
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Systems: {issue.systemsAffected.join(' · ')}
            </p>
            {issue.autoRepairEligible ? (
              <p className="text-[6px] font-futura mb-1" style={{ color: '#10B981' }}>✓ Eligible for automatic repair (low-risk)</p>
            ) : (
              <p className="text-[6px] font-futura mb-1" style={{ color: '#F59E0B' }}>⚠ Requires approval or recovery plan</p>
            )}
            {issue.status === 'pending-approval' ? (
              <div className="flex gap-1 mt-2">
                <button type="button" onClick={() => { approveRepair(profile.organizationId, issue.id); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: SELF_HEALING_ENGINE_ACCENT, color: SELF_HEALING_ENGINE_ACCENT }}>
                  APPROVE REPAIR
                </button>
                <button type="button" onClick={() => { dismissIssue(profile.organizationId, issue.id); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  DISMISS
                </button>
              </div>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      {autoRepaired.length > 0 ? (
        <ExecutiveFocusPanel title="COMPLETED REPAIRS">
          {autoRepaired.map((repair) => (
            <ExecutiveSecondaryCard key={repair.id} title={`REPAIR · ${repair.confidencePct}% CONFIDENCE`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                <strong>Detected:</strong> {repair.issueDetected}
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: SELF_HEALING_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
                <strong>Performed:</strong> {repair.repairPerformed}
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                <strong>Rollback:</strong> {repair.rollbackOption}
              </p>
              <button type="button" onClick={() => { rollbackRepair(profile.organizationId, repair.id); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                ROLLBACK
              </button>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      ) : null}
    </ExecutivePageShell>
  );

  const renderRecovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RECOVERY CENTER™ — STUDIO INTELLIGENCE™ RECOVERY PLANS">
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          When automatic repair isn&apos;t appropriate, Studio Intelligence™ prepares a complete Recovery Plan™ — problem summary, root cause, step-by-step repair, downtime estimate, business impact, and priority.
        </p>
        {profile.recoveryPlans.map((plan) => (
          <ExecutiveSecondaryCard key={plan.id} title={`${plan.problemSummary.toUpperCase().slice(0, 50)}…`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PRIORITY_COLOR[plan.recommendedPriority], fontWeight: 515 }}>
              {plan.recommendedPriority.toUpperCase()} PRIORITY · {plan.estimatedDowntime} downtime
            </p>
            <ExecutiveSecondaryCard title="ROOT CAUSE ANALYSIS">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>{plan.rootCauseAnalysis}</p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="STEP-BY-STEP REPAIR PLAN">
              {plan.stepByStepPlan.map((step, idx) => (
                <p key={step} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {idx + 1}. {step}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <strong>Business impact:</strong> {plan.businessImpact}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Systems: {plan.systemsAffected.join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      {pendingIssues.length > 0 ? (
        <ExecutiveFocusPanel title="AWAITING APPROVAL">
          {pendingIssues.map((issue) => (
            <p key={issue.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {issue.title} — {issue.riskLevel} risk
            </p>
          ))}
        </ExecutiveFocusPanel>
      ) : null}
    </ExecutivePageShell>
  );

  const renderAudit = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PERMANENT AUDIT LOG">
        {profile.auditLog.map((entry) => (
          <ExecutiveSecondaryCard key={entry.id} title={`${entry.eventType.toUpperCase()} · ${entry.title.slice(0, 40)}…`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {new Date(entry.timestamp).toLocaleString()} · {entry.confidencePct}% confidence
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: SELF_HEALING_ENGINE_ACCENT, lineHeight: 1.45 }}>
              {entry.summary}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Systems: {entry.systemsAffected.join(' · ')}
              {entry.rollbackAvailable ? ' · Rollback available' : ''}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSettings = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="HEALING MODE">
        {HEALING_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
            className="block w-full text-left mb-2 px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: profile.activeHealingMode === mode ? SELF_HEALING_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: profile.activeHealingMode === mode ? SELF_HEALING_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
            }}
          >
            {HEALING_MODE_LABELS[mode]}
          </button>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="AUTOMATION THRESHOLDS">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Auto-repair max risk: {profile.healingThresholds.autoRepairMaxRisk} · Min confidence: {profile.healingThresholds.autoRepairConfidenceMin}% · Max per day: {profile.healingThresholds.maxAutoRepairsPerDay}
        </p>
        <button
          type="button"
          onClick={() => {
            updateHealingThresholds(profile.organizationId, { autoRepairConfidenceMin: 90 });
            refresh();
          }}
          className="mr-1 px-2 py-1 text-[6px] font-futura uppercase border"
          style={{ borderColor: SELF_HEALING_ENGINE_ACCENT, color: SELF_HEALING_ENGINE_ACCENT }}
        >
          STRICT (90% MIN)
        </button>
        <button
          type="button"
          onClick={() => {
            updateHealingThresholds(profile.organizationId, { autoRepairConfidenceMin: 85, maxAutoRepairsPerDay: 12 });
            refresh();
          }}
          className="px-2 py-1 text-[6px] font-futura uppercase border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          DEFAULT
        </button>
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="REPAIR PRINCIPLES (ENFORCED)">
        {SELF_HEALING_ENGINE_PHILOSOPHY.slice(2).map((line) => (
          <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            · {line}
          </p>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: '#EF4444', lineHeight: 1.45 }}>
          Never auto-modify: legal · medical · financial · compliance workflows.
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="self-healing-engine" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? SELF_HEALING_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? SELF_HEALING_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: SELF_HEALING_ENGINE_ACCENT, color: SELF_HEALING_ENGINE_ACCENT }}>
          SYNC SELF-HEALING
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search issues, repairs, recovery plans…"
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
      {tab === 'healing' && renderHealing()}
      {tab === 'recovery' && renderRecovery()}
      {tab === 'audit' && renderAudit()}
      {tab === 'settings' && renderSettings()}
    </div>
  );
}
