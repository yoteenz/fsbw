import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { loadDemoSignupDraft } from '../../auth/demoSignup';
import type { DemoSignupIntent } from '../../auth/demoSignup';
import { returnUrlFromSearch, sanitizeReturnUrl } from '../../auth/returnUrl';
import { isDemoMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

type IntentOption = {
  id: DemoSignupIntent;
  title: string;
  description: string;
  href: string;
};

export function OnboardingPage() {
  const { session } = useAIOAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = sanitizeReturnUrl(returnUrlFromSearch(searchParams.toString()), '');
  const demoDraft = isDemoMode() ? loadDemoSignupDraft() : null;

  const displayName = session?.profile?.firstName ?? demoDraft?.firstName ?? 'there';
  const orgName = session?.organization?.name ?? demoDraft?.businessName;

  const intents: IntentOption[] = [
    {
      id: 'start_business',
      title: 'Start My Trucking Business',
      description: 'Launch the startup journey — formation, authority, insurance, and more.',
      href: aioPaths.startYourBusiness,
    },
    {
      id: 'road_ready',
      title: 'Check What I Need',
      description: 'Run Road Ready™ to see your compliance requirements.',
      href: aioPaths.roadReadyPublic,
    },
    {
      id: 'existing_business',
      title: 'I Already Have a Trucking Business',
      description: 'Go to your command center and manage existing operations.',
      href: aioPaths.portal,
    },
    {
      id: 'request_service',
      title: 'Request a Service',
      description: 'Browse services and start bookkeeping, dispatch, permits, and more.',
      href: returnUrl && returnUrl.includes('/services') ? returnUrl : aioPaths.services,
    },
    {
      id: 'shipper',
      title: "I'm a Shipper",
      description: 'Open shipper tools for shipments, quotes, and billing.',
      href: aioPaths.shipper,
    },
  ];

  const filteredIntents =
    demoDraft?.accountType === 'shipper' || session?.organization?.organizationType === 'shipper'
      ? intents.filter((i) => i.id === 'shipper' || i.id === 'request_service')
      : intents.filter((i) => i.id !== 'shipper');

  const onSelect = (option: IntentOption) => {
    if (returnUrl && option.id === 'request_service') {
      navigate(returnUrl);
      return;
    }
    navigate(option.href);
  };

  return (
    <div className="aio-auth-card aio-auth-card--wide aio-onboarding">
      <h1>Your All In One account is ready</h1>
      <p className="aio-auth-card__sub">
        Welcome, {displayName}.
        {orgName ? ` ${orgName} is set up.` : ' '}What do you want to do first?
      </p>
      <ul className="aio-onboarding-intents">
        {filteredIntents.map((option) => (
          <li key={option.id}>
            <button type="button" className="aio-onboarding-intent" onClick={() => onSelect(option)}>
              <span className="aio-onboarding-intent__title">{option.title}</span>
              <span className="aio-onboarding-intent__desc">{option.description}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="aio-auth-card__links">
        <Link to={aioPaths.portal}>Skip — go to dashboard</Link>
      </p>
    </div>
  );
}
