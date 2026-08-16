import { Link } from 'react-router-dom';
import { resendVerification } from '../../auth/authService';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { aioPaths } from '../../utils/paths';
import { useState } from 'react';

export function VerifyEmailPage() {
  const { session } = useAIOAuth();
  const [message, setMessage] = useState<string | null>(null);

  const onResend = async () => {
    if (!session?.user.email) return;
    const { error } = await resendVerification(session.user.email);
    setMessage(error ?? 'Verification email sent.');
  };

  return (
    <div className="aio-auth-card">
      <h1>Verify Your Email</h1>
      <p>Please confirm your email address to access your portal.</p>
      {session?.user.email && <p>Sent to: <strong>{session.user.email}</strong></p>}
      <button type="button" className="aio-btn aio-btn--gold" onClick={onResend}>Resend verification</button>
      {message && <p className="aio-prototype-note">{message}</p>}
      <p className="aio-auth-card__links"><Link to={aioPaths.login}>Back to Sign In</Link></p>
    </div>
  );
}
