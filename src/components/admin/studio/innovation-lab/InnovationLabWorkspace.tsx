import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInnovationLabState } from '../../../../hooks/useInnovationLabState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  COLLABORATIVE_DEPARTMENT_LABELS,
  IDEA_CATEGORY_LABELS,
  INNOVATION_LAB_ACCENT,
  INNOVATION_LAB_PHILOSOPHY,
  INNOVATION_SOURCE_LABELS,
  PIPELINE_STAGE_LABELS,
} from '../../../../studio-os-core/innovation-lab';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type InnovationLabTab = 'overview' | 'workbench' | 'collaborative' | 'pipeline';

const TABS: { id: InnovationLabTab; label: string }[] = [
  { id: 'overview', label: 'INNOVATION OVERVIEW' },
  { id: 'workbench', label: 'IDEA WORKBENCH' },
  { id: 'collaborative', label: 'COLLABORATIVE INNOVATION' },
  { id: 'pipeline', label: 'INNOVATION PIPELINE' },
];

export function InnovationLabWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<InnovationLabTab>('overview');
  const { profile, refresh, selectedIdea, selectedIdeaId, setSelectedIdeaId } = useInnovationLabState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        INNOVATION LAB™ LOADING — PERMANENT RESEARCH & INVENTION CENTER
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 119 · INNOVATION LAB™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Permanent research, invention, and strategic ideation — continuously create ideas, not merely collect them."
        progressPct={profile.innovationCapabilityScore}
        stats={[
          { label: 'CAPABILITY', value: `${profile.innovationCapabilityScore}%` },
          { label: 'IDEAS', value: `${profile.ideasGenerated}` },
          { label: 'PIPELINE', value: `${profile.ideasInPipeline}` },
          { label: 'REVENUE OPS', value: `${profile.revenueOpportunitiesDiscovered}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.innovationCapabilityScore} size={56} label="INNOVATE" accent={INNOVATION_LAB_ACCENT} />
        <div>
          {INNOVATION_LAB_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · PROACTIVE INNOVATION">
        <p className="text-[6px] font-futura" style={{ color: INNOVATION_LAB_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockInnovationLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title={`INNOVATION SOURCES · ${profile.activeSources} ACTIVE`}>
        <div className="grid grid-cols-2 gap-2">
          {profile.sourceContributions.map((src) => (
            <p key={src.sourceId} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {INNOVATION_SOURCE_LABELS[src.sourceId]}:{' '}
              <span style={{ color: src.active ? INNOVATION_LAB_ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
                {src.active ? `${src.contributionCount} contributions` : 'awaiting'}
              </span>
            </p>
          ))}
        </div>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="RECENT IDEAS · 20 CATEGORIES">
        {profile.ideas.slice(0, 6).map((idea) => (
          <button
            key={idea.id}
            type="button"
            onClick={() => {
              setSelectedIdeaId(idea.id);
              setTab('workbench');
            }}
            className="block w-full text-left mb-2"
          >
            <p className="text-[6px] font-futura" style={{ color: INNOVATION_LAB_ACCENT, fontWeight: 515 }}>
              {IDEA_CATEGORY_LABELS[idea.category].toUpperCase()} · {PIPELINE_STAGE_LABELS[idea.stage].toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {idea.title}
            </p>
          </button>
        ))}
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: INNOVATION_LAB_ACCENT, color: INNOVATION_LAB_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH INNOVATION LAB
      </button>
    </ExecutivePageShell>
  );

  const renderWorkbench = () => {
    const idea = selectedIdea ?? profile.ideas[0];
    if (!idea) return null;
    const wb = idea.workbench;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title="IDEA WORKBENCH · EVERY IDEA RECEIVES ITS OWN INNOVATION WORKSPACE">
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.ideas.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setSelectedIdeaId(i.id)}
                className="px-2 py-1 text-[5px] font-futura uppercase border mb-1"
                style={{
                  borderColor: selectedIdeaId === i.id ? INNOVATION_LAB_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                  color: selectedIdeaId === i.id ? INNOVATION_LAB_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
                }}
              >
                {i.title.slice(0, 28)}…
              </button>
            ))}
          </div>
          <ExecutiveHeroCard
            eyebrow={`${idea.categoryLabel.toUpperCase()} · ${idea.stageLabel.toUpperCase()} · ${idea.confidencePct}% CONFIDENCE`}
            title={idea.title.toUpperCase()}
            subtitle={`Source: ${INNOVATION_SOURCE_LABELS[idea.sourceId]} · Revenue potential ${idea.revenuePotentialScore}%`}
            progressPct={idea.confidencePct}
            stats={[
              { label: 'DIFFICULTY', value: wb.difficulty.toUpperCase() },
              { label: 'RISK', value: wb.risk.toUpperCase() },
              { label: 'REVENUE', value: `${idea.revenuePotentialScore}%` },
              { label: 'STAGE', value: idea.stageLabel.toUpperCase() },
            ]}
          />
          {(
            [
              ['EXECUTIVE SUMMARY', wb.executiveSummary],
              ['PROBLEM BEING SOLVED', wb.problemBeingSolved],
              ['OPPORTUNITY ANALYSIS', wb.opportunityAnalysis],
              ['POTENTIAL CUSTOMERS', wb.potentialCustomers],
              ['REVENUE POTENTIAL', wb.revenuePotential],
              ['PROTOTYPE STATUS', wb.prototypeStatus],
              ['RESEARCH', wb.research],
              ['EXECUTIVE COUNCIL FEEDBACK', wb.executiveCouncilFeedback],
              ['FOUNDER NOTES', wb.founderNotes],
            ] as const
          ).map(([title, body]) => (
            <ExecutiveSecondaryCard key={title} title={title}>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
                {body}
              </p>
            </ExecutiveSecondaryCard>
          ))}
          <ExecutiveSecondaryCard title="REQUIRED DEPARTMENTS · SUPPORTING FILES · TIMELINE">
            <p className="text-[6px] font-futura mb-1" style={{ color: INNOVATION_LAB_ACCENT }}>
              {wb.requiredDepartments.join(' · ')}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              FILES: {wb.supportingFiles.join(' · ')}
            </p>
            {wb.innovationTimeline.map((step) => (
              <p key={step} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                → {step}
              </p>
            ))}
          </ExecutiveSecondaryCard>
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderCollaborative = () => {
    const idea = selectedIdea ?? profile.ideas.find((i) => !i.archived) ?? profile.ideas[0];
    if (!idea) return null;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title="COLLABORATIVE INNOVATION · DIGITAL CONCIERGES EVALUATE EVERY IDEA">
          <ExecutiveSecondaryCard title={idea.title.toUpperCase()}>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Marketing · Finance · Operations · Research · Legal · Customer Experience collaborate.
            </p>
            {idea.collaborativeReviews.map((rev) => (
              <div key={rev.department} className="mb-2">
                <p className="text-[6px] font-futura" style={{ color: INNOVATION_LAB_ACCENT, fontWeight: 515 }}>
                  {COLLABORATIVE_DEPARTMENT_LABELS[rev.department].toUpperCase()} · {rev.scorePct}%
                </p>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                  {rev.evaluation} {rev.recommendation}
                </p>
              </div>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="CHIEF CONCIERGE · EXECUTIVE RECOMMENDATION">
            <p className="text-[6px] font-futura" style={{ color: INNOVATION_LAB_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
              {idea.chiefConciergeRecommendation}
            </p>
          </ExecutiveSecondaryCard>
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderPipeline = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="INNOVATION PIPELINE · IDEAS NEVER DISAPPEAR · ARCHIVED REMAIN SEARCHABLE">
        {profile.pipelineSummary.map((stage) => (
          <ExecutiveSecondaryCard key={stage.stage} title={`${stage.label.toUpperCase()} · ${stage.count}`}>
            {stage.count === 0 ? (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                No ideas in this stage.
              </p>
            ) : (
              profile.ideas
                .filter((i) => i.stage === stage.stage)
                .map((idea) => (
                  <button
                    key={idea.id}
                    type="button"
                    onClick={() => {
                      setSelectedIdeaId(idea.id);
                      setTab('workbench');
                    }}
                    className="block w-full text-left mb-2"
                  >
                    <p className="text-[6px] font-futura" style={{ color: INNOVATION_LAB_ACCENT }}>
                      {idea.title} · {idea.categoryLabel}
                      {idea.archived ? ' · ARCHIVED' : ''}
                    </p>
                  </button>
                ))
            )}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="innovation-lab" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? INNOVATION_LAB_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? INNOVATION_LAB_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'workbench' && renderWorkbench()}
      {tab === 'collaborative' && renderCollaborative()}
      {tab === 'pipeline' && renderPipeline()}
    </div>
  );
}
