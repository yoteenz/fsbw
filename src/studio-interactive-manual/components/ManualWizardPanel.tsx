import type { ManualStep } from '../types';
import { KH_VISUAL, khActionBtn, khCaption } from '../../components/admin/studio/knowledge-hub/knowledgeHubTheme';
import { ManualWorkflowStrip } from './ManualWorkflowStrip';

type Props = {
  stepIndex: number;
  stepCount: number;
  title: string;
  body: string;
  benefit: string;
  productLabel: string;
  moduleName: string;
  position: 'bottom' | 'center' | 'top';
  actionLabel?: string;
  onAction?: () => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onOpenWrittenDoc: () => void;
  canBack: boolean;
  isLast: boolean;
  step: ManualStep;
};

export function ManualWizardPanel({
  stepIndex,
  stepCount,
  title,
  body,
  benefit,
  productLabel,
  moduleName,
  position,
  actionLabel,
  onAction,
  onBack,
  onNext,
  onSkip,
  onOpenWrittenDoc,
  canBack,
  isLast,
  step,
}: Props) {
  const progressPct = stepCount > 0 ? Math.round(((stepIndex + 1) / stepCount) * 100) : 0;
  const positionStyle =
    position === 'center'
      ? { bottom: 'auto', top: '50%', transform: 'translate(-50%, -50%)' }
      : position === 'top'
        ? { bottom: 'auto', top: 'max(80px, env(safe-area-inset-top))' }
        : { bottom: 'max(20px, env(safe-area-inset-bottom))' };

  const showWrittenDocAction = step.actionType === 'open-written-doc';
  const showCustomAction = actionLabel && onAction && step.actionType !== 'open-written-doc';

  return (
    <div
      className="studio-manual-wizard-panel"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        left: '50%',
        transform: position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
        zIndex: 100010,
        width: 'min(92vw, 380px)',
        ...positionStyle,
        border: '1.3px solid #0a0a0a',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        padding: '14px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      }}
    >
      <div
        aria-hidden="true"
        style={{ height: '3px', background: '#eee', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}
      >
        <div style={{ height: '100%', width: `${progressPct}%`, background: KH_VISUAL.red, transition: 'width 0.25s' }} />
      </div>
      <p style={{ ...khCaption, marginBottom: '2px' }}>{productLabel.toUpperCase()}</p>
      <p style={{ ...khCaption, color: KH_VISUAL.red, fontSize: '11px', marginBottom: '2px' }}>{moduleName.toUpperCase()}</p>
      <p style={{ ...khCaption, marginBottom: '8px' }}>
        STEP {stepIndex + 1} OF {stepCount}
      </p>
      <h2 style={{ ...khCaption, color: KH_VISUAL.red, fontSize: '12px', marginBottom: '8px' }}>{title}</h2>
      {step.workflowNodes && step.workflowNodes.length > 0 ? (
        <ManualWorkflowStrip nodes={step.workflowNodes} />
      ) : null}
      <p style={{ ...khCaption, color: KH_VISUAL.black, fontFamily: '"Futura PT Book"', lineHeight: 1.45, marginBottom: '8px' }}>
        {body}
      </p>
      <p style={{ ...khCaption, marginBottom: '14px' }}>{benefit}</p>
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          {canBack ? (
            <button type="button" onClick={onBack} style={khActionBtn}>
              BACK
            </button>
          ) : null}
          <button type="button" onClick={onSkip} style={khActionBtn}>
            SKIP
          </button>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {showWrittenDocAction ? (
            <button type="button" onClick={onOpenWrittenDoc} style={{ ...khActionBtn, color: KH_VISUAL.red }}>
              OPEN WRITTEN DOC
            </button>
          ) : null}
          {showCustomAction ? (
            <button type="button" onClick={onAction} style={{ ...khActionBtn, color: KH_VISUAL.red }}>
              {actionLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onNext}
            style={{ ...khActionBtn, background: KH_VISUAL.red, color: '#fff', borderColor: KH_VISUAL.red }}
          >
            {isLast ? 'FINISH' : 'NEXT'}
          </button>
        </div>
      </div>
    </div>
  );
}
