import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { updatePassword } from '../../auth/authService';
import { isBackendMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!isBackendMode()) {
      setError('Password reset requires backend mode.');
      return;
    }
    setLoading(true);
    const { error: err } = await updatePassword(password);
    setLoading(false);
    if (err) setError(err);
    else navigate(aioPaths.login);
  };

  return (
    <div className="aio-auth-card">
      <h1>Set New Password</h1>
      <form onSubmit={onSubmit} className="aio-auth-form">
        <label>
          New Password
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          Confirm Password
          <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {error && <p className="aio-auth-form__error" role="alert">{error}</p>}
        <button type="submit" className="aio-btn aio-btn--gold aio-btn--block" disabled={loading}>
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
      <p className="aio-auth-card__links"><Link to={aioPaths.login}>Sign In</Link></p>
    </div>
  );
}
