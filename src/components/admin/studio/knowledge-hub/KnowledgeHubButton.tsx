import { useStudioKnowledge } from '../../../../contexts/StudioKnowledgeContext';
import { KH_VISUAL, khActionBtn } from './knowledgeHubTheme';

type KnowledgeHubButtonProps = {
  compact?: boolean;
};

/** Universal ⓘ — opens Knowledge Graph entry (overview + walkthrough options). */
export function KnowledgeHubButton({ compact }: KnowledgeHubButtonProps) {
  const { togglePanel, panelOpen } = useStudioKnowledge();

  return (
    <span data-studio-manual="info-button" style={{ display: 'inline-flex' }}>
      <button
        type="button"
        onClick={togglePanel}
        aria-label="Open Interactive Manual"
        aria-pressed={panelOpen}
        title="Interactive Manual · Knowledge Graph"
        style={{
          ...khActionBtn,
          flexShrink: 0,
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: panelOpen ? KH_VISUAL.red : KH_VISUAL.black,
          borderColor: panelOpen ? KH_VISUAL.red : '#000',
        }}
      >
        <span style={{ fontSize: compact ? '14px' : '16px', lineHeight: 1 }}>ⓘ</span>
      </button>
    </span>
  );
}
