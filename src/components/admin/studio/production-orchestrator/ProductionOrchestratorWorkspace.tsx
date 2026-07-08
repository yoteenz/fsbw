import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductionOrchestratorState } from '../../../../hooks/useProductionOrchestratorState';
import {
  PRODUCTION_MODEL_LABELS,
  PRODUCTION_ORCHESTRATOR_ACCENT,
  PRODUCTION_ORCHESTRATOR_STAGE_LABELS,
  PRODUCTION_ORCHESTRATOR_STAGES,
  PRODUCTION_PIPELINE_ORDER,
  type ProductionBoardTask,
  type ProductionOrchestratorStage,
} from '../../../../studio-os-core/production-orchestrator';
import {
  adminStudioDecisionAuditPath,
  adminStudioKnowledgeRegistryPath,
  adminStudioModelOrchestratorPath,
  adminStudioPromptRegistryPath,
  adminStudioWorkflowEnginePath,
} from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type PackageTab = 'architecture' | 'composer' | 'assets' | 'motion' | 'testing' | 'knowledge' | 'adr' | 'integration';

const PACKAGE_TABS: { id: PackageTab; label: string }[] = [
  { id: 'architecture', label: 'ARCHITECTURE' },
  { id: 'composer', label: 'COMPOSER' },
  { id: 'assets', label: 'ASSETS' },
  { id: 'motion', label: 'MOTION' },
  { id: 'testing', label: 'TESTING' },
  { id: 'knowledge', label: 'KNOWLEDGE' },
  { id: 'adr', label: 'ADR' },
  { id: 'integration', label: 'INTEGRATION' },
];

const emptyForm = {
  featureName: '',
  founderIntent: '',
  dependencies: '',
  requiresAssets: true,
  requiresMotion: true,
  autoApprovalAllowed: false,
};

const cardStyle = {
  border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
  background: 'rgba(10, 10, 12, 0.82)',
  boxShadow: '0 18px 42px rgba(0, 0, 0, 0.28)',
};

const labelStyle = {
  color: ADMIN_STUDIO_THEME.textSecondary,
  letterSpacing: '0.16em',
  fontWeight: 515,
};

function splitDependencies(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function canComposerStart(task: ProductionBoardTask): boolean {
  return task.gate.architectureComplete && task.gate.dependenciesResolved && (task.gate.founderApproval || task.gate.autoApprovalAllowed);
}

function StageColumn({
  stage,
  tasks,
  activeTaskId,
  onSelect,
}: {
  stage: ProductionOrchestratorStage;
  tasks: ProductionBoardTask[];
  activeTaskId: string;
  onSelect: (taskId: string) => void;
}) {
  return (
    <div className="min-w-[190px] rounded-xl p-2" style={cardStyle}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[6px] font-futura uppercase" style={{ ...labelStyle, color: PRODUCTION_ORCHESTRATOR_ACCENT }}>
          {PRODUCTION_ORCHESTRATOR_STAGE_LABELS[stage]}
        </p>
        <span className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            EMPTY
          </p>
        )}
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onSelect(task.id)}
            className="w-full text-left rounded-lg p-2 border"
            style={{
              borderColor: activeTaskId === task.id ? PRODUCTION_ORCHESTRATOR_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              background: activeTaskId === task.id ? 'rgba(168, 85, 247, 0.13)' : 'rgba(255, 255, 255, 0.035)',
            }}
          >
            <p className="text-[7px] font-futura uppercase mb-1" style={{ color: ADMIN_STUDIO_THEME.textPrimary, fontWeight: 515 }}>
              {task.featureName}
            </p>
            <p className="text-[6px] font-futura uppercase mb-1" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT }}>
              {PRODUCTION_MODEL_LABELS[task.assignedModel]} · {task.status}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.35 }}>
              {task.nextRequiredAction}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function PromptBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl p-3 border" style={cardStyle}>
      <p className="text-[6px] font-futura uppercase mb-2" style={{ ...labelStyle, color: PRODUCTION_ORCHESTRATOR_ACCENT }}>
        {title}
      </p>
      <pre className="text-[6px] font-futura whitespace-pre-wrap" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
        {value || 'Pending.'}
      </pre>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <ExecutiveSecondaryCard title={title}>
      {items.length === 0 ? (
        <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          NOT REQUIRED FOR THIS TASK
        </p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              - {item}
            </li>
          ))}
        </ul>
      )}
    </ExecutiveSecondaryCard>
  );
}

