import { useStudioKnowledge } from '../../../../contexts/StudioKnowledgeContext';
import { KH_VISUAL, khActionBtn, khCaption, khPanelStyle } from './knowledgeHubTheme';

/** Optional contextual help — does not interrupt; dismissible. */
export function KnowledgeContextualHint() {
  const { showContextualHint, pageGuide, openPanel, dismissContextualHint } = useStudioKnowledge();

  if (!showContextualHint || !pageGuide?.contextualHint) return null;

  return (
    <div style={{ ...khPanelStyle, padding: '8px', marginBottom: '10px', borderColor: KH_VISUAL.warn }}>
      <p style={{ ...khCaption, color: KH_VISUAL.black }}>{pageGuide.contextualHint}</p>
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={openPanel} style={khActionBtn}>
          LEARN THIS PAGE
        </button>
        <button type="button" onClick={dismissContextualHint} style={khActionBtn}>
          DISMISS
        </button>
      </div>
    </div>
  );
}
