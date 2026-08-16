type Props = {
  current: 1 | 2 | 3;
  labels?: [string, string, string];
};

const DEFAULT_LABELS: [string, string, string] = ['Your Account', 'Your Business', 'Get Started'];

export function AuthStepIndicator({ current, labels = DEFAULT_LABELS }: Props) {
  return (
    <ol className="aio-auth-steps" aria-label="Sign up progress">
      {labels.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const state = step < current ? 'complete' : step === current ? 'current' : 'upcoming';
        return (
          <li key={label} className={`aio-auth-steps__item aio-auth-steps__item--${state}`}>
            <span className="aio-auth-steps__num" aria-hidden="true">
              {state === 'complete' ? '✓' : step}
            </span>
            <span className="aio-auth-steps__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
