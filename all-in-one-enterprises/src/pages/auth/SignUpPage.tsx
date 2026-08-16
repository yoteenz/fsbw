import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, type SignUpAccountType } from '../../auth/authService';
import { isBackendMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

const accountTypes: { value: SignUpAccountType; label: string }[] = [
  { value: 'carrier', label: 'Carrier / Owner Operator' },
  { value: 'fleet', label: 'Fleet' },
  { value: 'shipper', label: 'Shipper' },
  { value: 'unsure', label: 'Not Sure Yet' },
];

export function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    accountType: 'carrier' as SignUpAccountType,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isBackendMode()) {
      setError('Account creation requires backend mode with dedicated All In One Supabase credentials.');
      return;
    }
    setLoading(true);
    setError(null);
    const { user, error: err } = await signUp(form);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    if (user && !user.email_confirmed_at) {
      setVerifySent(true);
      return;
    }
    navigate(aioPaths.onboarding);
  };

  if (verifySent) {
    return (
      <div className="aio-auth-card">
        <h1>Verify your email</h1>
        <p>We sent a verification link to <strong>{form.email}</strong>. Please confirm your email before signing in.</p>
        <Link to={aioPaths.login} className="aio-btn aio-btn--gold">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <div className="aio-auth-card">
      <h1>Create Account</h1>
      <p className="aio-auth-card__sub">Start your All In One business journey</p>
      <form onSubmit={onSubmit} className="aio-auth-form">
        <div className="aio-auth-form__row">
          <label>
            First Name
            <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </label>
          <label>
            Last Name
            <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </label>
        </div>
        <label>
          Email
          <input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Password
          <input type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <label>
          Business Name
          <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        </label>
        <label>
          Account Type
          <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value as SignUpAccountType })}>
            {accountTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        {error && <p className="aio-auth-form__error" role="alert">{error}</p>}
        <button type="submit" className="aio-btn aio-btn--gold aio-btn--block" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="aio-auth-card__links">
        Already have an account? <Link to={aioPaths.login}>Sign in</Link>
      </p>
    </div>
  );
}
