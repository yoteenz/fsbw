import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

const SUGGESTIONS = [
  'Why is this blocked?',
  'Generate another revision',
  'Compare Dark 02',
  'Show failed jobs',
  'Explain cost',
  'Retry render',
];

/** Studio AI — permanently docked in V3. */
export function V3StudioAiAssistantDock() {
  const { state, dispatch } = useExperienceLabV3Store();

  return (
    <aside
      className={`elab-v3-assistant${state.assistantOpen ? ' is-open' : ''}`}
      data-elab-v3-ai-assistant
    >
      <button
        type="button"
        className="elab-v3-assistant__toggle"
        onClick={() => dispatch({ type: 'SET_ASSISTANT', open: !state.assistantOpen })}
      >
        Studio AI
      </button>
      {state.assistantOpen && (
        <div className="elab-v3-assistant__panel">
          <p className="elab-v3-assistant__intro">
            Operational assistant for {state.workspace.departmentLabel} · R{state.workspace.revision}
          </p>
          <ul className="elab-v3-assistant__suggestions">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button type="button">{s}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
