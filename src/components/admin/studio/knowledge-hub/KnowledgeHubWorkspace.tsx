import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStudioKnowledgeHub } from '../../../../hooks/useAdminStudioKnowledgeHubState';
import {
  KNOWLEDGE_EAD_TIPS,
  KNOWLEDGE_MISSION_STATS,
  KNOWLEDGE_OBJECT_PROFILES,
  KNOWLEDGE_WORKFLOW_GUIDES,
  searchKnowledgeHub,
} from '../../../../utils/adminStudioKnowledgeHubDemo';
import {
  adminStudioKnowledgeHubProfilePath,
  adminStudioKnowledgeHubWorkflowPath,
} from '../../../../utils/adminStudioRoutes';
import {
  buildKnowledgeGraph,
  getAllGraphNodes,
  getAllGraphWorkflows,
  getAllManualModules,
  getManualProgressSummary,
  getMissingDocumentationNodes,
  getRecentWhatsNew,
  readManualMissingTargetLogs,
  searchKnowledgeGraph,
  useStudioInteractiveManual,
} from '../../../../studio-interactive-manual';
import type { KnowledgeGraphNode, KnowledgeGraphSearchHit, KnowledgeGraphWorkflowMap } from '../../../../studio-interactive-manual/knowledge-graph/schema';
import { KnowledgeProfileView } from './KnowledgeProfileView';
import { KH_VISUAL, khActionBtn, khCaption, khPanelStyle, khSectionTitle } from './knowledgeHubTheme';

const HUB_TABS = [
  'OVERVIEW',
  'KNOWLEDGE GRAPH',
  'WALKTHROUGHS',
  'WORKFLOWS',
  'SEARCH',
  'WRITTEN LINKS',
  "WHAT'S NEW",
  'PROGRESS',
  'MISSING DOCS',
  'MISSING TARGETS',
  'WIKI',
] as const;
type HubTab = (typeof HUB_TABS)[number];

