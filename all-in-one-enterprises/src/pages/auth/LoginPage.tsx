import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signIn } from '../../auth/authService';
import { returnUrlFromSearch, sanitizeReturnUrl } from '../../auth/returnUrl';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { isBackendMode, isDemoMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAIOAuth();

  const state = location.state as { from?: string; office?: boolean; return?: string } | null;
  const returnUrl = useMemo(
    () => sanitizeReturnUrl(state?.return ?? state?.from ?? returnUrlFromSearch(location.search), aioPaths.portal),
    [location.search, state?.from, state?.return],
  );
  const office = state?.office;

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
    if (office) navigate(aioPaths.office);
    else navigate(returnUrl);
  };

  const signUpHref = `${aioPaths.signUp}?return=${encodeURIComponent(returnUrl)}`;

  return (
    <div className="aio-auth-card">
      <h1>Welcome back</h1>
      <p className="aio-auth-card__sub">
        Log in to continue managing your business, services, documents, and Road Ready™ progress.
      </p>
      <form onSubmit={onSubmit} className="aio-auth-form">
        <label>
          Email
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="aio-auth-form__error" role="alert">{error}</p>}
        <button type="submit" className="aio-btn aio-btn--gold aio-btn--block" disabled={loading}>
          {loading ? 'Logging In…' : 'Log In'}
        </button>
      </form>
      <p className="aio-auth-card__links">
        <Link to={aioPaths.forgotPassword}>Forgot Password?</Link>
      </p>
      <div className="aio-auth-card__divider">
        <p className="aio-auth-card__divider-label">New to All In One?</p>
        <Link to={signUpHref} className="aio-btn aio-btn--outline-gold aio-btn--block">
          Create Account
        </Link>
      </div>
      {isDemoMode() ? (
        <p className="aio-prototype-note">
          <Link to={aioPaths.portal}>Enter Demo Portal →</Link> (no account required in demo mode)
        </p>
      ) : null}
    </div>
  );
}
