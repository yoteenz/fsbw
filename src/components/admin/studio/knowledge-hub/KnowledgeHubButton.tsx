import { useStudioKnowledge } from '../../../../contexts/StudioKnowledgeContext';
import { useStudioInteractiveManual } from '../../../../studio-interactive-manual';
import { KH_VISUAL, khActionBtn } from './knowledgeHubTheme';

type KnowledgeHubButtonProps = {
  compact?: boolean;
};

/** Universal ⓘ — launches Interactive Manual walkthrough for this module. */
export function KnowledgeHubButton({ compact }: KnowledgeHubButtonProps) {
  const { pageGuide } = useStudioKnowledge();
  const { openModuleManual, isManualActive } = useStudioInteractiveManual();

  return (
    <span data-studio-manual="info-button" style={{ display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => openModuleManual(pageGuide?.moduleId)}
        aria-label="Open Interactive Manual"
        aria-pressed={isManualActive}
        title="Interactive Manual"
        style={{
          ...khActionBtn,
          flexShrink: 0,
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isManualActive ? KH_VISUAL.red : KH_VISUAL.black,
          borderColor: isManualActive ? KH_VISUAL.red : '#000',
        }}
      >
        <span style={{ fontSize: compact ? '14px' : '16px', lineHeight: 1 }}>ⓘ</span>
      </button>
    </span>
  );
}
