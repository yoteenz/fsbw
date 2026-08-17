import { aioAppConfig } from '../../config/appConfig';

type Props = {
  headline?: string;
  message?: string;
};

export function AuthTransition({ headline = 'Welcome back.', message = 'Loading your business…' }: Props) {
  return (
    <div className="aio-auth-premium__transition" role="status" aria-live="polite">
      {aioAppConfig.assets.logoLockup ? (
        <img
          src={aioAppConfig.assets.logoLockup}
          alt=""
          className="aio-auth-premium__transition-logo"
          width={1672}
          height={941}
          decoding="async"
        />
      ) : null}
      <p className="aio-auth-premium__transition-headline">{headline}</p>
      <p className="aio-auth-premium__transition-message">{message}</p>
      <span className="aio-auth-premium__transition-spinner" aria-hidden="true" />
    </div>
  );
}
