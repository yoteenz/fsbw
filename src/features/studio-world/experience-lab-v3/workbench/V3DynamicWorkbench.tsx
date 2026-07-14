import { resolveV3WorkbenchTools } from '../registry/v3-workbench-registry';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

/** Tool launcher — opens contextual inspector, does not duplicate information. */
export function V3DynamicWorkbench() {
  const { state, setWorkbenchTool } = useExperienceLabV3Store();
  const tools = resolveV3WorkbenchTools(state.workspace.departmentId);

  return (
    <nav className="elab-v3-workbench" data-elab-v3-workbench aria-label="Workbench tools">
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className={`elab-v3-workbench__btn${state.activeWorkbenchTool === tool.id ? ' is-active' : ''}`}
          onClick={() => setWorkbenchTool(tool.id)}
          title={tool.description}
        >
          <span className="elab-v3-workbench__label">{tool.label}</span>
        </button>
      ))}
    </nav>
  );
}
