import { useEffect, useState, type CSSProperties } from 'react';
import type { ManualStep } from '../types';
import type { ResolvedManualTarget } from '../targetResolver';

type Props = {
  step: ManualStep | null;
  target: ResolvedManualTarget | null;
  visible: boolean;
};

export function ManualSpotlightOverlay({ step, target, visible }: Props) {
  const [holeStyle, setHoleStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!visible || !step?.spotlight || !target?.rect) {
      setHoleStyle({});
      return;
    }
    const pad = 8;
    const r = target.rect;
    setHoleStyle({
      left: r.left - pad,
      top: r.top - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [visible, step, target]);

  if (!visible || !step) return null;

  const animClass =
    step.animationType === 'pulse'
      ? 'tutorial-os-spotlight-hole--pulse'
      : step.animationType === 'glow'
        ? 'tutorial-os-spotlight-hole--glow'
        : step.animationType === 'zoom'
          ? 'tutorial-os-spotlight-hole--zoom'
          : '';

  const showHole = step.spotlight && target?.rect;

  return (
    <div className="tutorial-os-spotlight-root" style={{ zIndex: 100005 }} aria-hidden="true">
      {!showHole ? <div className="tutorial-os-spotlight-dim" /> : null}
      {showHole ? (
        <>
          <div className={`tutorial-os-spotlight-hole ${animClass}`} style={holeStyle} />
          {step.animationType === 'arrow' && target?.rect ? (
            <div
              className="tutorial-os-spotlight-arrow"
              style={{
                left: target.rect.left + target.rect.width / 2 - 10,
                top: target.rect.top - 22,
              }}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
