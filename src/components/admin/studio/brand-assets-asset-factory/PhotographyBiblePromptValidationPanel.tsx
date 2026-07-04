import type { PhotographyBiblePromptValidation } from '../../../../studio-os/product-photography/ProductAssetFactory';
import { PP_VISUAL, ppActionBtn, ppCaption, ppSectionTitle } from '../product-photography-bible/photographyBibleTheme';

type PhotographyBiblePromptValidationPanelProps = {
  validation?: PhotographyBiblePromptValidation;
  compact?: boolean;
  onViewFinalPrompt?: () => void;
};

export function PhotographyBiblePromptValidationPanel({
  validation,
  compact = false,
  onViewFinalPrompt,
}: PhotographyBiblePromptValidationPanelProps) {
  if (!validation) {
    return (
      <div className="p-2 mt-2" style={{ border: `1px dashed ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
        <p style={{ ...ppCaption, fontSize: '7px' }}>
          CREATIVE DNA VALIDATOR · AWAITING COMPILE · LOCKED TEMPLATE + PLACEHOLDER SUBSTITUTION ONLY
        </p>
      </div>
    );
  }

  const passed = validation.validatorStatus === 'passed';

  return (
    <div
      className="p-2 mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2"
      style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.85)' }}
    >
      <p style={{ ...ppSectionTitle, color: PP_VISUAL.red, gridColumn: '1 / -1' }}>
        CREATIVE DNA · PHOTOGRAPHY BIBLE VALIDATION
      </p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>
        CREATIVE DNA · V{validation.creativeDnaVersion}
      </p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>
        PHOTOGRAPHY BIBLE · {validation.photographyBibleVersion.toUpperCase()}
      </p>
      <p style={{ ...ppCaption, fontSize: '7px', wordBreak: 'break-all' }}>
        LOCKED TEMPLATE HASH · {validation.lockedTemplateHash}
      </p>
      <p style={{ ...ppCaption, fontSize: '7px', color: passed ? '#16a34a' : PP_VISUAL.red }}>
        VALIDATOR STATUS · {validation.validatorStatus.toUpperCase()}
      </p>
      <p style={{ ...ppCaption, fontSize: '6px', gridColumn: '1 / -1' }}>
        {validation.finalPromptStatus}
      </p>
      {!compact ? (
        <p style={{ ...ppCaption, fontSize: '6px', gridColumn: '1 / -1' }}>
          {validation.variableInjectionSummary}
        </p>
      ) : null}
      <div style={{ gridColumn: compact ? undefined : '1 / -1' }}>
        <p style={{ ...ppCaption, fontSize: '6px', color: PP_VISUAL.red }}>APPROVED PLACEHOLDERS</p>
        <p style={{ ...ppCaption, fontSize: '6px' }}>{validation.approvedPlaceholders.join(' · ')}</p>
      </div>
      <div style={{ gridColumn: compact ? undefined : '1 / -1' }}>
        <p style={{ ...ppCaption, fontSize: '6px' }}>LOCKED SECTIONS VERIFIED</p>
        <p style={{ ...ppCaption, fontSize: '6px' }}>{validation.lockedSectionsVerified.join(' · ')}</p>
      </div>
      {onViewFinalPrompt ? (
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="button" style={ppActionBtn} onClick={onViewFinalPrompt}>
            VIEW FINAL PROMPT
          </button>
        </div>
      ) : null}
    </div>
  );
}
