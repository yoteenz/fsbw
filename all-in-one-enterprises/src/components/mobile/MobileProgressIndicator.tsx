type Props = {
  current: number;
  total: number;
  label?: string;
};

export function MobileProgressIndicator({ current, total, label }: Props) {
  const safeTotal = Math.max(total, 1);
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);

  return (
    <div className="aio-mobile-progress" aria-label={label ?? `Step ${safeCurrent} of ${safeTotal}`}>
      {label ? <p className="aio-mobile-progress__label">{label}</p> : null}
      <p className="aio-mobile-progress__step">
        STEP {safeCurrent} OF {safeTotal}
      </p>
      <div className="aio-mobile-progress__dots" role="presentation">
        {Array.from({ length: safeTotal }, (_, i) => {
          const stepNum = i + 1;
          const state =
            stepNum < safeCurrent ? 'complete' : stepNum === safeCurrent ? 'current' : 'upcoming';
          return <span key={stepNum} className={`aio-mobile-progress__dot aio-mobile-progress__dot--${state}`} />;
        })}
      </div>
    </div>
  );
}
