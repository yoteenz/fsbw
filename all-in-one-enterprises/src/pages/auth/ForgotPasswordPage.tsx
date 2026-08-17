import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthBrandIntro } from '../../components/auth/AuthBrandIntro';
import { AuthError } from '../../components/auth/AuthError';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';
import { sendPasswordReset } from '../../auth/authService';
import { isBackendMode } from '../../config/dataMode';
import { maskEmail } from '../../utils/maskEmail';
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

  const onResend = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await sendPasswordReset(email);
    setLoading(false);
    if (err) setError(err);
  };

  if (sent) {
    return (
      <>
        <AuthBrandIntro
          headline="Check your email"
          supporting={
            <>
              We&apos;ve sent password recovery instructions to:{' '}
              <span className="aio-auth-premium__success-email">{maskEmail(email)}</span>
            </>
          }
        />
        <button
          type="button"
          className="aio-auth-premium__btn aio-auth-premium__btn--ghost"
          disabled={loading}
          onClick={() => void onResend()}
        >
          {loading ? 'Sending…' : 'Resend Email'}
        </button>
        {error ? <AuthError title="Could not resend" message={error} /> : null}
        <Link to={aioPaths.login} className="aio-auth-premium__back-link">
          ← Back to Log In
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthBrandIntro
        headline={
          <>
            Reset your
            <br />
            password.
          </>
        }
        supporting="Enter the email connected to your account and we'll send you recovery instructions."
      />
      <form onSubmit={onSubmit} className="aio-auth-premium__form">
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
        />
        {error ? <AuthError title="Could not send reset link" message={error} /> : null}
        <AuthPrimaryButton loading={loading} loadingLabel="Sending link…">
          Send Reset Link →
        </AuthPrimaryButton>
      </form>
      <Link to={aioPaths.login} className="aio-auth-premium__back-link">
        ← Back to Log In
      </Link>
    </>
  );
}
