import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessDiscoveryBlueprintState } from '../../../../hooks/useBusinessDiscoveryBlueprintState';
import {
  DISCOVERY_BLUEPRINT_PHILOSOPHY,
  DISCOVERY_CHAPTERS,
  adaptQuestionForIndustry,
  buildConversationalIntro,
  getChapterDefinition,
  LIVING_DISCOVERY_PROMPT,
} from '../../../../studio-os-core/business-discovery-blueprint';
import { CEREMONIAL_LINES } from '../../../../studio-os-core/organization-inauguration';
import { adminStudioOrganizationInaugurationPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveCollapsibleSection,
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
  ExecutiveVisualSummary,
} from '../executive-ia';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

type BlueprintTab = 'consultation' | 'chapters' | 'outputs' | 'living';

const TABS: { id: BlueprintTab; label: string }[] = [
  { id: 'consultation', label: 'GUIDED CONSULTATION' },
  { id: 'chapters', label: 'CHAPTERS · PROGRESS' },
  { id: 'outputs', label: 'GENERATED OUTPUTS' },
  { id: 'living', label: 'LIVING DISCOVERY' },
];

export function BusinessDiscoveryBlueprintWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<BlueprintTab>('consultation');
  const [draftAnswer, setDraftAnswer] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [resourceCategory, setResourceCategory] = useState('Documents');

  const {
    blueprint,
    chapterProgress,
    pendingFollowUps,
    activeServiceSession,
    pendingServiceNames,
    nextPrompt,
    selectChapter,
    answerPrompt,
    beginServiceSession,
    finishServiceSession,
    uploadResource,
    dismissLivingSignal,
  } = useBusinessDiscoveryBlueprintState();

  if (!blueprint) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        BUSINESS DISCOVERY BLUEPRINT LOADING — PREPARING ORGANIZATIONAL ARCHAEOLOGY
      </p>
    );
  }

  const currentChapter = getChapterDefinition(blueprint.currentChapterId);
  const isReturning = blueprint.responses.length > 0;
  const intro = buildConversationalIntro(currentChapter.title, isReturning);
  const unresolvedLiving = blueprint.livingSignals.filter((s) => !s.resolved);

  const handleSubmitAnswer = () => {
    if (!nextPrompt || !draftAnswer.trim()) return;
    answerPrompt(nextPrompt.id, blueprint.currentChapterId, draftAnswer.trim());
    setDraftAnswer('');
  };

  const handleUpload = () => {
    if (!resourceName.trim()) return;
    uploadResource(resourceName.trim(), resourceCategory);
    setResourceName('');
  };

  const renderInaugurationBanner = () =>
    blueprint.blueprintFullyComplete ? (
      <ExecutiveFocusPanel title="ORGANIZATION FOUNDATION DOCUMENTED">
        <p className="text-[6px] font-futura normal-case mb-2" style={{ color: '#555', lineHeight: 1.5 }}>
          {CEREMONIAL_LINES[1]} Studio OS is ready to inaugurate your Headquarters.
        </p>
        <button
          type="button"
          onClick={() => navigate(adminStudioOrganizationInaugurationPath())}
          className="w-full py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, borderColor: '#0D9488', color: '#0D9488', background: 'rgba(13,148,136,0.06)' }}
        >
          BEGIN FOUNDER CEREMONY
        </button>
      </ExecutiveFocusPanel>
    ) : null;

  const renderConsultation = () => (
    <>
      {renderInaugurationBanner()}
      <ExecutiveHeroCard
        eyebrow="MILESTONE 90 · BUSINESS DISCOVERY BLUEPRINT™"
        title={currentChapter.title.toUpperCase()}
        subtitle={intro}
        progressPct={blueprint.overallProgressPct}
        stats={[
          { label: 'PROGRESS', value: `${blueprint.overallProgressPct}%` },
          { label: 'CHAPTER', value: String(currentChapter.number) },
          { label: 'STATUS', value: blueprint.status.toUpperCase() },
          { label: 'OUTPUTS', value: String(blueprint.generatedOutputs.length) },
        ]}
      />

      {blueprint.currentChapterId === 'services' && !activeServiceSession && pendingServiceNames.length > 0 ? (
        <ExecutiveFocusPanel title="SERVICE DISCOVERY SESSIONS">
          <p className="text-[6px] font-futura normal-case mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            Each service gets its own discovery conversation. Select a service to begin.
          </p>
          <div className="flex flex-wrap gap-1">
            {pendingServiceNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => beginServiceSession(name)}
                className="px-2 py-1 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, borderColor: '#92704A', color: '#92704A' }}
              >
                {name}
              </button>
            ))}
          </div>
        </ExecutiveFocusPanel>
      ) : null}

      {activeServiceSession ? (
        <ExecutiveSecondaryCard title={`SERVICE · ${activeServiceSession.serviceName.toUpperCase()}`}>
          <p className="text-[6px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            INDEPENDENT DISCOVERY SESSION
          </p>
        </ExecutiveSecondaryCard>
      ) : null}

      {nextPrompt ? (
        <ExecutiveFocusPanel title="STUDIO OS ASKS">
          <p className="text-[7px] font-futura normal-case mb-2" style={{ color: ADMIN_STUDIO_THEME.accent, lineHeight: 1.5, fontWeight: 515 }}>
            {adaptQuestionForIndustry(nextPrompt.question, blueprint.industryId)}
          </p>
          <textarea
            value={draftAnswer}
            onChange={(e) => setDraftAnswer(e.target.value)}
            placeholder={nextPrompt.placeholder ?? 'Tell your story…'}
            rows={4}
            className="w-full p-2 text-[7px] font-futura border mb-2 normal-case"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: '#333' }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={!draftAnswer.trim()}
              className="flex-1 py-2 text-[7px] font-futura uppercase border"
              style={{
                fontWeight: 515,
                borderColor: ADMIN_STUDIO_THEME.accent,
                color: draftAnswer.trim() ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              }}
            >
              SAVE · CONTINUE CONVERSATION
            </button>
            {activeServiceSession ? (
              <button
                type="button"
                onClick={finishServiceSession}
                className="px-3 py-2 text-[7px] font-futura uppercase border"
                style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
              >
                COMPLETE SERVICE
              </button>
            ) : null}
          </div>
        </ExecutiveFocusPanel>
      ) : (
        <ExecutiveFocusPanel title="CHAPTER COMPLETE">
          <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {currentChapter.title} is captured for now. Select the recommended next chapter or revisit any chapter anytime.
          </p>
          <button
            type="button"
            onClick={() => selectChapter(blueprint.recommendedNextChapterId)}
            className="mt-2 w-full py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, borderColor: '#92704A', color: '#92704A' }}
          >
            CONTINUE · {getChapterDefinition(blueprint.recommendedNextChapterId).title.toUpperCase()}
          </button>
        </ExecutiveFocusPanel>
      )}

      {pendingFollowUps.length > 0 ? (
        <ExecutiveCollapsibleSection title="CONVERSATIONAL FOLLOW-UPS" defaultOpen>
          {pendingFollowUps.map((f) => (
            <div key={f.promptId} className="mb-2 pb-2 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
                {f.reason}
              </p>
              <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.45 }}>
                {f.question}
              </p>
            </div>
          ))}
        </ExecutiveCollapsibleSection>
      ) : null}

      {blueprint.currentChapterId === 'resources' ? (
        <ExecutiveFocusPanel title="RESOURCE UPLOADS">
          <p className="text-[6px] font-futura normal-case mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            Documents · forms · templates · contracts · policies · checklists · training manuals · reference material
          </p>
          <input
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            placeholder="File or resource name…"
            className="w-full p-2 mb-2 text-[7px] font-futura border normal-case"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          />
          <select
            value={resourceCategory}
            onChange={(e) => setResourceCategory(e.target.value)}
            className="w-full p-2 mb-2 text-[7px] font-futura border"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            {['Documents', 'Forms', 'Templates', 'Contracts', 'Policies', 'Checklists', 'Training', 'Reference'].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              )
            )}
          </select>
          <button
            type="button"
            onClick={handleUpload}
            className="w-full py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
          >
            RECORD ORGANIZATIONAL RESOURCE
          </button>
          {blueprint.resourceUploads.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {blueprint.resourceUploads.map((u) => (
                <li key={u.id} className="text-[6px] font-futura normal-case" style={{ color: '#555' }}>
                  {u.category} · {u.fileName}
                </li>
              ))}
            </ul>
          ) : null}
        </ExecutiveFocusPanel>
      ) : null}
    </>
  );

  const renderChapters = () => (
    <ExecutivePageShell>
      <ExecutiveVisualSummary title="DISCOVERY CHAPTERS · PROGRESS">
        <ExecutiveSecondaryGrid>
        {DISCOVERY_CHAPTERS.map((chapter) => {
          const progress = chapterProgress.find((p) => p.chapterId === chapter.id);
          const isRecommended = blueprint.recommendedNextChapterId === chapter.id;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => selectChapter(chapter.id)}
              className="text-left p-2 border"
              style={{
                ...panelStyle,
                borderColor: isRecommended ? '#92704A' : ADMIN_STUDIO_THEME.panelBorder,
              }}
            >
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                CHAPTER {chapter.number}
              </p>
              <p className="text-[7px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {chapter.title}
              </p>
              <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.4 }}>
                {chapter.subtitle}
              </p>
              <div className="mt-2 h-1 w-full" style={{ background: '#eee' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${progress?.percentComplete ?? 0}%`,
                    background: progress?.status === 'complete' ? '#0D9488' : '#92704A',
                  }}
                />
              </div>
              <p className="text-[6px] font-futura uppercase mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {progress?.percentComplete ?? 0}% · {progress?.status?.replace('-', ' ') ?? 'NOT STARTED'}
                {isRecommended ? ' · RECOMMENDED NEXT' : ''}
              </p>
            </button>
          );
        })}
        </ExecutiveSecondaryGrid>
      </ExecutiveVisualSummary>
    </ExecutivePageShell>
  );

  const renderOutputs = () => (
    <ExecutiveFocusPanel title="BLUEPRINT OUTPUTS · ONE SOURCE POWERS THE ORGANIZATION">
      {blueprint.generatedOutputs.length === 0 ? (
        <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Complete discovery chapters to automatically generate Headquarters, Mission Control, SOPs, Academy foundations, and more.
        </p>
      ) : (
        blueprint.generatedOutputs.map((output) => (
          <div key={output.id} className="mb-3 pb-3 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
              {output.category}
            </p>
            <p className="text-[7px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              {output.title}
            </p>
            <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.45 }}>
              {output.summary}
            </p>
          </div>
        ))
      )}
    </ExecutiveFocusPanel>
  );

  const renderLiving = () => (
    <>
      <ExecutiveHeroCard
        eyebrow="LIVING DISCOVERY"
        title="THE BLUEPRINT NEVER FINISHES"
        subtitle={LIVING_DISCOVERY_PROMPT}
      />
      <ExecutiveFocusPanel title="PHILOSOPHY">
        {DISCOVERY_BLUEPRINT_PHILOSOPHY.map((line) => (
          <p key={line} className="text-[6px] font-futura normal-case mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            · {line}
          </p>
        ))}
      </ExecutiveFocusPanel>
      {unresolvedLiving.length > 0 ? (
        <ExecutiveFocusPanel title="PENDING UPDATES">
          {unresolvedLiving.map((signal) => (
            <div key={signal.id} className="mb-2 flex gap-2 items-start">
              <p className="flex-1 text-[6px] font-futura normal-case" style={{ color: '#555', lineHeight: 1.45 }}>
                "{signal.phrase}"
              </p>
              <button
                type="button"
                onClick={() => dismissLivingSignal(signal.id)}
                className="px-2 py-1 text-[6px] font-futura uppercase border shrink-0"
                style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
              >
                UPDATE NOW
              </button>
            </div>
          ))}
        </ExecutiveFocusPanel>
      ) : null}
      {blueprint.milestonesCelebrated.length > 0 ? (
        <ExecutiveCollapsibleSection title="COMPLETION MILESTONES" defaultOpen={false}>
          {blueprint.milestonesCelebrated.map((m) => (
            <p key={m} className="text-[6px] font-futura uppercase mb-1" style={{ color: '#0D9488', fontWeight: 515 }}>
              ✓ {m.replace(/-/g, ' ').toUpperCase()}
            </p>
          ))}
        </ExecutiveCollapsibleSection>
      ) : null}
    </>
  );

  return (
    <div className="business-discovery-blueprint-root">
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(13,148,136,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'consultation' && renderConsultation()}
      {tab === 'chapters' && renderChapters()}
      {tab === 'outputs' && renderOutputs()}
      {tab === 'living' && renderLiving()}
    </div>
  );
}
