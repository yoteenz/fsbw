import { Link } from 'react-router-dom';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { aioPaths } from '../../utils/paths';

export function OnboardingPage() {
  const { session } = useAIOAuth();

  return (
    <div className="aio-auth-card aio-onboarding">
      <h1>Welcome to All In One</h1>
      <p>
        {session?.organization?.name
          ? `Your business "${session.organization.name}" is ready.`
          : 'Your account is ready.'}
      </p>
      <p>Complete Smart Intake to generate your preliminary Roadmap, or go straight to your dashboard.</p>
      <div className="aio-onboarding__actions">
        <Link to={aioPaths.getStarted} className="aio-btn aio-btn--gold">Complete Smart Intake</Link>
        <Link to={aioPaths.portal} className="aio-btn aio-btn--outline">Go to Dashboard</Link>
      </div>
    </div>
  );
}
