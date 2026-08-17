import { Link } from 'react-router-dom';
import { resendVerification } from '../../auth/authService';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { AuthBrandIntro } from '../../components/auth/AuthBrandIntro';
import { AuthError } from '../../components/auth/AuthError';
import { aioPaths } from '../../utils/paths';
import { useState } from 'react';

export function VerifyEmailPage() {
  const { session } = useAIOAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onResend = async () => {
    if (!session?.user.email) return;
    setLoading(true);
    const { error } = await resendVerification(session.user.email);
    setLoading(false);
    setMessage(error ?? 'Verification email sent.');
  };

  return (
    <>
      <AuthBrandIntro
        headline="Verify your email"
        supporting="Please confirm your email address to access your portal."
      />
      {session?.user.email ? (
        <p className="aio-auth-premium__supporting">
          Sent to: <strong className="aio-auth-premium__success-email">{session.user.email}</strong>
        </p>
      ) : null}
      <button
        type="button"
        className="aio-auth-premium__btn aio-auth-premium__btn--primary"
        disabled={loading}
        onClick={() => void onResend()}
      >
        {loading ? 'Sending…' : 'Resend Verification →'}
      </button>
      {message ? (
        message.includes('sent') || message.includes('Sent') ? (
          <p className="aio-auth-premium__supporting">{message}</p>
        ) : (
          <AuthError title="Could not resend" message={message} />
        )
      ) : null}
      <Link to={aioPaths.login} className="aio-auth-premium__back-link">
        ← Back to Log In
      </Link>
    </>
  );
}
