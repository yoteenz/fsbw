import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioSingleSelect } from '../../../../components/admin/studio/AdminStudioSingleSelect';
import { AdminStudioChipSelect } from '../../../../components/admin/studio/AdminStudioChipSelect';
import { AdminStudioCreativeBriefing } from '../../../../components/admin/studio/AdminStudioCreativeBriefing';
import {
  AdminStudioCreativeWidget,
  AdminStudioCreativeScoreRing,
  AdminStudioCreativeBarScore,
} from '../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioCreativeDirector } from '../../../../hooks/useAdminStudioCreativeDirectorState';
import {
  ADMIN_STUDIO_CREATIVE_DIRECTOR_SUBTITLE,
  CREATIVE_DIRECTOR_TABS,
  CONTENT_PURPOSE_OPTIONS,
  CREATIVE_OUTPUT_DEFINITIONS,
  BRAND_DIMENSION_LABELS,
  CONTENT_SCORE_LABELS,
  BRAND_ALIGNMENT_THRESHOLD,
  CREATIVE_TIMELINE_STEPS,
  CONTENT_OPPORTUNITIES_DEMO,
  REWARD_OPTIONS,
  MEMBERSHIP_TIER_OPTIONS,
  EDITOR_REVIEW_ACTIONS,
  type CreativeOutputId,
  type OutputTier,
} from '../../../../utils/adminStudioCreativeDirectorDemo';
import { ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS } from '../../../../utils/adminStudioContentBrainShowBibleDemo';
import { ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS, ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS } from '../../../../utils/adminStudioContentBrainCatalogDemo';
import { ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS } from '../../../../utils/adminStudioContentBrainPromptFrameworksDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import type { EditorReviewAction } from '../../../../services/studio/creativeDirector/index';
import { BlueprintAuthorCreativeDirectorGate } from '../../../../components/admin/studio/blueprint-author-ui';

