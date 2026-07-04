import { useStudioInteractiveManual } from '../StudioInteractiveManualContext';

/** Learn This Workspace — opens page walkthrough without full manual replay. */
export function ManualWorkspaceHelpButton() {
  const { isManualActive, openWorkspaceHelp } = useStudioInteractiveManual();

  if (isManualActive) return null;

  return (
    <button
      type="button"
      onClick={openWorkspaceHelp}
      aria-label="Learn this workspace"
      title="Learn this workspace"
      style={{
        position: 'fixed',
        zIndex: 99990,
        right: '14px',
        bottom: 'max(24px, env(safe-area-inset-bottom))',
        fontFamily: '"Futura PT Medium"',
        fontSize: '9px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '8px 10px',
        borderRadius: '4px',
        border: '1.3px solid #0a0a0a',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(10px)',
        color: '#EB1C24',
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      }}
    >
      LEARN THIS WORKSPACE
    </button>
  );
}
