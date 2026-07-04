import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE,
  type PhotographyBiblePromptValidation,
  type PhotographyBibleUnitVariables,
} from '../../../../studio-os/product-photography/promptCompiler';
import { STUDIO_OS_UPPERCASE_CLASS } from '../../../../utils/adminStudioTheme';
import { PP_VISUAL, ppActionBtn, ppCaption, ppSectionTitle } from '../product-photography-bible/photographyBibleTheme';

type FinalPromptModalProps = {
  open: boolean;
  onClose: () => void;
  lockedTemplate?: string;
  variables: PhotographyBibleUnitVariables;
  finalPrompt: string;
  validation?: PhotographyBiblePromptValidation;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function formatVariables(vars: PhotographyBibleUnitVariables): string {
  return [
    `unit_name: ${vars.unitName}`,
    `collection_number: ${vars.collectionNumber}`,
    `texture: ${vars.texture}`,
    `length: ${vars.length}`,
    `density: ${vars.density}`,
    `lace: ${vars.lace}`,
  ].join('\n');
}

export function FinalPromptModal({
  open,
  onClose,
  lockedTemplate = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE,
  variables,
  finalPrompt,
  validation,
}: FinalPromptModalProps) {
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

  const preStyle = {
    ...ppCaption,
    fontSize: '7px',
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap' as const,
    maxHeight: 160,
    overflowY: 'auto' as const,
    margin: 0,
    padding: 8,
    background: 'rgba(0,0,0,0.03)',
    border: `1px solid ${PP_VISUAL.panelBorder}`,
  };

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${STUDIO_OS_UPPERCASE_CLASS}`}
      style={{ zIndex: 10001, background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="View final prompt"
    >
      <div
        className="bg-white border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ borderWidth: '1.3px', borderColor: PP_VISUAL.panelBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b" style={{ borderColor: PP_VISUAL.panelBorder }}>
          <p style={{ ...ppSectionTitle, color: PP_VISUAL.red }}>VIEW FINAL PROMPT · READ ONLY</p>
          <p style={{ ...ppCaption, fontSize: '7px' }}>
            CREATIVE DNA v{validation?.creativeDnaVersion ?? '1.0'} · PHOTOGRAPHY BIBLE{' '}
            {validation?.photographyBibleVersion?.toUpperCase() ?? 'V2.0'}
          </p>
        </div>

        <div className="p-3 space-y-3">
          <div>
            <p style={ppSectionTitle}>PROMPT VALIDATION RESULT</p>
            <p style={{ ...ppCaption, fontSize: '7px' }}>
              VALIDATOR · {validation?.validatorStatus?.toUpperCase() ?? '—'} · {validation?.finalPromptStatus ?? '—'}
            </p>
            <p style={{ ...ppCaption, fontSize: '7px', wordBreak: 'break-all' }}>
              LOCKED TEMPLATE HASH · {validation?.lockedTemplateHash ?? '—'}
            </p>
            {validation?.lockedSectionViolation ? (
              <p style={{ ...ppCaption, fontSize: '6px', color: PP_VISUAL.red }}>
                VIOLATION · {validation.lockedSectionViolation}
              </p>
            ) : null}
          </div>

          <div>
            <p style={ppSectionTitle}>INJECTED VARIABLES</p>
            <pre style={preStyle}>{formatVariables(variables)}</pre>
          </div>

          <div>
            <p style={ppSectionTitle}>LOCKED PHOTOGRAPHY BIBLE TEMPLATE</p>
            <pre style={preStyle}>{lockedTemplate}</pre>
          </div>

          <div>
            <p style={ppSectionTitle}>FINAL ASSEMBLED PROMPT (SENT TO FAL)</p>
            <pre style={{ ...preStyle, maxHeight: 220 }}>{finalPrompt || '—'}</pre>
          </div>
        </div>

        <div className="p-3 border-t flex flex-wrap gap-2" style={{ borderColor: PP_VISUAL.panelBorder }}>
          <button type="button" style={ppActionBtn} onClick={() => void copyText(finalPrompt)}>
            COPY FINAL PROMPT
          </button>
          <button type="button" style={ppActionBtn} onClick={() => void copyText(lockedTemplate)}>
            COPY TEMPLATE
          </button>
          <button type="button" style={ppActionBtn} onClick={() => void copyText(formatVariables(variables))}>
            COPY VARIABLES
          </button>
          <button type="button" style={{ ...ppActionBtn, color: PP_VISUAL.red }} onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
