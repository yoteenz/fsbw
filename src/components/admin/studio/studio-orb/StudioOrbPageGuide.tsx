import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveManualModuleIdForPath, getManualDefinitionForModule } from '../../../../studio-interactive-manual/buildFromKnowledge';
import { getModuleGraphEntry } from '../../../../studio-interactive-manual/knowledge-graph/queries';
import { resolveOrbPersonalityForPath } from '../../../../studio-os-core/studio-world/orb-personality';
import { conversationDockPanelStyle, orbBody, orbGrace, orbLabel, ORB_VISUAL } from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';
import { useOrganizationContextOptional } from '../../../../studio-os-core/organization-context';

/** Contextual Page Guide — purpose · systems · next steps from Knowledge Graph. */
export function StudioOrbPageGuide() {
  const { pathname } = useLocation();
  const { activeSurface, closeSurface } = useStudioOrb();
  const org = useOrganizationContextOptional();

  const guide = useMemo(() => {
    const moduleId = resolveManualModuleIdForPath(pathname);
    const definition = moduleId ? getManualDefinitionForModule(moduleId) : undefined;
    const graph = moduleId ? getModuleGraphEntry(moduleId) : undefined;
    const personality = resolveOrbPersonalityForPath(pathname);
    return { moduleId, definition, graph, personality };
  }, [pathname]);

  if (activeSurface !== 'page-guide') return null;

  const title = guide.definition?.customerName ?? guide.graph?.moduleNode.name ?? 'THIS PAGE';
  const purpose = guide.definition?.description ?? guide.graph?.moduleNode.purpose ?? guide.graph?.moduleNode.description ?? 'Studio OS contextual workspace.';
  const steps = guide.definition?.nodes.slice(0, 4).map((n) => n.title) ?? [];

  return (
    <div
      className="studio-conversation-dock-panel fixed left-1/2 z-[100055] pointer-events-auto"
      style={{
        ...conversationDockPanelStyle,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(92vw, 400px)',
        maxHeight: 'min(70vh, 520px)',
        overflow: 'auto',
        padding: '16px 18px',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Page Guide"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p style={{ ...orbLabel, color: ORB_VISUAL.champagne, margin: 0 }}>STUDIO ORB · PAGE GUIDE</p>
          <p style={{ ...orbGrace, margin: '6px 0 0', fontSize: '14px' }}>{title}</p>
        </div>
        <button type="button" onClick={closeSurface} style={{ ...orbLabel, cursor: 'pointer', border: 'none', background: 'none' }}>
          CLOSE
        </button>
      </div>

      <p style={{ ...orbLabel, margin: '12px 0 4px' }}>PURPOSE</p>
      <p style={{ ...orbBody, margin: 0 }}>{purpose}</p>

      {guide.personality ? (
        <>
          <p style={{ ...orbLabel, margin: '12px 0 4px' }}>STUDIO ORB · {guide.personality.role.toUpperCase()}</p>
          <p style={{ ...orbBody, margin: 0 }}>{guide.personality.guidance}</p>
        </>
      ) : null}

      {org ? (
        <>
          <p style={{ ...orbLabel, margin: '12px 0 4px' }}>ORGANIZATION</p>
          <p style={{ ...orbBody, margin: 0 }}>{org.organizationName}</p>
        </>
      ) : null}

      {guide.graph?.workflows.length ? (
        <>
          <p style={{ ...orbLabel, margin: '12px 0 4px' }}>RELATED WORKFLOWS</p>
          {guide.graph.workflows.slice(0, 3).map((w) => (
            <p key={w.id} style={{ ...orbBody, fontSize: '7px', margin: '4px 0 0' }}>
              · {w.title}
            </p>
          ))}
        </>
      ) : null}

      {steps.length ? (
        <>
          <p style={{ ...orbLabel, margin: '12px 0 4px' }}>RECOMMENDED NEXT STEPS</p>
          {steps.map((step) => (
            <p key={step} style={{ ...orbBody, fontSize: '7px', margin: '4px 0 0' }}>
              · {step}
            </p>
          ))}
        </>
      ) : null}

      <p style={{ ...orbLabel, margin: '14px 0 0', color: ORB_VISUAL.gold }}>
        STUDIO INTELLIGENCE ALREADY KNOWS THIS PAGE · {pathname.split('/').pop()?.replace(/-/g, ' ').toUpperCase()}
      </p>
    </div>
  );
}
