import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthBrandIntro } from '../../components/auth/AuthBrandIntro';
import { AuthError } from '../../components/auth/AuthError';
import { AuthPasswordInput } from '../../components/auth/AuthPasswordInput';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';
import { PasswordRequirements } from '../../components/auth/PasswordRequirements';
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
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
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
    <>
      <AuthBrandIntro
        headline={
          <>
            Set new
            <br />
            password.
          </>
        }
        supporting="Choose a strong password for your AIO account."
      />
      <form onSubmit={onSubmit} className="aio-auth-premium__form">
        <AuthPasswordInput
          label="New Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <AuthPasswordInput
          label="Confirm Password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <PasswordRequirements password={password} confirmPassword={confirm} />
        {error ? <AuthError title="Could not update password" message={error} /> : null}
        <AuthPrimaryButton loading={loading} loadingLabel="Updating…">
          Update Password →
        </AuthPrimaryButton>
      </form>
      <Link to={aioPaths.login} className="aio-auth-premium__back-link">
        ← Back to Log In
      </Link>
    </>
  );
}
