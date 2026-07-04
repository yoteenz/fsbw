import type { PhotographyBibleProviderValidation } from '../../../../studio-os/product-photography/ProductAssetFactory';
import { PP_VISUAL, ppActionBtn, ppCaption, ppSectionTitle } from '../product-photography-bible/photographyBibleTheme';

type PhotographyBibleProviderValidationPanelProps = {
  validation?: PhotographyBibleProviderValidation;
  onViewGenerationPackage?: () => void;
};

export function PhotographyBibleProviderValidationPanel({
  validation,
  onViewGenerationPackage,
}: PhotographyBibleProviderValidationPanelProps) {
  if (!validation) {
    return (
      <div className="p-2 mt-2" style={{ border: `1px dashed ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
        <p style={{ ...ppCaption, fontSize: '7px' }}>
          PROVIDER VALIDATION · AWAITING LOCKED PRESET CHECK · GPT IMAGE 2 · 2K HIGH · 1:1
        </p>
      </div>
    );
  }

  const ready = validation.status === 'ready';

  return (
    <div
      className="p-2 mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2"
      style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.85)' }}
    >
      <p style={{ ...ppSectionTitle, color: PP_VISUAL.red, gridColumn: '1 / -1' }}>
        PROVIDER VALIDATION · PHOTOGRAPHY BIBLE MASTER HERO
      </p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>PRESET · {validation.presetName.toUpperCase()}</p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>PROVIDER · {validation.provider.toUpperCase()}</p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>MODEL · {validation.modelLabel.toUpperCase()}</p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>QUALITY · {validation.qualityLabel}</p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>ASPECT RATIO · {validation.aspectRatio}</p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>RESOLUTION · {validation.resolution}</p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>
        CREATIVE DNA · V{validation.creativeDnaVersion}
      </p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>
        PROMPT VERSION · PHOTOGRAPHY BIBLE {validation.promptVersion.toUpperCase()}
      </p>
      <p style={{ ...ppCaption, fontSize: '6px', wordBreak: 'break-all', gridColumn: '1 / -1' }}>
        BENCHMARK · {validation.benchmarkAsset || '—'}
      </p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>BACKGROUND · {validation.background.toUpperCase()}</p>
      <p style={{ ...ppCaption, fontSize: '6px', color: ready ? '#16a34a' : PP_VISUAL.red }}>
        STATUS · {ready ? 'READY' : 'BLOCKED'}
      </p>
      <p style={{ ...ppCaption, fontSize: '6px', gridColumn: '1 / -1' }}>{validation.validationMessage}</p>
      {!ready && validation.blockedReason ? (
        <p style={{ ...ppCaption, fontSize: '6px', color: PP_VISUAL.red, gridColumn: '1 / -1' }}>
          {validation.blockedReason}
        </p>
      ) : null}
      {onViewGenerationPackage ? (
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="button" style={ppActionBtn} onClick={onViewGenerationPackage}>
            VIEW GENERATION PACKAGE
          </button>
        </div>
      ) : null}
    </div>
  );
}
