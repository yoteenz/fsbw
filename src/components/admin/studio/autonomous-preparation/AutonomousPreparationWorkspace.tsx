import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutonomousPreparationState } from '../../../../hooks/useAutonomousPreparationState';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  applyPreparationAction,
  APPROVAL_ACTION_LABELS,
  AUTONOMOUS_PREPARATION_PHILOSOPHY,
  PREPARATION_TYPE_LABELS,
} from '../../../../studio-os-core/autonomous-preparation';
import type { ApprovalAction } from '../../../../studio-os-core/autonomous-preparation';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type PreparationTab = 'overview' | 'queue' | 'workflow' | 'learning';

const TABS: { id: PreparationTab; label: string }[] = [
  { id: 'overview', label: 'PREPARATION OVERVIEW' },
  { id: 'queue', label: 'PENDING QUEUE' },
  { id: 'workflow', label: 'APPROVAL WORKFLOW' },
  { id: 'learning', label: 'LEARNING LOOP' },
];

const ACCENT = '#0891B2';

function statusColor(status: string): string {
  if (status === 'pending') return ACCENT;
  if (status === 'approved' || status === 'edited') return '#0D9488';
  if (status === 'rejected') return '#EB1C24';
  return ADMIN_STUDIO_THEME.textSecondary;
}

export function AutonomousPreparationWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PreparationTab>('overview');
  const { profile, refresh } = useAutonomousPreparationState();
  const { workspaceId } = useWorkspace();

  const handleAction = (prepId: string, action: ApprovalAction) => {
    applyPreparationAction(workspaceId, prepId, action);
    refresh();
  };

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AUTONOMOUS PREPARATION™ LOADING — QUIETLY PREPARING WORK
      </p>
    );
  }

  const pending = profile.pendingPreparations.filter((p) => p.status === 'pending');

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 114 · AUTONOMOUS PREPARATION™"
        title={profile.companyName.toUpperCase()}
        subtitle="One step ahead — prepared quietly, always awaiting approval."
        progressPct={profile.preparationScore}
        stats={[
          { label: 'SCORE', value: `${profile.preparationScore}%` },
          { label: 'QUEUE', value: String(profile.pendingQueueCount) },
          { label: 'AWAITING', value: String(profile.awaitingApprovalCount) },
          { label: 'QUALITY', value: `${profile.learningLoop.qualityImprovementPct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.preparationScore} size={56} label="READY" accent={ACCENT} />
        <div>
          {AUTONOMOUS_PREPARATION_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK PREPARATION">
        <p className="text-[6px] font-futura" style={{ color: ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockPreparationLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="NOTHING AUTO-EXECUTES">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Approve · Edit · Reject · Schedule · Delegate · Archive — every preparation inactive until you decide.
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
        REFRESH QUEUE
      </button>
    </ExecutivePageShell>
  );

  const renderQueue = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PENDING PREPARATION QUEUE · INACTIVE UNTIL APPROVED">
        {profile.pendingPreparations.map((prep) => (
          <ExecutiveSecondaryCard
            key={prep.id}
            title={`${PREPARATION_TYPE_LABELS[prep.type].toUpperCase()} · ${prep.title.toUpperCase()}`}
          >
            <p className="text-[6px] font-futura mb-1" style={{ color: statusColor(prep.status) }}>
              {prep.status.toUpperCase()} · {prep.confidencePct}% CONFIDENCE
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {prep.summary}
            </p>
            {prep.status === 'pending' ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {prep.availableActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => handleAction(prep.id, action)}
                    className="px-1 py-0.5 text-[5px] font-futura uppercase border"
                    style={{ borderColor: ACCENT, color: ACCENT }}
                  >
                    {APPROVAL_ACTION_LABELS[action]}
                  </button>
                ))}
              </div>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderWorkflow = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="APPROVAL WORKFLOW · WHY · TRIGGER · BENEFIT · CONFIDENCE">
        {(pending.length ? pending : profile.pendingPreparations.slice(0, 4)).map((prep) => (
          <ExecutiveSecondaryCard key={prep.id} title={prep.title.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
              WHY: {prep.whyPrepared}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              TRIGGER: {prep.trigger}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              BENEFIT: {prep.expectedBenefit}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
              CONFIDENCE {prep.confidencePct}% · ACTIONS: {prep.availableActions.map((a) => APPROVAL_ACTION_LABELS[a]).join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderLearning = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="LEARNING LOOP · QUALITY IMPROVES WITH EVERY DECISION">
        <ExecutiveSecondaryCard title="APPROVAL PATTERNS">
          <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
            APPROVAL RATE {profile.learningLoop.approvalRatePct}% · QUALITY +{profile.learningLoop.qualityImprovementPct}%
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {profile.learningLoop.approvalsLogged} approved · {profile.learningLoop.rejectionsLogged} rejected
          </p>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
            {profile.learningLoop.professionBrainLearning}
          </p>
        </ExecutiveSecondaryCard>
        {profile.learningLoop.frequentlyApprovedTypes.length > 0 ? (
          <ExecutiveSecondaryCard title="FREQUENTLY APPROVED">
            <p className="text-[6px] font-futura" style={{ color: '#0D9488' }}>
              {profile.learningLoop.frequentlyApprovedTypes.map((t) => PREPARATION_TYPE_LABELS[t]).join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ) : null}
        {profile.learningLoop.frequentlyRejectedTypes.length > 0 ? (
          <ExecutiveSecondaryCard title="LEARNING FROM REJECTIONS">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {profile.learningLoop.frequentlyRejectedTypes.map((t) => PREPARATION_TYPE_LABELS[t]).join(' · ')} — fed to Profession Brain™
            </p>
          </ExecutiveSecondaryCard>
        ) : null}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="autonomous-preparation" className="mb-2" />
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
      {tab === 'queue' && renderQueue()}
      {tab === 'workflow' && renderWorkflow()}
      {tab === 'learning' && renderLearning()}
    </div>
  );
}
