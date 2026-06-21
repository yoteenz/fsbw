import type { BawTutorialStepId } from '../../constants/bawTutorialConfig';
import { BAW_TUTORIAL_GUIDE_COPY } from '../../constants/bawTutorialConfig';

type Props = {
  step: BawTutorialStepId;
};

/** Generic step coach — not PSA / founder branded. */
export function BawTutorialGuidePanel({ step }: Props) {
  const copy = BAW_TUTORIAL_GUIDE_COPY[step];
  return (
    <div
      className="rounded-sm border border-black bg-white/70 backdrop-blur-sm p-3"
      style={{ borderWidth: '1.3px' }}
      data-attribute="baw-tutorial-guide"
    >
      <p
        className="text-[9px] tracking-[0.18em] uppercase mb-1"
        style={{ fontFamily: '"Futura PT Medium"', color: '#808080' }}
      >
        BUILD GUIDE
      </p>
      <p
        className="text-[11px] tracking-[0.06em] uppercase mb-1"
        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
      >
        {copy.title}
      </p>
      <p
        className="text-[10px] leading-snug uppercase"
        style={{ fontFamily: '"Futura PT Book"', color: '#1A1A1A' }}
      >
        {copy.body}
      </p>
    </div>
  );
}
