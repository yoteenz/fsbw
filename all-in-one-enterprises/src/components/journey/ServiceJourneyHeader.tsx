import { Link } from 'react-router-dom';
import { AIOButton } from '../AIOButton';
import type { StartBusinessJourneyView } from '../../journeys/journeyTypes';
import { aioPaths } from '../../utils/paths';

type Props = {
  view: StartBusinessJourneyView;
};

export function ServiceJourneyHeader({ view }: Props) {
  const { progress, nextAction, isComplete, attention } = view;

  return (
    <header className="aio-journey-header">
      <div className="aio-journey-header__top">
        <div>
          <p className="aio-journey-header__eyebrow">Start Your Business</p>
          <h2 className="aio-journey-header__title">From formation to freight</h2>
        </div>
        <div className="aio-journey-header__progress-block" aria-label={`Startup progress ${progress.percent} percent`}>
          <p className="aio-journey-header__progress-label">Your startup progress</p>
          <p className="aio-journey-header__progress-value">{progress.percent}%</p>
          <p className="aio-journey-header__progress-meta">{progress.label}</p>
          <div className="aio-journey-header__bar" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
            <span className="aio-journey-header__bar-fill" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      </div>

      {attention.length > 0 ? (
        <div className="aio-journey-attention" role="status">
          <p className="aio-journey-attention__title">
            {attention.length} {attention.length === 1 ? 'thing needs' : 'things need'} your attention
          </p>
          <ul className="aio-journey-attention__list">
            {attention.map((a: { stepId: string; label: string; route: string }) => (
              <li key={a.stepId}>
                <Link to={a.route}>{a.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isComplete ? (
        <div className="aio-journey-next">
          <p className="aio-journey-next__label">Your startup roadmap is complete</p>
          <p className="aio-journey-next__title">You&apos;re ready to operate</p>
          <AIOButton to={`${aioPaths.startYourBusiness}/roll`} variant="gold" showArrow>
            What&apos;s Next
          </AIOButton>
        </div>
      ) : nextAction ? (
        <div className="aio-journey-next">
          <p className="aio-journey-next__label">Next up</p>
          <p className="aio-journey-next__title">{nextAction.def.shortTitle}</p>
          <p className="aio-journey-next__desc">{nextAction.def.description}</p>
          <AIOButton to={nextAction.ctaRoute} variant="gold" showArrow>
            Continue Where I Left Off
          </AIOButton>
        </div>
      ) : (
        <div className="aio-journey-next">
          <AIOButton to={`${aioPaths.startYourBusiness}/build`} variant="gold" showArrow>
            Start My Business
          </AIOButton>
        </div>
      )}
    </header>
  );
}
