import type { PhotographyBiblePromptValidation } from '../../../../studio-os/product-photography/ProductAssetFactory';
import { PP_VISUAL, ppCaption, ppSectionTitle } from '../product-photography-bible/photographyBibleTheme';

type PhotographyBiblePromptValidationPanelProps = {
  validation?: PhotographyBiblePromptValidation;
  compact?: boolean;
};

export function PhotographyBiblePromptValidationPanel({
  validation,
  compact = false,
}: PhotographyBiblePromptValidationPanelProps) {
  if (!validation) {
    return (
      <div className="p-2 mt-2" style={{ border: `1px dashed ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
        <p style={{ ...ppCaption, fontSize: '7px' }}>
          PROMPT VALIDATION · AWAITING GENERATION · LOCKED PHOTOGRAPHY BIBLE COMPILES ON GENERATE
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-2 mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2"
      style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.85)' }}
    >
      <p style={{ ...ppSectionTitle, color: PP_VISUAL.red, gridColumn: '1 / -1' }}>
        PHOTOGRAPHY BIBLE PROMPT VALIDATION
      </p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>
        PROMPT LOCKED · {validation.promptLocked ? 'YES' : 'NO'}
      </p>
      <p style={{ ...ppCaption, fontSize: '7px', wordBreak: 'break-all' }}>
        PROMPT HASH · {validation.promptHash}
      </p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>
        PHOTOGRAPHY BIBLE VERSION · {validation.photographyBibleVersion.toUpperCase()}
      </p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>
        CREATIVE DNA · v{validation.creativeDnaVersion}
      </p>
      {!compact ? (
        <p style={{ ...ppCaption, fontSize: '6px', gridColumn: '1 / -1', textTransform: 'none' }}>
          VARIABLE INJECTION · {validation.variableInjectionSummary}
        </p>
      ) : null}
      <div style={{ gridColumn: compact ? undefined : '1 / -1' }}>
        <p style={{ ...ppCaption, fontSize: '6px', color: PP_VISUAL.red }}>VARIABLES CHANGED</p>
        <p style={{ ...ppCaption, fontSize: '6px' }}>{validation.variablesChanged.join(' · ')}</p>
      </div>
      <div style={{ gridColumn: compact ? undefined : '1 / -1' }}>
        <p style={{ ...ppCaption, fontSize: '6px' }}>VARIABLES REMAINING LOCKED</p>
        <p style={{ ...ppCaption, fontSize: '6px' }}>{validation.variablesRemainingLocked.join(' · ')}</p>
      </div>
    </div>
  );
}