export function ProductionOrchestratorWorkspace() {
  const {
    profile,
    refresh,
    createTask,
    markArchitectureRunning,
    saveArchitectureOutput,
    setDependenciesResolved,
    approveProductionHandoff,
    startComposerImplementation,
    completeImplementation,
    advanceMediaQueue,
    approveProductionTask,
  } = useProductionOrchestratorState();
  const [form, setForm] = useState(emptyForm);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [architectureDraft, setArchitectureDraft] = useState('');
  const [implementationDraft, setImplementationDraft] = useState('');
  const [packageTab, setPackageTab] = useState<PackageTab>('architecture');

  const activeTask = useMemo(() => {
    if (!profile) return null;
    return (
      profile.tasks.find((task) => task.id === selectedTaskId) ??
      profile.tasks.find((task) => task.id === profile.activeTaskId) ??
      profile.tasks[0] ??
      null
    );
  }, [profile, selectedTaskId]);

  const groupedTasks = useMemo(() => {
    const groups = new Map<ProductionOrchestratorStage, ProductionBoardTask[]>();
    PRODUCTION_ORCHESTRATOR_STAGES.forEach((stage) => groups.set(stage, []));
    profile?.tasks.forEach((task) => {
      groups.get(task.currentStage)?.push(task);
    });
    return groups;
  }, [profile]);

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
        STUDIO PRODUCTION ORCHESTRATOR™ LOADING — MODEL HANDOFFS · PACKAGE GENERATION · REVIEW QUEUE
      </p>
    );
  }

  const submitIdea = () => {
    if (!form.featureName.trim() || !form.founderIntent.trim()) return;
    const next = createTask({
      featureName: form.featureName,
      founderIntent: form.founderIntent,
      dependencies: splitDependencies(form.dependencies),
      requiresAssets: form.requiresAssets,
      requiresMotion: form.requiresMotion,
      autoApprovalAllowed: form.autoApprovalAllowed,
    });
    setSelectedTaskId(next.activeTaskId);
    setArchitectureDraft('');
    setImplementationDraft('');
    setForm(emptyForm);
  };

  const renderPackage = (task: ProductionBoardTask) => {
    if (packageTab === 'architecture') {
      return (
        <div className="grid gap-3 lg:grid-cols-2">
          <PromptBlock title="Architecture Prompt Queue™" value={task.productionPackage.architecturePrompt} />
          <PromptBlock title="GPT Architecture Output™" value={task.productionPackage.architectureOutput} />
        </div>
      );
    }
    if (packageTab === 'composer') return <PromptBlock title="Composer Implementation Queue™" value={task.productionPackage.composerPrompt} />;
    if (packageTab === 'assets') return <ListBlock title="Asset Generation Queue™ · OpenArt/FAL" items={task.productionPackage.assetPrompts} />;
    if (packageTab === 'motion') return <ListBlock title="Motion Queue™ · Kling" items={task.productionPackage.motionPrompts} />;
    if (packageTab === 'testing') return <ListBlock title="Testing Checklist" items={task.productionPackage.testingChecklist} />;
    if (packageTab === 'knowledge') return <ListBlock title="Knowledge Core Updates" items={task.productionPackage.knowledgeCoreUpdates} />;
    if (packageTab === 'adr') return <ListBlock title="ADR Updates" items={task.productionPackage.adrUpdates} />;
    return <ListBlock title="Integration Checklist" items={task.productionPackage.integrationChecklist} />;
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="production-orchestrator" className="mb-2" />

      <ExecutivePageShell>
        <ExecutiveHeroCard
          eyebrow="STUDIO PRODUCTION ORCHESTRATOR™ · MULTI-MODEL HANDOFFS"
          title="PRODUCTION BOARD™"
          subtitle="Submit Founder Intent™ once. The board routes architecture, implementation, visual assets, motion, review, Knowledge Core, and ADR updates without manual copy/paste."
          progressPct={Math.min(100, 68 + profile.approvedCount * 6 + profile.implementationReadyCount * 4)}
          stats={[
            { label: 'ARCH QUEUE', value: `${profile.architectureQueuedCount}` },
            { label: 'READY', value: `${profile.implementationReadyCount}` },
            { label: 'BLOCKED', value: `${profile.blockedCount}` },
            { label: 'REVIEW', value: `${profile.reviewNeededCount}` },
          ]}
        />

        <ExecutiveSecondaryCard title="COMMAND DOCK · NEXT REQUIRED ACTION">
          <p className="text-[6px] font-futura mb-2" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
            {profile.dockLine}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              [adminStudioModelOrchestratorPath(), 'MODEL ORCHESTRATOR'],
              [adminStudioWorkflowEnginePath(), 'WORKFLOW ENGINE'],
              [adminStudioPromptRegistryPath(), 'PROMPT REGISTRY'],
              [adminStudioKnowledgeRegistryPath(), 'KNOWLEDGE REGISTRY'],
              [adminStudioDecisionAuditPath(), 'DECISION AUDIT'],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="text-[6px] font-futura uppercase border px-2 py-1" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {label} →
              </Link>
            ))}
            <button
              type="button"
              onClick={refresh}
              className="text-[6px] font-futura uppercase border px-2 py-1"
              style={{ borderColor: PRODUCTION_ORCHESTRATOR_ACCENT, color: PRODUCTION_ORCHESTRATOR_ACCENT }}
            >
              REFRESH BOARD
            </button>
          </div>
        </ExecutiveSecondaryCard>
      </ExecutivePageShell>

      <div className="grid gap-3 mb-3 lg:grid-cols-[minmax(240px,0.72fr)_minmax(0,1.28fr)]">
        <div className="rounded-xl p-3" style={cardStyle}>
          <p className="text-[7px] font-futura uppercase mb-2" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT, fontWeight: 515 }}>
            Founder Intent™ Intake
          </p>
          <label className="block text-[6px] font-futura uppercase mb-1" style={labelStyle}>
            Feature name
          </label>
          <input
            value={form.featureName}
            onChange={(event) => setForm((current) => ({ ...current, featureName: event.target.value }))}
            className="w-full rounded-lg border px-2 py-2 text-[7px] font-futura mb-2 bg-transparent"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
            placeholder="Studio World feature name"
          />
          <label className="block text-[6px] font-futura uppercase mb-1" style={labelStyle}>
            Founder Intent™
          </label>
          <textarea
            value={form.founderIntent}
            onChange={(event) => setForm((current) => ({ ...current, founderIntent: event.target.value }))}
            className="w-full min-h-[104px] rounded-lg border px-2 py-2 text-[7px] font-futura mb-2 bg-transparent"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
            placeholder="Describe the idea once. The system creates the architecture and production package."
          />
          <label className="block text-[6px] font-futura uppercase mb-1" style={labelStyle}>
            Dependencies (comma separated)
          </label>
          <input
            value={form.dependencies}
            onChange={(event) => setForm((current) => ({ ...current, dependencies: event.target.value }))}
            className="w-full rounded-lg border px-2 py-2 text-[7px] font-futura mb-2 bg-transparent"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
            placeholder="Knowledge Registry, Decision Audit"
          />
          <div className="grid grid-cols-1 gap-2 mb-3 sm:grid-cols-3">
            {[
              ['requiresAssets', 'Assets Needed'],
              ['requiresMotion', 'Motion Needed'],
              ['autoApprovalAllowed', 'Auto-approval'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                <input
                  type="checkbox"
                  checked={Boolean(form[key as keyof typeof form])}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))}
                />
                {label}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={submitIdea}
            className="w-full rounded-lg border px-3 py-2 text-[7px] font-futura uppercase"
            style={{ borderColor: PRODUCTION_ORCHESTRATOR_ACCENT, color: PRODUCTION_ORCHESTRATOR_ACCENT, fontWeight: 515 }}
          >
            Submit Idea Once → Queue Architecture
          </button>
        </div>

        <div className="rounded-xl p-3" style={cardStyle}>
          <p className="text-[7px] font-futura uppercase mb-2" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT, fontWeight: 515 }}>
            Production Pipeline
          </p>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {PRODUCTION_PIPELINE_ORDER.map((step, index) => (
              <div key={step} className="rounded-lg border p-2" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[6px] font-futura uppercase mb-1" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT }}>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.35 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 mb-3">
        <div className="flex gap-3 min-w-max">
          {PRODUCTION_ORCHESTRATOR_STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              tasks={groupedTasks.get(stage) ?? []}
              activeTaskId={activeTask?.id ?? ''}
              onSelect={setSelectedTaskId}
            />
          ))}
        </div>
      </div>

      {activeTask && (
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
          <ExecutiveFocusPanel title={`ACTIVE TASK · ${activeTask.featureName.toUpperCase()}`}>
            <ExecutiveSecondaryCard title="TRACKING FIELDS">
              {[
                ['Current stage', PRODUCTION_ORCHESTRATOR_STAGE_LABELS[activeTask.currentStage]],
                ['Assigned model', PRODUCTION_MODEL_LABELS[activeTask.assignedModel]],
                ['Status', activeTask.status],
                ['Review state', activeTask.reviewState],
                ['Dependencies', activeTask.dependencies.length ? activeTask.dependencies.join(', ') : 'None'],
                ['Next action', activeTask.nextRequiredAction],
              ].map(([label, value]) => (
                <p key={label} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  <span style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT }}>{label}:</span> {value}
                </p>
              ))}
            </ExecutiveSecondaryCard>

            <ExecutiveSecondaryCard title="AUTOMATION GATE">
              {[
                ['Architecture Complete', activeTask.gate.architectureComplete],
                ['Dependencies Resolved', activeTask.gate.dependenciesResolved],
                ['Founder Approval', activeTask.gate.founderApproval],
                ['Auto-approval Allowed', activeTask.gate.autoApprovalAllowed],
              ].map(([label, value]) => (
                <p key={String(label)} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  <span style={{ color: value ? PRODUCTION_ORCHESTRATOR_ACCENT : '#EF4444' }}>{value ? 'PASS' : 'WAIT'}</span> · {label}
                </p>
              ))}
              <p className="text-[6px] font-futura mt-2" style={{ color: canComposerStart(activeTask) ? PRODUCTION_ORCHESTRATOR_ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
                Composer start rule: {canComposerStart(activeTask) ? 'UNLOCKED' : 'LOCKED'}
              </p>
            </ExecutiveSecondaryCard>

            {activeTask.blockingIssues.length > 0 && <ListBlock title="Blocking Issues" items={activeTask.blockingIssues} />}

            <div className="rounded-xl p-3 border" style={cardStyle}>
              <p className="text-[6px] font-futura uppercase mb-2" style={{ ...labelStyle, color: PRODUCTION_ORCHESTRATOR_ACCENT }}>
                Actions
              </p>
              <div className="grid gap-2">
                <button type="button" onClick={() => markArchitectureRunning(activeTask.id)} className="border px-2 py-2 text-[6px] font-futura uppercase" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Start GPT Architecture
                </button>
                <button type="button" onClick={() => setDependenciesResolved(activeTask.id, !activeTask.gate.dependenciesResolved)} className="border px-2 py-2 text-[6px] font-futura uppercase" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {activeTask.gate.dependenciesResolved ? 'Mark Dependencies Unresolved' : 'Resolve Dependencies'}
                </button>
                <button type="button" onClick={() => approveProductionHandoff(activeTask.id)} className="border px-2 py-2 text-[6px] font-futura uppercase" style={{ borderColor: PRODUCTION_ORCHESTRATOR_ACCENT, color: PRODUCTION_ORCHESTRATOR_ACCENT }}>
                  Founder Approves Composer
                </button>
                <button type="button" onClick={() => startComposerImplementation(activeTask.id)} className="border px-2 py-2 text-[6px] font-futura uppercase" style={{ borderColor: canComposerStart(activeTask) ? PRODUCTION_ORCHESTRATOR_ACCENT : '#EF4444', color: canComposerStart(activeTask) ? PRODUCTION_ORCHESTRATOR_ACCENT : '#EF4444' }}>
                  Start Composer Implementation
                </button>
                <button type="button" onClick={() => advanceMediaQueue(activeTask.id)} className="border px-2 py-2 text-[6px] font-futura uppercase" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Advance Asset / Motion Queue
                </button>
                <button type="button" onClick={() => approveProductionTask(activeTask.id)} className="border px-2 py-2 text-[6px] font-futura uppercase" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Approve Production
                </button>
              </div>
            </div>
          </ExecutiveFocusPanel>

          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-3" style={cardStyle}>
              <p className="text-[7px] font-futura uppercase mb-2" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT, fontWeight: 515 }}>
                Architecture Completion Detection™
              </p>
              <textarea
                value={architectureDraft}
                onChange={(event) => setArchitectureDraft(event.target.value)}
                className="w-full min-h-[120px] rounded-lg border px-2 py-2 text-[7px] font-futura mb-2 bg-transparent"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
                placeholder="Paste/sync GPT-5.5 architecture output here. Incomplete output blocks Composer automatically."
              />
              <button
                type="button"
                onClick={() => {
                  saveArchitectureOutput(activeTask.id, architectureDraft);
                  setArchitectureDraft('');
                }}
                className="rounded-lg border px-3 py-2 text-[7px] font-futura uppercase"
                style={{ borderColor: PRODUCTION_ORCHESTRATOR_ACCENT, color: PRODUCTION_ORCHESTRATOR_ACCENT, fontWeight: 515 }}
              >
                Save GPT Output → Generate Composer Handoff
              </button>
            </div>

            <div className="rounded-xl p-3" style={cardStyle}>
              <p className="text-[7px] font-futura uppercase mb-2" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT, fontWeight: 515 }}>
                Composer Output Capture
              </p>
              <textarea
                value={implementationDraft}
                onChange={(event) => setImplementationDraft(event.target.value)}
                className="w-full min-h-[90px] rounded-lg border px-2 py-2 text-[7px] font-futura mb-2 bg-transparent"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
                placeholder="Capture Composer implementation output, then route to assets, motion, or review."
              />
              <button
                type="button"
                onClick={() => {
                  completeImplementation(activeTask.id, implementationDraft);
                  setImplementationDraft('');
                }}
                className="rounded-lg border px-3 py-2 text-[7px] font-futura uppercase"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
              >
                Complete Implementation → Route Next Queue
              </button>
            </div>

            <div className="rounded-xl p-3" style={cardStyle}>
              <div className="flex flex-wrap gap-1 mb-3">
                {PACKAGE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPackageTab(tab.id)}
                    className="px-2 py-1 text-[6px] font-futura uppercase border"
                    style={{
                      borderColor: packageTab === tab.id ? PRODUCTION_ORCHESTRATOR_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                      color: packageTab === tab.id ? PRODUCTION_ORCHESTRATOR_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
                      fontWeight: packageTab === tab.id ? 515 : 400,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {renderPackage(activeTask)}
            </div>

            <ListBlock title="Handoff Log" items={activeTask.handoffLog} />
          </div>
        </div>
      )}
    </div>
  );
}
