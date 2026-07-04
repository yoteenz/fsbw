import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useStudioKnowledge } from '../../../../contexts/StudioKnowledgeContext';
import { useStudioInteractiveManual } from '../../../../studio-interactive-manual';
import {
  getModuleGraphEntry,
  relationLabel,
} from '../../../../studio-interactive-manual/knowledge-graph/queries';
import { markGraphNodeVisited, markManualChapterViewed } from '../../../../studio-interactive-manual/progressStorage';
import { adminStudioKnowledgeHubPath } from '../../../../utils/adminStudioRoutes';
import { STUDIO_OS_UPPERCASE_CLASS } from '../../../../utils/adminStudioTheme';
import { ManualWorkflowStrip } from '../../../../studio-interactive-manual/components/ManualWorkflowStrip';
import { KH_VISUAL, khActionBtn, khCaption, khPanelStyle, khSectionTitle } from './knowledgeHubTheme';

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: '14px' }}>
      {items.map((item) => (
        <li key={item} style={{ ...khCaption, color: KH_VISUAL.black, marginBottom: '4px' }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Knowledge Graph entry — ⓘ opens overview + layered actions (not a disconnected info panel). */
export function KnowledgeGraphEntryPanel() {
  const navigate = useNavigate();
  const { panelOpen, closePanel, pageGuide, markCurrentPageRead } = useStudioKnowledge();
  const { openModuleManual, openSearchModal } = useStudioInteractiveManual();
  const [showConnected, setShowConnected] = useState(false);
  const [showWorkflows, setShowWorkflows] = useState(false);

  const moduleId = pageGuide?.moduleId;
  const graphEntry = useMemo(
    () => (moduleId ? getModuleGraphEntry(moduleId) : undefined),
    [moduleId]
  );

  useEffect(() => {
    if (!panelOpen) return;
    markCurrentPageRead();
    if (moduleId) markGraphNodeVisited(moduleId);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [panelOpen, closePanel, markCurrentPageRead, moduleId]);

  if (!panelOpen || typeof document === 'undefined') return null;

  const guide = pageGuide;
  const overview = graphEntry?.moduleNode.description ?? guide?.purpose ?? 'studio os module';
  const chapter = graphEntry?.manualChapter ?? guide?.ownersManualChapter;

  return createPortal(
    <div
      className={`fixed inset-0 flex justify-end ${STUDIO_OS_UPPERCASE_CLASS}`}
      style={{ zIndex: 10002 }}
      role="dialog"
      aria-modal="true"
      aria-label="Knowledge Graph entry"
    >
      <button
        type="button"
        className="flex-1"
        style={{ background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer' }}
        onClick={closePanel}
        aria-label="Close"
      />
      <div
        className="h-full overflow-y-auto"
        style={{
          ...khPanelStyle,
          width: 'min(100%, 380px)',
          maxWidth: '100vw',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ padding: '16px' }}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p style={{ ...khCaption, color: KH_VISUAL.red }}>INTERACTIVE MANUAL · KNOWLEDGE GRAPH</p>
              <p style={{ ...khSectionTitle, fontSize: '12px' }}>{guide?.title ?? graphEntry?.moduleNode.name ?? 'STUDIO OS'}</p>
            </div>
            <button type="button" onClick={closePanel} style={khActionBtn}>
              CLOSE
            </button>
          </div>

          <section className="mb-3">
            <p style={khSectionTitle}>LEVEL 1 · OVERVIEW</p>
            <p style={{ ...khCaption, color: KH_VISUAL.black }}>{overview}</p>
            {graphEntry?.moduleNode.purpose ? (
              <p style={{ ...khCaption, marginTop: '6px' }}>{graphEntry.moduleNode.purpose}</p>
            ) : null}
          </section>

          <div className="flex flex-col gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                closePanel();
                openModuleManual(moduleId);
              }}
              style={{ ...khActionBtn, background: KH_VISUAL.red, color: '#fff', borderColor: KH_VISUAL.red }}
            >
              START WALKTHROUGH
            </button>
            <button
              type="button"
              onClick={() => setShowWorkflows((v) => !v)}
              style={khActionBtn}
            >
              {showWorkflows ? 'HIDE' : 'VIEW'} RELATED WORKFLOWS
            </button>
            <button
              type="button"
              onClick={() => {
                if (chapter) markManualChapterViewed(chapter);
                navigate(adminStudioKnowledgeHubPath());
              }}
              style={{ ...khActionBtn, color: KH_VISUAL.red }}
            >
              OPEN WRITTEN MANUAL CHAPTER
            </button>
            <button type="button" onClick={() => setShowConnected((v) => !v)} style={khActionBtn}>
              {showConnected ? 'HIDE' : 'SHOW'} CONNECTED MODULES
            </button>
            <button type="button" onClick={openSearchModal} style={khActionBtn}>
              SEARCH MANUAL
            </button>
          </div>

          {showWorkflows && graphEntry?.workflows.length ? (
            <section className="mb-3">
              <p style={khSectionTitle}>WORKFLOW MAPS</p>
              {graphEntry.workflows.map((wf) => (
                <div key={wf.id} style={{ marginBottom: '10px' }}>
                  <p style={{ ...khCaption, color: KH_VISUAL.red }}>{wf.title}</p>
                  {wf.subtitle ? <p style={khCaption}>{wf.subtitle}</p> : null}
                  <ManualWorkflowStrip nodes={wf.nodeIds.map((id) => id.replace(/-/g, ' ').toUpperCase())} />
                </div>
              ))}
            </section>
          ) : null}

          {showConnected && graphEntry?.connected.length ? (
            <section className="mb-3">
              <p style={khSectionTitle}>CONNECTED MODULES</p>
              {graphEntry.connected.map(({ node, relation, label }) => (
                <button
                  key={`${node.id}-${relation}`}
                  type="button"
                  onClick={() => {
                    if (node.moduleId || node.type === 'module') {
                      closePanel();
                      openModuleManual(node.moduleId ?? node.id);
                    } else if (node.route) {
                      navigate(node.route);
                      closePanel();
                    }
                  }}
                  style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left', marginBottom: '4px' }}
                >
                  {node.name}
                  <span style={{ display: 'block', ...khCaption, fontSize: '8px' }}>
                    {label ?? relationLabel(relation)}
                  </span>
                </button>
              ))}
            </section>
          ) : null}

          {guide ? (
            <>
              <section className="mb-3">
                <p style={khSectionTitle}>BEST PRACTICES</p>
                <BulletList items={guide.bestPractices} />
              </section>
              <section className="mb-3">
                <p style={khSectionTitle}>COMMON MISTAKES</p>
                <BulletList items={guide.commonMistakes} />
              </section>
              {chapter ? (
                <p style={{ ...khCaption, color: '#808080' }}>
                  WRITTEN MANUAL · {chapter}
                  {graphEntry?.moduleNode.manualAnchor ? ` · #${graphEntry.moduleNode.manualAnchor}` : ''}
                </p>
              ) : null}
            </>
          ) : (
            <p style={khCaption}>No page guide yet — explore the Knowledge Graph from Interactive Manual hub.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/** @deprecated Use KnowledgeGraphEntryPanel — kept as alias for existing imports. */
export const KnowledgePanel = KnowledgeGraphEntryPanel;
