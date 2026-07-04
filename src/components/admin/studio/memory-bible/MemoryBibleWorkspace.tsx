import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStudioMemoryBible } from '../../../../hooks/useAdminStudioMemoryBibleState';
import {
  MEMORY_BIBLE_SECTIONS,
  MEMORY_BIBLE_SUBTITLE,
  searchMemoryBible,
} from '../../../../utils/adminStudioMemoryBibleDemo';
import { adminStudioKnowledgeHubPath } from '../../../../utils/adminStudioRoutes';
import { useStudioInteractiveManual } from '../../../../studio-interactive-manual';
import { MemoryBibleContextBuilder } from './MemoryBibleContextBuilder';
import { MB_VISUAL, mbActionBtn, mbCaption, mbPanelStyle, mbSectionTitle } from './memoryBibleTheme';

type TabId = (typeof MEMORY_BIBLE_SECTIONS)[number]['id'];

function RuleList({ rules }: { rules: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {rules.map((r) => (
        <li key={r} style={{ ...mbCaption, fontSize: '8px', marginBottom: 4, textTransform: 'none' }}>
          {r}
        </li>
      ))}
    </ul>
  );
}

export function MemoryBibleWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('founder-profile');
  const [query, setQuery] = useState('');
  const { snapshot, savedPackages, exportHistory, decisionCount, namingCount, updateFounderNotes, buildPackage, savePackage, recordExport } =
    useAdminStudioMemoryBible();
  const { openModuleManual } = useStudioInteractiveManual();

  const searchHits = useMemo(() => searchMemoryBible(query, snapshot), [query, snapshot]);

  const renderSection = () => {
    switch (tab) {
      case 'founder-profile':
        return (
          <div style={{ ...mbPanelStyle, padding: '12px' }}>
            <p style={mbSectionTitle}>FOUNDER PROFILE · INTERNAL ONLY</p>
            <p style={{ ...mbCaption, marginBottom: 8 }}>Preferred name · {snapshot.founderProfile.preferredName}</p>
            <p style={mbCaption}>Companies · {snapshot.founderProfile.activeCompanies.join(' · ')}</p>
            <p style={mbCaption}>Workspaces · {snapshot.founderProfile.activeWorkspaces.join(' · ')}</p>
            <p style={{ ...mbSectionTitle, marginTop: 12 }}>CURRENT PRIORITIES</p>
            <RuleList rules={snapshot.founderProfile.currentPriorityProjects} />
            <p style={{ ...mbSectionTitle, marginTop: 12 }}>LONG-TERM GOALS</p>
            <RuleList rules={snapshot.founderProfile.longTermGoals} />
            <p style={{ ...mbSectionTitle, marginTop: 12 }}>TOOLS & STYLE</p>
            <RuleList rules={[...snapshot.founderProfile.preferredTools, ...snapshot.founderProfile.workingStyle]} />
            <p style={{ ...mbSectionTitle, marginTop: 12 }}>FOUNDER NOTES</p>
            <textarea
              value={snapshot.founderProfile.founderNotes}
              onChange={(e) => updateFounderNotes(e.target.value)}
              rows={4}
              style={{ ...mbCaption, width: '100%', padding: 8, border: MB_VISUAL.border, textTransform: 'none', fontSize: '8px' }}
            />
          </div>
        );
      case 'communication-style':
        return (
          <div style={{ ...mbPanelStyle, padding: '12px' }}>
            <p style={mbSectionTitle}>{snapshot.communicationStyle.title.toUpperCase()}</p>
            <RuleList rules={snapshot.communicationStyle.rules} />
          </div>
        );
      case 'writing-rules':
        return (
          <div style={{ ...mbPanelStyle, padding: '12px' }}>
            <p style={mbSectionTitle}>{snapshot.writingRules.title.toUpperCase()}</p>
            <RuleList rules={snapshot.writingRules.rules} />
            {snapshot.writingRules.notes ? <p style={{ ...mbCaption, marginTop: 8 }}>{snapshot.writingRules.notes}</p> : null}
          </div>
        );
      case 'cursor-prompt-standards':
        return (
          <div style={{ ...mbPanelStyle, padding: '12px' }}>
            <p style={mbSectionTitle}>{snapshot.cursorPromptStandards.title.toUpperCase()}</p>
            <RuleList rules={snapshot.cursorPromptStandards.rules} />
          </div>
        );
      case 'design-philosophy':
        return (
          <div style={{ ...mbPanelStyle, padding: '12px' }}>
            <p style={mbSectionTitle}>{snapshot.designPhilosophy.title.toUpperCase()}</p>
            <RuleList rules={snapshot.designPhilosophy.rules} />
          </div>
        );
      case 'engineering-philosophy':
        return (
          <div style={{ ...mbPanelStyle, padding: '12px' }}>
            <p style={mbSectionTitle}>{snapshot.engineeringPhilosophy.title.toUpperCase()}</p>
            <RuleList rules={snapshot.engineeringPhilosophy.rules} />
          </div>
        );
      case 'brand-philosophy':
        return (
          <div style={{ ...mbPanelStyle, padding: '12px' }}>
            <p style={mbSectionTitle}>{snapshot.brandPhilosophy.title.toUpperCase()}</p>
            <RuleList rules={snapshot.brandPhilosophy.rules} />
          </div>
        );
      case 'naming-bible':
        return (
          <div>
            {snapshot.namingBible.map((n) => (
              <div key={n.id} style={{ ...mbPanelStyle, padding: '10px', marginBottom: 8 }}>
                <p style={{ ...mbCaption, color: MB_VISUAL.red }}>{n.officialName.toUpperCase()}</p>
                {n.deprecatedNames.length ? (
                  <p style={{ ...mbCaption, fontSize: '7px' }}>DEPRECATED · {n.deprecatedNames.join(' · ')}</p>
                ) : null}
                <p style={{ ...mbCaption, fontSize: '7px', textTransform: 'none' }}>{n.usageNotes}</p>
                <p style={{ ...mbCaption, fontSize: '6px' }}>MODULES · {n.relatedModules.join(' · ')}</p>
              </div>
            ))}
          </div>
        );
      case 'decision-log':
        return (
          <div>
            {snapshot.decisionLog.map((d) => (
              <div key={d.id} style={{ ...mbPanelStyle, padding: '10px', marginBottom: 8 }}>
                <p style={{ ...mbCaption, color: MB_VISUAL.red }}>{d.title.toUpperCase()}</p>
                <p style={mbCaption}>
                  {d.date} · {d.workspace.toUpperCase()} · {d.relatedModule} · {d.status.toUpperCase()}
                </p>
                <p style={{ ...mbCaption, fontSize: '7px', textTransform: 'none' }}>
                  <strong>Decision:</strong> {d.decision}
                </p>
                <p style={{ ...mbCaption, fontSize: '7px', textTransform: 'none' }}>
                  <strong>Reason:</strong> {d.reason}
                </p>
                {d.alternativesConsidered.length ? (
                  <p style={{ ...mbCaption, fontSize: '6px' }}>ALT · {d.alternativesConsidered.join(' · ')}</p>
                ) : null}
                <p style={{ ...mbCaption, fontSize: '6px' }}>OUTCOME · {d.outcome}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {d.relatedManualChapter ? (
                    <button
                      type="button"
                      style={{ ...mbActionBtn, fontSize: '6px' }}
                      onClick={() => openModuleManual('memory-bible')}
                    >
                      VIEW MANUAL · {d.relatedManualChapter}
                    </button>
                  ) : null}
                  {d.relatedGraphNodeIds.map((nodeId) => (
                    <button
                      key={nodeId}
                      type="button"
                      style={{ ...mbActionBtn, fontSize: '6px' }}
                      onClick={() => navigate(`${adminStudioKnowledgeHubPath()}?graph=${nodeId}`)}
                    >
                      VIEW GRAPH · {nodeId.replace('node-', '').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'ai-preferences':
        return (
          <div style={{ ...mbPanelStyle, padding: '12px' }}>
            <p style={mbSectionTitle}>AI PREFERENCES</p>
            <p style={mbCaption}>TONE · {snapshot.aiPreferences.defaultTone}</p>
            <p style={{ ...mbSectionTitle, marginTop: 10 }}>DEFAULTS</p>
            <RuleList rules={snapshot.aiPreferences.contextPackageDefaults} />
            <p style={{ ...mbSectionTitle, marginTop: 10 }}>AGENT ONBOARDING</p>
            <RuleList rules={snapshot.aiPreferences.agentOnboardingChecklist} />
            <p style={{ ...mbSectionTitle, marginTop: 10 }}>DO NOT</p>
            <RuleList rules={snapshot.aiPreferences.doNotRules} />
          </div>
        );
      case 'workspace-memory':
        return (
          <div>
            {snapshot.workspaceMemory.map((w) => (
              <div key={w.workspaceId} style={{ ...mbPanelStyle, padding: '10px', marginBottom: 8 }}>
                <p style={{ ...mbCaption, color: MB_VISUAL.red }}>{w.workspaceLabel.toUpperCase()}</p>
                <p style={{ ...mbCaption, fontSize: '7px', textTransform: 'none' }}>{w.summary}</p>
                <RuleList rules={w.pillars} />
                <p style={{ ...mbCaption, fontSize: '6px', marginTop: 6 }}>MODULES · {w.relatedModules.join(' · ')}</p>
              </div>
            ))}
          </div>
        );
      case 'context-builder':
        return (
          <MemoryBibleContextBuilder
            buildPackage={buildPackage}
            onSavePackage={savePackage}
            onRecordExport={recordExport}
          />
        );
      case 'export-history':
        return (
          <div>
            {exportHistory.length === 0 && savedPackages.length === 0 ? (
              <p style={mbCaption}>NO EXPORTS YET — GENERATE A CONTEXT PACKAGE</p>
            ) : null}
            {exportHistory.map((e) => (
              <div key={e.id} style={{ ...mbPanelStyle, padding: '8px', marginBottom: 6 }}>
                <p style={mbCaption}>
                  {e.exportedAt.slice(0, 19)} · {e.target.toUpperCase()} · {e.label}
                </p>
              </div>
            ))}
            {savedPackages.length ? (
              <>
                <p style={{ ...mbSectionTitle, marginTop: 12 }}>SAVED PACKAGES</p>
                {savedPackages.map((p) => (
                  <div key={p.id} style={{ ...mbPanelStyle, padding: '8px', marginBottom: 6 }}>
                    <p style={mbCaption}>{p.shortSummary}</p>
                    <p style={{ ...mbCaption, fontSize: '6px' }}>{p.createdAt.slice(0, 19)}</p>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        );
      case 'version-history':
        return (
          <div>
            {snapshot.versionHistory.map((v) => (
              <div key={v.version} style={{ ...mbPanelStyle, padding: '10px', marginBottom: 8 }}>
                <p style={{ ...mbCaption, color: MB_VISUAL.red }}>
                  {v.label.toUpperCase()} · {v.status.toUpperCase()}
                </p>
                <p style={mbCaption}>
                  {v.effectiveDate} · {v.updatedBy}
                </p>
                <p style={{ ...mbCaption, fontSize: '7px', textTransform: 'none' }}>{v.notes}</p>
                <RuleList rules={v.changeSummary} />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="memory-bible-root pb-6">
      <section style={{ ...mbPanelStyle, padding: '12px', marginBottom: 12, borderTop: `2px solid ${MB_VISUAL.red}` }}>
        <p style={{ ...mbCaption, color: MB_VISUAL.red }}>MEMORY BIBLE · v{snapshot.version}</p>
        <p style={{ ...mbCaption, fontSize: '7px' }}>{MEMORY_BIBLE_SUBTITLE}</p>
        <p style={{ ...mbCaption, marginTop: 8 }}>
          {namingCount} OFFICIAL NAMES · {decisionCount} DECISIONS · NOT CHAT HISTORY — CURATED INSTITUTIONAL KNOWLEDGE
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" style={mbActionBtn} onClick={() => navigate(adminStudioKnowledgeHubPath())}>
            OPEN INTERACTIVE MANUAL
          </button>
          <button type="button" style={mbActionBtn} onClick={() => setTab('context-builder')}>
            AI CONTEXT BUILDER
          </button>
        </div>
      </section>

      <div style={{ ...mbPanelStyle, padding: '10px', marginBottom: 12 }}>
        <input
          type="search"
          placeholder="SEARCH MEMORY BIBLE…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...mbCaption, width: '100%', padding: 8, border: MB_VISUAL.border }}
        />
        {searchHits.length ? (
          <div className="mt-2">
            {searchHits.map((h) => (
              <p key={h} style={{ ...mbCaption, fontSize: '7px' }}>
                {h}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {MEMORY_BIBLE_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id)}
            style={{
              ...mbActionBtn,
              fontSize: '7px',
              background: tab === s.id ? MB_VISUAL.red : 'rgba(255,255,255,0.85)',
              color: tab === s.id ? '#fff' : MB_VISUAL.black,
              borderColor: tab === s.id ? MB_VISUAL.red : '#000',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {renderSection()}
    </div>
  );
}