export function KnowledgeHubWorkspace() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<HubTab>('OVERVIEW');
  const { executiveNotes, setExecutiveNotes, unreadGuideCount } = useAdminStudioKnowledgeHub();
  const { openModuleManual, openSearchModal } = useStudioInteractiveManual();

  const hits = useMemo(() => searchKnowledgeHub(query), [query]);
  const stats = KNOWLEDGE_MISSION_STATS;
  const manualModules = useMemo(() => getAllManualModules(), []);
  const manualProgress = useMemo(() => getManualProgressSummary(), [tab]);
  const whatsNew = useMemo(() => getRecentWhatsNew(), []);
  const graph = useMemo(() => buildKnowledgeGraph(), []);
  const graphNodes = useMemo((): KnowledgeGraphNode[] => getAllGraphNodes(), []);
  const workflows = useMemo((): KnowledgeGraphWorkflowMap[] => getAllGraphWorkflows(), []);
  const graphSearchHits = useMemo(
    (): KnowledgeGraphSearchHit[] => (query.trim() ? searchKnowledgeGraph(query) : []),
    [query]
  );
  const missingDocs = useMemo(() => getMissingDocumentationNodes(), []);
  const missingTargets = useMemo(() => readManualMissingTargetLogs(), [tab]);

  return (
    <div className="knowledge-hub-root pb-6">
      <div className="flex flex-wrap gap-2 mb-3">
        {HUB_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              ...khActionBtn,
              background: tab === t ? KH_VISUAL.red : 'rgba(255,255,255,0.7)',
              color: tab === t ? '#fff' : KH_VISUAL.black,
              borderColor: tab === t ? KH_VISUAL.red : '#000',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'OVERVIEW' ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={{ ...khCaption, color: KH_VISUAL.red }}>STUDIO OS INTERACTIVE MANUAL</p>
          <p style={khCaption}>
            {manualModules.length} MODULE WALKTHROUGHS · {graph.nodes.length} GRAPH NODES · {graph.edges.length}{' '}
            RELATIONSHIPS · TAP ⓘ ON ANY STUDIO PAGE
          </p>
          <p style={khCaption}>
            CUSTOMER: ONBOARDING TUTORIAL (MANSION TOUR) · ADMIN: INTERACTIVE MANUAL · SHARED: KNOWLEDGE GRAPH
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button type="button" onClick={openSearchModal} style={khActionBtn}>
              SEARCH MANUAL
            </button>
          </div>
        </section>
      ) : null}

      {tab === 'KNOWLEDGE GRAPH' ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={khSectionTitle}>KNOWLEDGE GRAPH ({graphNodes.length} NODES)</p>
          {graphNodes
            .filter((n) => n.type === 'module' || n.type === 'feature')
            .slice(0, 20)
            .map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => openModuleManual(n.moduleId ?? n.id)}
                style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left', marginBottom: '4px' }}
              >
                {n.name}
                <span style={{ display: 'block', ...khCaption, fontSize: '8px' }}>
                  {n.type.toUpperCase()} · {n.description.slice(0, 80)}
                </span>
              </button>
            ))}
        </section>
      ) : null}

      {tab === 'WALKTHROUGHS' ? (
        <>
          <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
            <p style={khSectionTitle}>MODULE WALKTHROUGHS ({manualModules.length})</p>
            {manualModules.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => openModuleManual(m.id)}
                style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left', marginBottom: '4px' }}
              >
                {m.customerName} · {m.steps.length} STEPS
              </button>
            ))}
          </section>
        </>
      ) : null}

      {tab === 'WORKFLOWS' ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={khSectionTitle}>WORKFLOW MAPS</p>
          {workflows.map((wf) => (
            <div key={wf.id} style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <p style={{ ...khCaption, color: KH_VISUAL.red }}>{wf.title}</p>
              <p style={khCaption}>{wf.subtitle}</p>
              <p style={{ ...khCaption, fontSize: '8px' }}>{wf.nodeIds.join(' → ')}</p>
            </div>
          ))}
        </section>
      ) : null}

      {tab === 'SEARCH' ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={khSectionTitle}>MANUAL + GRAPH SEARCH</p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="HOW DOES ASSET FACTORY WORK?"
            className="w-full border border-black px-2 py-2 mt-2"
            style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', textTransform: 'uppercase' }}
          />
          {graphSearchHits.map((hit) => (
            <button
              key={hit.id}
              type="button"
              onClick={() => openModuleManual(hit.moduleId ?? hit.nodeId)}
              style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left', marginTop: '6px' }}
            >
              {hit.label}
            </button>
          ))}
        </section>
      ) : null}

      {tab === 'WRITTEN LINKS' ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={khSectionTitle}>WRITTEN MANUAL CHAPTERS (LINKED)</p>
          {graphNodes
            .filter((n) => n.relatedManualChapter)
            .slice(0, 24)
            .map((n) => (
              <p key={n.id} style={{ ...khCaption, marginBottom: '4px' }}>
                {n.name} → {n.relatedManualChapter}
              </p>
            ))}
        </section>
      ) : null}

      {tab === 'MISSING DOCS' ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={khSectionTitle}>MISSING DOCUMENTATION</p>
          {missingDocs.length === 0 ? (
            <p style={khCaption}>ALL MODULE NODES HAVE STEPS AND EDGES</p>
          ) : (
            missingDocs.map((n) => (
              <p key={n.id} style={khCaption}>
                {n.name} — NEEDS STEPS OR GRAPH EDGES
              </p>
            ))
          )}
        </section>
      ) : null}

      {tab === 'MISSING TARGETS' ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={khSectionTitle}>MISSING TARGETS (DEV SESSION)</p>
          {missingTargets.length === 0 ? (
            <p style={khCaption}>NONE LOGGED</p>
          ) : (
            missingTargets.map((m, i) => (
              <p key={`${m.stepId}-${i}`} style={khCaption}>
                {m.moduleId}/{m.stepId}: {m.selector}
              </p>
            ))
          )}
        </section>
      ) : null}

      {tab === 'PROGRESS' ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={khSectionTitle}>STUDIO OS KNOWLEDGE</p>
          <p style={{ ...khCaption, color: KH_VISUAL.black }}>
            {manualProgress.overallKnowledgePct}% OVERALL · {manualProgress.modulesLearned} MODULES ·{' '}
            {manualProgress.featuresLearned} FEATURES · {manualProgress.graphNodesVisited} GRAPH NODES ·{' '}
            {manualProgress.manualChaptersViewed} CHAPTERS
          </p>
          {manualProgress.resumeModuleId ? (
            <button
              type="button"
              onClick={() => openModuleManual(manualProgress.resumeModuleId!)}
              style={{ ...khActionBtn, marginTop: '8px', color: KH_VISUAL.red }}
            >
              RESUME · {manualProgress.resumeModuleId.toUpperCase()}
            </button>
          ) : null}
        </section>
      ) : null}

      {tab === "WHAT'S NEW" ? (
        <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
          <p style={khSectionTitle}>WHAT&apos;S NEW</p>
          {whatsNew.map((entry) => (
            <div key={entry.id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <p style={{ ...khCaption, color: KH_VISUAL.red }}>
                {entry.version} · {entry.title}
              </p>
              <p style={khCaption}>{entry.summary}</p>
              <button
                type="button"
                onClick={() => openModuleManual(entry.moduleId, { stepId: entry.highlightStepId })}
                style={{ ...khActionBtn, marginTop: '4px' }}
              >
                TRY IT
              </button>
            </div>
          ))}
        </section>
      ) : null}

      {tab === 'WIKI' ? (
        <>
          <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
            <p style={{ ...khCaption, color: KH_VISUAL.red }}>SEARCHABLE WIKI</p>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="MODULES · STUDIOS · TALENT · WORKFLOWS…"
              className="w-full border border-black px-2 py-2 mt-2"
              style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', textTransform: 'uppercase' }}
            />
            {query.trim() ? (
              <div className="mt-2 space-y-1">
                {hits.length === 0 ? (
                  <p style={khCaption}>NO MATCHES</p>
                ) : (
                  hits.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      onClick={() => navigate(hit.route)}
                      style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left' }}
                    >
                      <span style={{ color: KH_VISUAL.red }}>{hit.category}</span> · {hit.title}
                      <span style={{ display: 'block', ...khCaption, fontSize: '8px' }}>{hit.snippet}</span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </section>

          <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
            <p style={khSectionTitle}>KNOWLEDGE HEALTH</p>
            <p style={{ ...khCaption, color: KH_VISUAL.black }}>
              {stats.knowledgeHealthPct}% · {unreadGuideCount} UNREAD GUIDES · {stats.newFeatures} NEW FEATURES
            </p>
            <p style={khCaption}>RECOMMENDED: {stats.recommendedLearning.join(' · ')}</p>
          </section>

          <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
            <p style={khSectionTitle}>OBJECT PROFILES</p>
            {KNOWLEDGE_OBJECT_PROFILES.slice(0, 6).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(adminStudioKnowledgeHubProfilePath(p.id))}
                style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left', marginBottom: '4px' }}
              >
                {p.name}
              </button>
            ))}
          </section>

          <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
            <p style={khSectionTitle}>WORKFLOW GUIDES</p>
            {KNOWLEDGE_WORKFLOW_GUIDES.map((wf) => (
              <button
                key={wf.id}
                type="button"
                onClick={() => navigate(adminStudioKnowledgeHubWorkflowPath(wf.id))}
                style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left', marginBottom: '4px' }}
              >
                {wf.title}
                <span style={{ display: 'block', ...khCaption, fontSize: '8px' }}>{wf.subtitle}</span>
              </button>
            ))}
          </section>

          <section style={{ ...khPanelStyle, padding: '12px', marginBottom: '12px' }}>
            <p style={khSectionTitle}>EXECUTIVE NOTES</p>
            <p style={khCaption}>Founder notes · brand decisions · creative rules · searchable</p>
            <textarea
              value={executiveNotes}
              onChange={(e) => setExecutiveNotes(e.target.value)}
              rows={4}
              className="w-full border border-black mt-2 p-2"
              style={{ fontFamily: '"Futura PT Book"', fontSize: '10px' }}
              placeholder="BRAND DECISIONS · FUTURE IDEAS · INTERNAL REMINDERS…"
            />
          </section>

          <section style={{ ...khPanelStyle, padding: '12px' }}>
            <p style={khSectionTitle}>EXECUTIVE AI DIRECTOR · TIPS</p>
            {KNOWLEDGE_EAD_TIPS.map((tip) => (
              <div key={tip.id} className="mb-2">
                <p style={{ ...khCaption, color: tip.tone === 'warning' ? KH_VISUAL.red : KH_VISUAL.black }}>
                  {tip.tone.toUpperCase()} · {tip.text}
                </p>
                {tip.relatedRoute ? (
                  <button type="button" onClick={() => navigate(tip.relatedRoute!)} style={khActionBtn}>
                    OPEN RELATED
                  </button>
                ) : null}
              </div>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}

export function KnowledgeHubProfilePage({ profileId }: { profileId: string }) {
  const profile = KNOWLEDGE_OBJECT_PROFILES.find((p) => p.id === profileId);
  if (!profile) {
    return <p style={khCaption}>PROFILE NOT FOUND</p>;
  }
  return <KnowledgeProfileView profile={profile} />;
}

export function KnowledgeHubWorkflowPage({ workflowId }: { workflowId: string }) {
  const navigate = useNavigate();
  const { openModuleManual } = useStudioInteractiveManual();
  const wf = KNOWLEDGE_WORKFLOW_GUIDES.find((w) => w.id === workflowId);
  if (!wf) return <p style={khCaption}>WORKFLOW NOT FOUND</p>;

  const relatedModule = wf.relatedModules[0];

  return (
    <div>
      <p style={{ ...khCaption, color: KH_VISUAL.red }}>WORKFLOW GUIDE</p>
      <p style={{ ...khSectionTitle, fontSize: '12px' }}>{wf.title}</p>
      <p style={khCaption}>{wf.subtitle}</p>
      {relatedModule ? (
        <button
          type="button"
          onClick={() => openModuleManual(relatedModule)}
          style={{ ...khActionBtn, marginBottom: '12px', color: KH_VISUAL.red }}
        >
          OPEN INTERACTIVE WALKTHROUGH
        </button>
      ) : null}
      <ol style={{ margin: '12px 0', paddingLeft: '18px' }}>
        {wf.steps.map((step, i) => (
          <li key={step.title} style={{ marginBottom: '10px' }}>
            <p style={{ ...khCaption, color: KH_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>
              {i + 1}. {step.title}
            </p>
            <p style={khCaption}>{step.detail}</p>
            {step.route ? (
              <button type="button" onClick={() => navigate(step.route!)} style={{ ...khActionBtn, marginTop: '4px' }}>
                GO TO STEP
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