export default function AdminStudioCreativeDirectorPage() {
  const navigate = useNavigate();
  const [blueprintGateOpen, setBlueprintGateOpen] = useState(false);
  const {
    session,
    pkg,
    activeTab,
    setActiveTab,
    updateSession,
    setTopic,
    applyShowRecommendation,
    overrideShow,
    toggleDistribution,
    setOutputTier,
    runEditorAction,
    applyBriefingSuggestions,
    masterPromptExpanded,
    setMasterPromptExpanded,
  } = useAdminStudioCreativeDirector();

  const show = ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === session.selectedShowId);
  const cta = ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS.find((c) => c.id === session.primaryCtaId);
  const activeOutputs = CREATIVE_OUTPUT_DEFINITIONS.filter(
    (o) => session.outputs[o.id] === 'required' || session.outputs[o.id] === 'recommended'
  ).map((o) => o.label);

  const activeDist = pkg.distribution.filter((d) => d.enabled && d.activation === 'ACTIVE').map((d) => d.label);

  return (
    <AdminStudioStageShell
      title="CREATIVE DIRECTOR"
      subtitle={ADMIN_STUDIO_CREATIVE_DIRECTOR_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <AdminStudioCreativeBriefing onApplySuggestions={applyBriefingSuggestions} />

      <AdminStudioTabBar tabs={CREATIVE_DIRECTOR_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' ? (
        <div className="space-y-3 mt-3">
          <AdminStudioSectionHeading>EXECUTIVE DASHBOARD</AdminStudioSectionHeading>
          <div className="grid grid-cols-2 gap-2">
            <AdminStudioCreativeWidget label="CURRENT TOPIC" value={session.topic} large className="col-span-2" />
            <AdminStudioCreativeWidget label="SELECTED SHOW" value={show?.name ?? '—'} subvalue={show?.publishingSchedule} />
            <AdminStudioCreativeWidget label="CAMPAIGN GOAL" value={session.campaignGoal} />
            <AdminStudioCreativeWidget label="TARGET AUDIENCE" value={session.targetAudience} />
            <AdminStudioCreativeWidget label="MEMBERSHIP TIER" value={session.membershipTier} />
            <AdminStudioCreativeWidget label="PRIMARY CTA" value={cta?.title ?? '—'} accentHex={ADMIN_STUDIO_THEME.accent} />
            <AdminStudioCreativeWidget
              label="BRAND ALIGNMENT"
              value={`${pkg.brandAlignment.overallScore}%`}
              subvalue={pkg.brandAlignment.passesThreshold ? 'ON BRAND' : 'NEEDS IMPROVEMENT'}
              accentHex={pkg.brandAlignment.passesThreshold ? '#16A34A' : '#CA8A04'}
            />
            <AdminStudioCreativeWidget
              label="CONTENT SCORE"
              value={`${pkg.contentScore.overallScore}%`}
              subvalue="OVERALL PRODUCTION VALUE"
            />
            <AdminStudioCreativeWidget label="PUBLISHING STATUS" value={session.publishingStatus} className="col-span-2" />
          </div>
          <div
            className="p-2.5"
            style={{ background: ADMIN_STUDIO_THEME.panelBg, border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}` }}
          >
            <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              RECOMMENDED OUTPUTS
            </p>
            <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.45 }}>
              {activeOutputs.join(' · ') || 'NONE SELECTED'}
            </p>
          </div>
          <div
            className="p-2.5"
            style={{ background: ADMIN_STUDIO_THEME.panelBg, border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}` }}
          >
            <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              DISTRIBUTION TARGETS
            </p>
            <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.45 }}>
              {activeDist.join(' · ') || 'NONE ACTIVE'}
            </p>
          </div>
          <FlowDiagram />
        </div>
      ) : null}

      {activeTab === 'decide' ? (
        <div className="space-y-4 mt-3">
          <AdminStudioSectionHeading>DECISION ENGINE</AdminStudioSectionHeading>
          <AdminStudioEditableField label="MASTER TOPIC" value={session.topic} onChange={setTopic} multiline />

          <DecisionRow label="CONTENT PURPOSE">
            <AdminStudioSingleSelect
              label=""
              value={session.contentPurpose}
              options={CONTENT_PURPOSE_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
              onChange={(v) => updateSession({ contentPurpose: v as typeof session.contentPurpose })}
            />
          </DecisionRow>

          <ShowRecommenderPanel
            recommendation={pkg.recommendation.show}
            selectedShowId={session.selectedShowId}
            onApply={applyShowRecommendation}
            onOverride={overrideShow}
          />

          <DecisionRow label="PRIMARY CTA">
            <AdminStudioSingleSelect
              label=""
              value={session.primaryCtaId}
              options={ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS.map((c) => ({ value: c.id, label: c.title }))}
              onChange={(v) => updateSession({ primaryCtaId: v })}
            />
          </DecisionRow>

          <AdminStudioChipSelect
            label="FEATURED PRODUCTS"
            options={ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS.map((p) => p.name)}
            selected={session.featuredProductIds.map(
              (id) => ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS.find((p) => p.id === id)?.name ?? id
            )}
            onToggle={(name) => {
              const product = ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS.find((p) => p.name === name);
              if (!product) return;
              const has = session.featuredProductIds.includes(product.id);
              updateSession({
                featuredProductIds: has
                  ? session.featuredProductIds.filter((id) => id !== product.id)
                  : [...session.featuredProductIds, product.id],
              });
            }}
          />

          <DecisionRow label="REWARDS">
            <AdminStudioSingleSelect
              label=""
              value={session.rewardId}
              options={REWARD_OPTIONS.map((r) => ({ value: r.id, label: r.label }))}
              onChange={(v) => updateSession({ rewardId: v })}
            />
          </DecisionRow>

          <DecisionRow label="MEMBERSHIP TIER">
            <AdminStudioSingleSelect
              label=""
              value={session.membershipTier}
              options={MEMBERSHIP_TIER_OPTIONS.map((m) => ({ value: m, label: m }))}
              onChange={(v) => updateSession({ membershipTier: v })}
            />
          </DecisionRow>

          <AdminStudioEditableField
            label="ENVIRONMENT"
            value={session.environment}
            onChange={(v) => updateSession({ environment: v })}
            multiline
          />
          <DecisionRow label="PROMPT FRAMEWORK">
            <AdminStudioSingleSelect
              label=""
              value={session.promptFrameworkId}
              options={ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS.map((p) => ({ value: p.id, label: p.title }))}
              onChange={(v) => updateSession({ promptFrameworkId: v })}
            />
          </DecisionRow>
          <AdminStudioEditableField
            label="VISUAL LANGUAGE"
            value={session.visualLanguage}
            onChange={(v) => updateSession({ visualLanguage: v })}
            multiline
          />

          <AdminStudioSectionHeading>QUALITY GATE</AdminStudioSectionHeading>
          <QualityGatePanel gate={pkg.qualityGate} canGenerate={pkg.qualityGate.canGenerate} />
        </div>
      ) : null}

      {activeTab === 'validate' ? (
        <div className="space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <AdminStudioCreativeScoreRing
              label="BRAND ALIGNMENT"
              score={pkg.brandAlignment.overallScore}
              threshold={BRAND_ALIGNMENT_THRESHOLD}
            />
            <AdminStudioCreativeScoreRing label="CONTENT SCORE" score={pkg.contentScore.overallScore} />
          </div>

          {pkg.brandAlignment.improvements.length > 0 ? (
            <div
              className="p-2.5"
              style={{ background: 'rgba(202,138,4,0.08)', border: '1px solid rgba(202,138,4,0.3)' }}
            >
              <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: '#CA8A04' }}>
                RECOMMENDED IMPROVEMENTS
              </p>
              {pkg.brandAlignment.improvements.map((tip) => (
                <p key={tip} className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                  • {tip}
                </p>
              ))}
            </div>
          ) : null}

          <AdminStudioSectionHeading>BRAND DIMENSIONS</AdminStudioSectionHeading>
          <div className="space-y-2">
            {(Object.keys(BRAND_DIMENSION_LABELS) as Array<keyof typeof BRAND_DIMENSION_LABELS>).map((key) => (
              <AdminStudioCreativeBarScore
                key={key}
                label={BRAND_DIMENSION_LABELS[key]}
                score={pkg.brandAlignment.dimensions[key]}
              />
            ))}
          </div>

          <AdminStudioSectionHeading>CONTENT SCORECARDS</AdminStudioSectionHeading>
          <div className="space-y-2">
            {(Object.keys(CONTENT_SCORE_LABELS) as Array<keyof typeof CONTENT_SCORE_LABELS>).map((key) => (
              <AdminStudioCreativeBarScore key={key} label={CONTENT_SCORE_LABELS[key]} score={pkg.contentScore.scores[key]} />
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'strategy' ? (
        <div className="space-y-4 mt-3">
          <AdminStudioSectionHeading>OUTPUT STRATEGIST</AdminStudioSectionHeading>
          <OutputStrategistPanel outputs={session.outputs} onSetTier={setOutputTier} />

          <AdminStudioSectionHeading>DISTRIBUTION STRATEGIST</AdminStudioSectionHeading>
          <div className="space-y-1.5">
            {pkg.distribution.map((ch) => (
              <button
                key={ch.channelId}
                type="button"
                disabled={ch.activation === 'COMING_SOON'}
                onClick={() => ch.activation === 'ACTIVE' && toggleDistribution(ch.channelId)}
                className="w-full flex items-center justify-between px-3 py-2 border text-left"
                style={{
                  opacity: ch.activation === 'COMING_SOON' ? 0.5 : 1,
                  background: ch.enabled ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg,
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                <div>
                  <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                    {ch.label}
                  </p>
                  <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {ch.engagementEstimate}
                  </p>
                </div>
                <span className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ch.activation === 'COMING_SOON' ? '#808080' : ch.enabled ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary }}>
                  {ch.activation === 'COMING_SOON' ? 'COMING SOON' : ch.enabled ? 'ACTIVE' : 'OFF'}
                </span>
              </button>
            ))}
          </div>

          <AdminStudioSectionHeading>PROMPT ASSEMBLER</AdminStudioSectionHeading>
          <div className="flex flex-col items-center gap-0">
            {pkg.promptAssembly.stages.map((stage, i) => (
              <div key={stage.id} className="w-full flex flex-col items-center">
                {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
                <div
                  className="w-full px-3 py-2 border"
                  style={{
                    background: stage.id === 'master-prompt' ? 'rgba(235,28,36,0.06)' : 'rgba(255,255,255,0.7)',
                    borderColor: ADMIN_STUDIO_THEME.panelBorder,
                  }}
                >
                  <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {stage.label}
                  </p>
                  <p className="text-[7px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {stage.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMasterPromptExpanded(!masterPromptExpanded)}
            className="w-full py-2 text-[8px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            {masterPromptExpanded ? 'HIDE MASTER PROMPT' : 'INSPECT MASTER PROMPT'}
          </button>
          {masterPromptExpanded ? (
            <pre
              className="p-3 text-[7px] font-futura uppercase overflow-x-auto whitespace-pre-wrap"
              style={{
                background: ADMIN_STUDIO_THEME.panelBg,
                border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
                color: ADMIN_STUDIO_THEME.textSecondary,
                lineHeight: 1.5,
              }}
            >
              {pkg.promptAssembly.masterPrompt}
            </pre>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'review' ? (
        <div className="space-y-4 mt-3">
          <AdminStudioSectionHeading>EDITOR REVIEW</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
            STATUS: {session.approvalStatus.toUpperCase()} · EVERY PACK REMAINS DRAFT UNTIL APPROVED
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {EDITOR_REVIEW_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => runEditorAction(action.id as EditorReviewAction)}
                className="py-2 px-2 text-[7px] font-futura uppercase border bg-white/70"
                style={{
                  fontWeight: 515,
                  color: action.id === 'approve' ? '#16A34A' : action.id === 'reject' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {action.label}
              </button>
            ))}
          </div>

          <AdminStudioSectionHeading>CREATIVE TIMELINE</AdminStudioSectionHeading>
          <CreativeTimelinePanel currentStep={session.timelineStep} />
        </div>
      ) : null}

      {activeTab === 'ideas' ? (
        <div className="space-y-3 mt-3">
          <AdminStudioSectionHeading>CONTENT OPPORTUNITIES</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            TRENDING IDEAS — DEMO LOGIC FROM PRODUCTS, SEASON, FAQS & PERFORMANCE
          </p>
          <div className="space-y-1.5">
            {CONTENT_OPPORTUNITIES_DEMO.map((opp) => (
              <button
                key={opp.id}
                type="button"
                onClick={() => setTopic(opp.title)}
                className="w-full text-left p-3 border bg-white/70 transition-colors hover:bg-white"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${opp.priority === 'HIGH' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBorder}` }}
              >
                <p className="text-[9px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {opp.title}
                </p>
                <p className="text-[6px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {opp.source} · {opp.priority}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/content-brain')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          CONTENT BRAIN →
        </button>
        <button
          type="button"
          disabled={!pkg.qualityGate.canGenerate}
          onClick={() => setBlueprintGateOpen(true)}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{
            fontWeight: 515,
            color: pkg.qualityGate.canGenerate ? '#FFFFFF' : ADMIN_STUDIO_THEME.textSecondary,
            background: pkg.qualityGate.canGenerate ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBg,
            borderColor: ADMIN_STUDIO_THEME.panelBorder,
            opacity: pkg.qualityGate.canGenerate ? 1 : 0.6,
          }}
        >
          {pkg.qualityGate.canGenerate ? 'AUTHOR CONSTRUCTION PLAN →' : 'QUALITY GATE INCOMPLETE'}
        </button>
      </div>

      {blueprintGateOpen && pkg.qualityGate.canGenerate ? (
        <BlueprintAuthorCreativeDirectorGate
          topic={session.topic}
          contentPurpose={session.contentPurpose}
          environment={session.environment}
          onProceedToAiStudio={() => navigate('/admin/studio/ai-studio')}
        />
      ) : null}

      <AdminStudioDisclaimerFooter>
        CREATIVE DIRECTOR IS NOT AN AI MODEL — DECISION ENGINE ONLY · NO PROVIDER BYPASS · PHASE 2 AI ORCHESTRATOR NEXT
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}

function FlowDiagram() {
  const steps = ['CONTENT BRAIN', 'CREATIVE DIRECTOR', 'AI ORCHESTRATOR', 'AI PROVIDERS', 'DRAFT CONTENT'];
  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {steps.map((step, i) => (
        <div key={step} className="w-full flex flex-col items-center">
          {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
          <div
            className="w-full text-center py-1.5 px-2 border text-[7px] font-futura uppercase"
            style={{
              fontWeight: 515,
              color: step === 'CREATIVE DIRECTOR' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: step === 'CREATIVE DIRECTOR' ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg,
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {step}
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function ShowRecommenderPanel({
  recommendation,
  selectedShowId,
  onApply,
  onOverride,
}: {
  recommendation: { showId: string; showName: string; reason: string; confidence: number };
  selectedShowId: string;
  onApply: () => void;
  onOverride: (showId: string) => void;
}) {
  return (
    <div
      className="p-3 space-y-2"
      style={{ background: ADMIN_STUDIO_THEME.panelBg, border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`, borderLeft: `2px solid ${ADMIN_STUDIO_THEME.accent}` }}
    >
      <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
        SHOW RECOMMENDER
      </p>
      <p className="text-[9px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
        {recommendation.showName}
      </p>
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
        {recommendation.reason}
      </p>
      <p className="text-[14px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
        {recommendation.confidence}% CONFIDENCE
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={onApply} className="flex-1 py-1.5 text-[7px] font-futura uppercase border bg-white" style={{ fontWeight: 515, color: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          APPLY
        </button>
        <AdminStudioSingleSelect
          label=""
          value={selectedShowId}
          options={ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.map((s) => ({ value: s.id, label: s.name }))}
          onChange={onOverride}
        />
      </div>
    </div>
  );
}

function QualityGatePanel({
  gate,
  canGenerate,
}: {
  gate: { checks: Array<{ id: string; label: string; passed: boolean; detail?: string }>; allPassed: boolean };
  canGenerate: boolean;
}) {
  return (
    <div className="space-y-1">
      {gate.checks.map((check) => (
        <div key={check.id} className="flex items-center justify-between px-2 py-1.5 border bg-white/60" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <span className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
            {check.passed ? '✓' : '○'} {check.label}
          </span>
          <span className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: check.passed ? '#16A34A' : '#CA8A04' }}>
            {check.detail ?? (check.passed ? 'PASS' : 'PENDING')}
          </span>
        </div>
      ))}
      <p className="text-[7px] font-futura uppercase pt-2" style={{ fontWeight: 515, color: canGenerate ? '#16A34A' : ADMIN_STUDIO_THEME.accent }}>
        {canGenerate ? 'READY FOR AI ORCHESTRATOR (DEMO)' : 'COMPLETE ALL REQUIRED CHECKS BEFORE GENERATION'}
      </p>
    </div>
  );
}

function OutputStrategistPanel({
  outputs,
  onSetTier,
}: {
  outputs: Record<CreativeOutputId, OutputTier>;
  onSetTier: (id: CreativeOutputId, tier: OutputTier) => void;
}) {
  const tiers: OutputTier[] = ['required', 'recommended', 'optional', 'off'];
  const tierLabel: Record<OutputTier, string> = {
    required: 'REQUIRED',
    recommended: 'RECOMMENDED',
    optional: 'OPTIONAL',
    off: 'OFF',
  };

  return (
    <div className="space-y-1.5">
      {CREATIVE_OUTPUT_DEFINITIONS.map((def) => (
        <div key={def.id} className="flex items-center justify-between gap-2 p-2 border bg-white/60" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <span className="text-[7px] font-futura uppercase flex-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
            {outputs[def.id] === 'required' ? '✓ ' : ''}{def.label}
          </span>
          <select
            value={outputs[def.id]}
            onChange={(e) => onSetTier(def.id, e.target.value as OutputTier)}
            className="text-[6px] font-futura uppercase bg-white border px-1 py-0.5"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
          >
            {tiers.map((t) => (
              <option key={t} value={t}>{tierLabel[t]}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function CreativeTimelinePanel({ currentStep }: { currentStep: string }) {
  const currentIndex = CREATIVE_TIMELINE_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex flex-col items-center gap-0">
      {CREATIVE_TIMELINE_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <div key={step.id} className="w-full flex flex-col items-center">
            {index > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
            <div
              className="w-full px-3 py-1.5 border text-[7px] font-futura uppercase text-center transition-colors"
              style={{
                fontWeight: 515,
                color: isActive ? ADMIN_STUDIO_THEME.accent : isDone ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary,
                background: isActive ? ADMIN_STUDIO_THEME.selectedBg : isDone ? 'rgba(22,163,74,0.06)' : ADMIN_STUDIO_THEME.panelBg,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                borderLeft: isActive ? `2px solid ${ADMIN_STUDIO_THEME.accent}` : undefined,
              }}
            >
              {isDone ? '✓ ' : ''}{step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
