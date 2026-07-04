import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { MasterHeroGenerationPackage } from '../../../../studio-os/product-photography/ProductAssetFactory';
import { STUDIO_OS_UPPERCASE_CLASS } from '../../../../utils/adminStudioTheme';
import { PP_VISUAL, ppActionBtn, ppCaption, ppSectionTitle } from '../product-photography-bible/photographyBibleTheme';

type GenerationPackageModalProps = {
  open: boolean;
  onClose: () => void;
  generationPackage?: MasterHeroGenerationPackage;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function formatVariables(vars: MasterHeroGenerationPackage['injectedProductVariables']): string {
  return [
    `unit_name: ${vars.unitName}`,
    `collection_number: ${vars.collectionNumber}`,
    `texture: ${vars.texture}`,
    `length: ${vars.length}`,
    `density: ${vars.density}`,
    `lace: ${vars.lace}`,
  ].join('\n');
}

export function GenerationPackageModal({ open, onClose, generationPackage }: GenerationPackageModalProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const pkg = generationPackage;
  const preStyle = {
    ...ppCaption,
    fontSize: '7px',
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap' as const,
    maxHeight: 140,
    overflowY: 'auto' as const,
    margin: 0,
    padding: 8,
    background: 'rgba(0,0,0,0.03)',
    border: `1px solid ${PP_VISUAL.panelBorder}`,
  };

  const providerReady = pkg?.validation.provider.status === 'ready';
  const promptReady = pkg?.validation.prompt.validatorStatus === 'passed';

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${STUDIO_OS_UPPERCASE_CLASS}`}
      style={{ zIndex: 10001, background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="View generation package"
    >
      <div
        className="bg-white border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ borderWidth: '1.3px', borderColor: PP_VISUAL.panelBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b" style={{ borderColor: PP_VISUAL.panelBorder }}>
          <p style={{ ...ppSectionTitle, color: PP_VISUAL.red }}>GENERATION PACKAGE · READ ONLY</p>
          <p style={{ ...ppCaption, fontSize: '7px' }}>
            LOCKED CREATIVE DNA · APPROVED GOLDEN PROMPT · PROVIDER PRESET · REFERENCE ASSETS
          </p>
        </div>

        {!pkg ? (
          <div className="p-3">
            <p style={ppCaption}>NO GENERATION PACKAGE AVAILABLE</p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            <div>
              <p style={ppSectionTitle}>PROVIDER PRESET</p>
              <p style={{ ...ppCaption, fontSize: '7px' }}>{pkg.providerPreset.name}</p>
              <p style={{ ...ppCaption, fontSize: '7px' }}>
                MODEL · {pkg.providerPreset.modelLabel} · QUALITY · {pkg.providerPreset.qualityLabel} · ASPECT ·{' '}
                {pkg.providerPreset.aspectRatio} · RESOLUTION · {pkg.providerPreset.resolutionLabel}
              </p>
            </div>

            <div>
              <p style={ppSectionTitle}>VERSIONS</p>
              <p style={{ ...ppCaption, fontSize: '7px' }}>
                CREATIVE DNA · V{pkg.validation.provider.creativeDnaVersion} · PROMPT · PHOTOGRAPHY BIBLE{' '}
                {pkg.validation.provider.promptVersion.toUpperCase()}
              </p>
            </div>

            <div>
              <p style={ppSectionTitle}>INJECTED VARIABLES</p>
              <pre style={preStyle}>{formatVariables(pkg.injectedProductVariables)}</pre>
            </div>

            <div>
              <p style={ppSectionTitle}>REFERENCE ASSETS USED</p>
              <pre style={preStyle}>{pkg.referenceAssetsUsed.join('\n') || '—'}</pre>
            </div>

            <div>
              <p style={ppSectionTitle}>BENCHMARK ASSET</p>
              <pre style={preStyle}>{pkg.benchmarkAssetSrc || '—'}</pre>
            </div>

            <div>
              <p style={ppSectionTitle}>EDITORIAL REFERENCE PROMPT (METADATA ONLY — NOT SENT TO FAL)</p>
              <pre style={preStyle}>{pkg.editorialReferencePrompt}</pre>
            </div>

            <div>
              <p style={ppSectionTitle}>LOCKED CREATIVE DNA PROMPT TEMPLATE</p>
              <pre style={preStyle}>{pkg.lockedCreativeDnaPromptTemplate}</pre>
            </div>

            <div>
              <p style={ppSectionTitle}>FINAL PROMPT (SENT TO FAL)</p>
              <pre style={{ ...preStyle, maxHeight: 200 }}>{pkg.finalPrompt}</pre>
            </div>

            <div>
              <p style={ppSectionTitle}>VALIDATION RESULT</p>
              <p style={{ ...ppCaption, fontSize: '7px', color: providerReady ? '#16a34a' : PP_VISUAL.red }}>
                PROVIDER · {pkg.validation.provider.status.toUpperCase()} · {pkg.validation.provider.validationMessage}
              </p>
              <p style={{ ...ppCaption, fontSize: '7px', color: promptReady ? '#16a34a' : PP_VISUAL.red }}>
                PROMPT · {pkg.validation.prompt.validatorStatus.toUpperCase()} · {pkg.validation.prompt.finalPromptStatus}
              </p>
              {!providerReady && pkg.validation.provider.blockedReason ? (
                <p style={{ ...ppCaption, fontSize: '6px', color: PP_VISUAL.red }}>
                  {pkg.validation.provider.blockedReason}
                </p>
              ) : null}
            </div>
          </div>
        )}

        <div className="p-3 border-t flex flex-wrap gap-2" style={{ borderColor: PP_VISUAL.panelBorder }}>
          {pkg ? (
            <>
              <button type="button" style={ppActionBtn} onClick={() => void copyText(pkg.finalPrompt)}>
                COPY FINAL PROMPT
              </button>
              <button
                type="button"
                style={ppActionBtn}
                onClick={() => void copyText(formatVariables(pkg.injectedProductVariables))}
              >
                COPY VARIABLES
              </button>
            </>
          ) : null}
          <button type="button" style={{ ...ppActionBtn, color: PP_VISUAL.red }} onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
