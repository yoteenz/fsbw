import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { resolveV3WorkbenchTools } from '../registry/v3-workbench-registry';
import { ExperienceLabIcon } from '../../icons/ExperienceLabIcon';

function splitLabel(label: string): [string, string | null] {
  const parts = label.split(' ');
  if (parts.length <= 1) return [label, null];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ')];
}

/** Context-aware workbench — tool set swaps with active workspace. */
export function V3ContextAwareWorkbench() {
  const { state, setWorkbenchTool } = useExperienceLabV3Store();
  const tools = resolveV3WorkbenchTools(state.activeWorkspace);

  return (
    <section
      className="elab-v3-workbench"
      {...{ [ELAB_V3_COMPOSITION.contextWorkbench]: '' }}
      aria-label="Context-aware workbench"
    >
      <div className="elab-v3-workbench__head">
        <h2 className="elab-v3-workbench__title">WORKBENCH · {state.activeWorkspace.toUpperCase()}</h2>
      </div>
      <div className="elab-v3-workbench__tools" role="toolbar">
        {tools.map((tool) => {
          const [line1, line2] = splitLabel(tool.label);
          const isActive = state.activeWorkbenchTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              className={`elab-v3-workbench__tool${isActive ? ' is-active' : ''}`}
              aria-pressed={isActive}
              title={tool.label}
              onClick={() => setWorkbenchTool(isActive ? null : tool.id)}
            >
              <span className="elab-v3-workbench__tool-icon" aria-hidden>
                <ExperienceLabIcon name={tool.icon} size="md" decorative active={isActive} />
              </span>
              <span className="elab-v3-workbench__tool-label">
                <span>{line1}</span>
                {line2 ? <span>{line2}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="elab-v3-workbench__orb" aria-hidden>
        <span className="elab-v3-workbench__orb-core" />
      </div>
    </section>
  );
}
