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
import { KnowledgeProfileView } from './KnowledgeProfileView';
import { KH_VISUAL, khActionBtn, khCaption, khPanelStyle, khSectionTitle } from './knowledgeHubTheme';

export function KnowledgeHubWorkspace() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { executiveNotes, setExecutiveNotes, unreadGuideCount } = useAdminStudioKnowledgeHub();

  const hits = useMemo(() => searchKnowledgeHub(query), [query]);
  const stats = KNOWLEDGE_MISSION_STATS;

  return (
    <div className="knowledge-hub-root pb-6">
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
  const wf = KNOWLEDGE_WORKFLOW_GUIDES.find((w) => w.id === workflowId);
  if (!wf) return <p style={khCaption}>WORKFLOW NOT FOUND</p>;

  return (
    <div>
      <p style={{ ...khCaption, color: KH_VISUAL.red }}>WORKFLOW GUIDE</p>
      <p style={{ ...khSectionTitle, fontSize: '12px' }}>{wf.title}</p>
      <p style={khCaption}>{wf.subtitle}</p>
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
