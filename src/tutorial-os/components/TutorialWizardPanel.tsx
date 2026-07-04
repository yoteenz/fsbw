import { TutorialPreviewArea } from './TutorialPreviewArea';
import { TutorialFeatureCards } from './TutorialFeatureCards';
import type { TutorialFeatureCardDef } from '../types';

type Props = {
  previewKey?: string;
  stepIndex: number;
  stepCount: number;
  title: string;
  body: string;
  benefit: string;
  position: 'bottom' | 'center' | 'top';
  actionLabel?: string;
  onAction?: () => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  canBack: boolean;
  isLast: boolean;
  productLabel: string;
  tourName: string;
  breadcrumb?: string | null;
  featureCards?: TutorialFeatureCardDef[];
  onShowMeFeature?: (feature: TutorialFeatureCardDef) => void;
};

export function TutorialWizardPanel({
  previewKey,
  stepIndex,
  stepCount,
  title,
  body,
  benefit,
  position,
  actionLabel,
  onAction,
  onBack,
  onNext,
  onSkip,
  canBack,
  isLast,
  productLabel,
  tourName,
  breadcrumb,
  featureCards,
  onShowMeFeature,
}: Props) {
  const progressPct = stepCount > 0 ? Math.round(((stepIndex + 1) / stepCount) * 100) : 0;
  const positionClass =
    position === 'center'
      ? 'tutorial-os-wizard-panel--center'
      : position === 'top'
        ? 'tutorial-os-wizard-panel--top'
        : 'tutorial-os-wizard-panel--bottom';

  return (
    <div className={`tutorial-os-wizard-panel ${positionClass}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="tutorial-os-progress-bar" aria-hidden="true">
        <div className="tutorial-os-progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#808080',
          marginBottom: '2px',
        }}
      >
        {productLabel.toUpperCase()}
      </p>
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#EB1C24',
          marginBottom: breadcrumb ? '2px' : '4px',
        }}
      >
        {tourName.toUpperCase()}
      </p>
      {breadcrumb ? (
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '9px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#808080',
            marginBottom: '4px',
          }}
        >
          FROM {breadcrumb.toUpperCase()}
        </p>
      ) : null}
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '9px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#808080',
          marginBottom: '8px',
        }}
      >
        STEP {stepIndex + 1} OF {stepCount}
      </p>
      <h2
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '13px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#EB1C24',
          marginBottom: '8px',
        }}
      >
        {title}
      </h2>
      <TutorialPreviewArea previewKey={previewKey} />
      <p
        style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '11px',
          lineHeight: 1.45,
          textTransform: 'uppercase',
          color: '#1A1A1A',
          marginBottom: '8px',
        }}
      >
        {body}
      </p>
      {featureCards && featureCards.length > 0 && onShowMeFeature ? (
        <TutorialFeatureCards features={featureCards} onShowMe={onShowMeFeature} />
      ) : null}
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '10px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#808080',
          marginBottom: '14px',
        }}
      >
        {benefit}
      </p>
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          {canBack ? (
            <button type="button" onClick={onBack} className="tutorial-os-btn tutorial-os-btn--ghost">
              BACK
            </button>
          ) : null}
          <button type="button" onClick={onSkip} className="tutorial-os-btn tutorial-os-btn--ghost">
            SKIP
          </button>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {actionLabel && onAction ? (
            <button type="button" onClick={onAction} className="tutorial-os-btn tutorial-os-btn--outline">
              {actionLabel}
            </button>
          ) : null}
          <button type="button" onClick={onNext} className="tutorial-os-btn tutorial-os-btn--primary">
            {isLast ? 'FINISH' : 'NEXT'}
          </button>
        </div>
      </div>
      <style>{`
        .tutorial-os-btn {
          font-family: "Futura PT Medium", sans-serif;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 8px 14px;
          border-radius: 4px;
          border: 1.3px solid #0a0a0a;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .tutorial-os-btn--primary {
          background: #EB1C24;
          color: #fff;
          border-color: #EB1C24;
        }
        .tutorial-os-btn--outline {
          background: transparent;
          color: #EB1C24;
          border-color: #EB1C24;
        }
        .tutorial-os-btn--ghost {
          background: rgba(255,255,255,0.5);
          color: #1A1A1A;
        }
      `}</style>
    </div>
  );
}
