import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signIn } from '../../auth/authService';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { isBackendMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAIOAuth();

  const from = (location.state as { from?: string; office?: boolean } | null)?.from;
  const office = (location.state as { office?: boolean } | null)?.office;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isBackendMode()) {
      setError('Sign in requires backend mode. Use Demo Mode or configure VITE_AIO_SUPABASE_* credentials.');
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
      setError('Sign in failed.');
      return;
    }
    await refresh();
    if (office) navigate(aioPaths.office);
    else navigate(from ?? aioPaths.portal);
  };

  return (
    <div className="aio-auth-card">
      <h1>Sign In</h1>
      <p className="aio-auth-card__sub">Access your All In One client portal</p>
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
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <p className="aio-auth-card__links">
        <Link to={aioPaths.forgotPassword}>Forgot password?</Link>
        {' · '}
        <Link to={aioPaths.signUp}>Create account</Link>
      </p>
      { !isBackendMode() && (
        <p className="aio-prototype-note">
          <Link to={aioPaths.portal}>Enter Demo Portal →</Link> (no account required in demo mode)
        </p>
      )}
    </div>
  );
}
