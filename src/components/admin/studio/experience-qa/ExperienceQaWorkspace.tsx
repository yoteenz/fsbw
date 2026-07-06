import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperienceQaState } from '../../../../hooks/useExperienceQaState';
import {
  EXPERIENCE_QA_ACCENT,
  EXPERIENCE_QA_PHILOSOPHY,
  EXPERIENCE_QUESTIONS,
  SIMULATION_PERSONA_LABELS,
  SIMULATION_PERSONAS,
  queryExperienceQa,
  refreshExperienceQa,
  selectExperiencePage,
  getSelectedExperienceReport,
  explainExperienceFinding,
} from '../../../../studio-os-core/experience-qa';
import {
  adminStudioExperienceEnginePath,
  adminStudioPromptQaPath,
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

type ExperienceQaTab = 'overview' | 'reports' | 'simulations' | 'findings' | 'evaluation';

const TABS: { id: ExperienceQaTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'reports', label: 'EXPERIENCE REPORTS' },
  { id: 'simulations', label: 'SIMULATIONS' },
  { id: 'findings', label: 'FINDINGS' },
  { id: 'evaluation', label: 'EVALUATION' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  advisory: '#6366F1',
};

const STATUS_COLOR: Record<string, string> = {
  excellent: '#10B981',
  watch: '#F59E0B',
  'needs-work': '#EF4444',
};

export function ExperienceQaWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ExperienceQaTab>('overview');
  const [searchQuery, setSearchQuery] = useState('friction');
  const { profile, refresh } = useExperienceQaState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPERIENCE QA™ LOADING — EVALUATING EMOTIONAL QUALITY OF EVERY INTERACTION
      </p>
    );
  }

  const selectedReport = getSelectedExperienceReport(profile);
  const searchHits = queryExperienceQa(searchQuery, profile, 8);

  const handleSelectPage = (pageId: string) => {
    selectExperiencePage(profile.organizationId, pageId);
    refresh();
    setTab('reports');
  };

  const handleRefresh = () => {
    refreshExperienceQa(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 156 · EXPERIENCE QA™ · EMOTIONAL QUALITY INTELLIGENCE"
        title={profile.companyName.toUpperCase()}
        subtitle="Evaluates how people feel while using Studio OS — not just whether they successfully completed a task. Optimizes for confidence, not clicks."
        progressPct={profile.overallExperienceScore}
        stats={[
          { label: 'PAGES', value: `${profile.pagesAudited}` },
          { label: 'FINDINGS', value: `${profile.findingsOpen}` },
          { label: 'REFINE', value: `${profile.pagesNeedingRefinement}` },
          { label: 'EMOTIONAL', value: `${profile.averageEmotionalLoad}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallExperienceScore} size={56} label="EQ" accent={EXPERIENCE_QA_ACCENT} />
        <div>
          {EXPERIENCE_QA_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="EFFORTLESS · TRUSTWORTHY · CALM · INTELLIGENTLY DESIGNED">
        <p className="text-[6px] font-futura mb-2" style={{ color: EXPERIENCE_QA_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          Software can function perfectly and still provide a poor experience. Experience QA exists to prevent that.
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockExperienceLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="EXPERIENCE QUESTIONS — KEY PAGE UNDER REVIEW">
        {profile.questionAnswers.slice(0, 4).map((qa) => (
          <div key={qa.question} className="mb-2">
            <p className="text-[6px] font-futura" style={{ color: EXPERIENCE_QA_ACCENT, fontWeight: 515 }}>
              {qa.question}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {qa.answer}
            </p>
          </div>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="PAGES NEEDING CALMER EXPERIENCE">
        {profile.pageReports
          .filter((p) => !p.feelsEffortless)
          .slice(0, 4)
          .map((p) => (
            <button key={p.id} type="button" onClick={() => handleSelectPage(p.pageId)} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
              <p className="text-[6px] font-futura" style={{ color: '#EF4444', fontWeight: 515 }}>
                {p.pageLabel} · Experience {p.experienceScore}% · Emotional load {p.emotionalLoad}%
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {p.experienceVerdict.slice(0, 100)}…
              </p>
            </button>
          ))}
        {profile.pagesNeedingRefinement === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
            All audited pages feel effortless and trustworthy.
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('reports')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: EXPERIENCE_QA_ACCENT, color: EXPERIENCE_QA_ACCENT }}>
        VIEW EXPERIENCE REPORTS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioExperienceEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPERIENCE ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPromptQaPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROMPT QA →
      </button>
    </ExecutivePageShell>
  );

  const renderReports = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXPERIENCE REPORTS — EVERY PAGE SCORED FOR FEELING">
        {(selectedReport
          ? [selectedReport, ...profile.pageReports.filter((p) => p.pageId !== selectedReport.pageId)]
          : profile.pageReports
        ).map((report) => (
          <ExecutiveSecondaryCard
            key={report.id}
            title={`${report.pageLabel.toUpperCase()} · ${report.feelsEffortless ? 'EFFORTLESS ✓' : 'NEEDS CALM'}`}
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { label: 'EXPERIENCE', value: `${report.experienceScore}%` },
                { label: 'CLARITY', value: `${report.clarityScore}%` },
                { label: 'EMOTIONAL LOAD', value: `${report.emotionalLoad}%` },
                { label: 'LEARNING TIME', value: report.estimatedLearningTime },
                { label: 'TASK TIME', value: report.estimatedTaskCompletionTime },
              ].map((metric) => (
                <div key={metric.label}>
                  <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {metric.label}
                  </p>
                  <p className="text-[7px] font-futura" style={{ color: EXPERIENCE_QA_ACCENT, fontWeight: 515 }}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
            <ExecutiveSecondaryCard title="POINTS OF CONFUSION">
              {report.pointsOfConfusion.map((point) => (
                <p key={point} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {point}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="SUGGESTED IMPROVEMENTS">
              {report.suggestedImprovements.map((item) => (
                <p key={item} className="text-[6px] font-futura mb-1" style={{ color: EXPERIENCE_QA_ACCENT, lineHeight: 1.4 }}>
                  · {item}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: report.feelsEffortless ? '#10B981' : '#EF4444', lineHeight: 1.45 }}>
              {report.experienceVerdict}
            </p>
            <button type="button" onClick={() => handleSelectPage(report.pageId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: EXPERIENCE_QA_ACCENT, color: EXPERIENCE_QA_ACCENT }}>
              SIMULATE THIS PAGE →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSimulations = () => {
    const sims = selectedReport
      ? profile.simulations.filter((s) => s.pageId === selectedReport.pageId)
      : profile.simulations;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `SIMULATIONS · ${selectedReport.pageLabel.toUpperCase()}` : '10 PERSONA SIMULATIONS'}>
          <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            First-time · Returning · Power · Executive · Employee · Customer · Expert · Mobile · Desktop · Accessibility
          </p>
          {SIMULATION_PERSONAS.map((persona) => {
            const personaSims = sims.filter((s) => s.persona === persona);
            const sim = personaSims[0];
            if (!sim) return null;
            return (
              <ExecutiveSecondaryCard key={persona} title={`${SIMULATION_PERSONA_LABELS[persona].toUpperCase()} · ${sim.passed ? 'PASSED' : 'NEEDS WORK'}`}>
                <p className="text-[6px] font-futura mb-1" style={{ color: sim.passed ? '#10B981' : '#EF4444', fontWeight: 515 }}>
                  Experience {sim.experienceScore}% · Friction {sim.frictionScore}% · Confidence {sim.confidenceScore}%
                </p>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                  {sim.summary}
                </p>
              </ExecutiveSecondaryCard>
            );
          })}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderFindings = () => {
    const pageFindings = selectedReport
      ? profile.findings.filter((f) => f.pageId === selectedReport.pageId)
      : profile.findings;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `FINDINGS · ${selectedReport.pageLabel.toUpperCase()}` : 'ALL EXPERIENCE FINDINGS'}>
          {pageFindings.slice(0, 16).map((finding) => (
            <ExecutiveSecondaryCard key={finding.id} title={`${finding.issueLabel.toUpperCase()} · ${finding.categoryLabel.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[finding.severity], fontWeight: 515 }}>
                [{finding.severity.toUpperCase()}] {finding.pageLabel}
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {finding.description}
              </p>
              <ExecutiveSecondaryCard title="EMOTIONAL IMPACT">
                <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                  {finding.emotionalImpact}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="SUGGESTED IMPROVEMENT">
                <p className="text-[6px] font-futura" style={{ color: EXPERIENCE_QA_ACCENT, lineHeight: 1.45 }}>
                  {finding.suggestedImprovement}
                </p>
              </ExecutiveSecondaryCard>
              <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {explainExperienceFinding(finding)}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderEvaluation = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="13 EVALUATION CATEGORIES">
        {profile.categoryScores.map((category) => (
          <ExecutiveSecondaryCard key={category.category} title={`${category.label.toUpperCase()} · ${category.status.toUpperCase()}`}>
            <p className="text-[8px] font-futura mb-1" style={{ color: STATUS_COLOR[category.status] ?? EXPERIENCE_QA_ACCENT, fontWeight: 515 }}>
              {category.score}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {category.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="8 EXPERIENCE QA QUESTIONS">
        {EXPERIENCE_QUESTIONS.map((question) => {
          const qa = profile.questionAnswers.find((q) => q.question === question);
          return (
            <ExecutiveSecondaryCard key={question} title={question.toUpperCase()}>
              <p className="text-[6px] font-futura" style={{ color: qa && qa.score >= 80 ? '#10B981' : ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {qa?.answer ?? 'Evaluated in latest page simulation.'}
              </p>
            </ExecutiveSecondaryCard>
          );
        })}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="experience-qa" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? EXPERIENCE_QA_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? EXPERIENCE_QA_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: EXPERIENCE_QA_ACCENT, color: EXPERIENCE_QA_ACCENT }}>
          SYNC EXPERIENCE QA
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search findings, reports, simulations…"
          className="flex-1 px-2 py-1 text-[6px] font-futura border bg-transparent"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
        />
      </div>
      {searchHits.length > 0 && searchQuery.trim() ? (
        <ExecutiveSecondaryCard title="SEARCH RESULTS">
          {searchHits.map((h) => (
            <button
              key={`${h.type}-${h.id}`}
              type="button"
              onClick={() => {
                if (h.type === 'report') {
                  const report = profile.pageReports.find((r) => r.id === h.id);
                  if (report) handleSelectPage(report.pageId);
                }
                if (h.type === 'finding') setTab('findings');
                if (h.type === 'simulation') setTab('simulations');
              }}
              className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer"
            >
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · [{h.type.toUpperCase()}] {h.label} — {h.matchReason}
              </p>
            </button>
          ))}
        </ExecutiveSecondaryCard>
      ) : null}
      {tab === 'overview' && renderOverview()}
      {tab === 'reports' && renderReports()}
      {tab === 'simulations' && renderSimulations()}
      {tab === 'findings' && renderFindings()}
      {tab === 'evaluation' && renderEvaluation()}
    </div>
  );
}
