import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthBrandIntro } from '../../components/auth/AuthBrandIntro';
import { AuthCheckbox } from '../../components/auth/AuthCheckbox';
import { AuthEmailIcon, AuthLockIcon } from '../../components/auth/AuthFieldIcons';
import { AuthError } from '../../components/auth/AuthError';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthPasswordInput } from '../../components/auth/AuthPasswordInput';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';
import { AuthSecondaryButton } from '../../components/auth/AuthSecondaryButton';
import { AuthTransition } from '../../components/auth/AuthTransition';
import { DemoPortalAccess } from '../../components/auth/DemoPortalAccess';
import { signIn } from '../../auth/authService';
import { returnUrlFromSearch, sanitizeReturnUrl } from '../../auth/returnUrl';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { isBackendMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAIOAuth();

  const state = location.state as { from?: string; office?: boolean; return?: string } | null;
  const returnUrl = useMemo(
    () => sanitizeReturnUrl(state?.return ?? state?.from ?? returnUrlFromSearch(location.search), aioPaths.portal),
    [location.search, state?.from, state?.return],
  );
  const office = state?.office;

  const signUpHref = `${aioPaths.signUp}?return=${encodeURIComponent(returnUrl)}`;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isBackendMode()) {
      setError('Log in requires backend mode. Use Demo Mode or configure VITE_AIO_SUPABASE_* credentials.');
      return;
    }
    setLoading(true);
    setError(null);
    const { session, error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    if (!session) {
      setError('Log in failed.');
      return;
    }
    await refresh();
    setTransitioning(true);
  };

  useEffect(() => {
    if (!transitioning) return;
    const destination = office ? aioPaths.office : returnUrl;
    const timer = window.setTimeout(() => {
      navigate(destination);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [transitioning, navigate, office, returnUrl]);

  if (transitioning) {
    return <AuthTransition headline="Welcome back." message="Loading your business…" />;
  }

  const errorMessage =
    error === 'Email or password is incorrect.'
      ? "The email or password entered doesn't match an account. Check your information and try again."
      : error;

  return (
    <>
      <AuthBrandIntro
        headline="Welcome"
        headlineGold="back."
        supporting={
          <>
            Your business keeps moving.
            <br />
            Pick up where you left off.
          </>
        }
        secondary="Manage services, documents, filings, Road Ready™ progress, and your AIO account from one place."
      />

      <div className="aio-auth-premium__form-panel">
        <form onSubmit={onSubmit} className="aio-auth-premium__form">
          <AuthInput
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
            icon={<AuthEmailIcon />}
          />
          <AuthPasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
            icon={<AuthLockIcon />}
          />
          <div className="aio-auth-premium__row aio-auth-premium__row--inline">
            <AuthCheckbox label="Remember me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <Link to={aioPaths.forgotPassword} className="aio-auth-premium__forgot">
              Forgot password?
            </Link>
          </div>
          {error ? (
            <AuthError
              title="We couldn't log you in"
              message={errorMessage ?? 'Check your email and password and try again.'}
            />
          ) : null}
          <AuthPrimaryButton loading={loading} loadingLabel="Logging in…">
            Log In →
          </AuthPrimaryButton>
        </form>

        <div className="aio-auth-premium__divider" role="separator" aria-label="Or">
          <span>Or</span>
        </div>

        <div className="aio-auth-premium__alt aio-auth-premium__alt--in-panel">
          <p className="aio-auth-premium__alt-label">New to All In One?</p>
          <AuthSecondaryButton to={signUpHref}>Create Account →</AuthSecondaryButton>
        </div>
      </div>

      <DemoPortalAccess />
    </>
  );
}
