import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordReset } from '../../auth/authService';
import { isBackendMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isBackendMode()) {
      setError('Password reset requires backend mode.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await sendPasswordReset(email);
    setLoading(false);
    if (err) setError(err);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="aio-auth-card">
        <h1>Check your email</h1>
        <p>If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.</p>
        <Link to={aioPaths.login} className="aio-btn aio-btn--gold">Back to Sign In</Link>
      </div>
    );
  }

  return (
    <div className="aio-auth-card">
      <h1>Forgot Password</h1>
      <form onSubmit={onSubmit} className="aio-auth-form">
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <p className="aio-auth-form__error" role="alert">{error}</p>}
        <button type="submit" className="aio-btn aio-btn--gold aio-btn--block" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
      <p className="aio-auth-card__links"><Link to={aioPaths.login}>Back to Sign In</Link></p>
    </div>
  );
}
