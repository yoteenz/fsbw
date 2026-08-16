import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthStepIndicator } from '../../components/auth/AuthStepIndicator';
import { signUp, type SignUpAccountType, resendVerification } from '../../auth/authService';
import { completeDemoSignup, saveDemoSignupDraft } from '../../auth/demoSignup';
import { returnUrlFromSearch, sanitizeReturnUrl } from '../../auth/returnUrl';
import { isBackendMode, isDemoMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';

type Step = 1 | 2 | 3;

const usageOptions: { value: SignUpAccountType; label: string; description: string }[] = [
  { value: 'carrier', label: 'Trucking Business / Carrier', description: 'Owner-operator or carrier managing compliance and operations.' },
  { value: 'shipper', label: 'Shipper', description: 'Ship freight and manage shipments through All In One.' },
  { value: 'unsure', label: 'Not Sure', description: 'Create your account — we will help you choose the right path.' },
];

const structureOptions = ['LLC', 'Corporation / INC', 'Sole Proprietor', 'Not Formed Yet', 'Not Sure'];

export function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = useMemo(
    () => sanitizeReturnUrl(returnUrlFromSearch(searchParams.toString()), aioPaths.onboarding),
    [searchParams],
  );

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    gettingStarted: false,
    businessStructure: 'Not Sure',
    accountType: 'carrier' as SignUpAccountType,
    termsAccepted: false,
    marketingOptIn: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [existingEmail, setExistingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  const businessNameForSubmit = form.gettingStarted
    ? form.businessName.trim() || `${form.firstName.trim() || 'My'} Trucking Business`
    : form.businessName.trim();

  const validateStep1 = (): boolean => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Please complete all required account fields.');
      return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!form.gettingStarted && !form.businessName.trim()) {
      setError('Enter your business name or select “I’m just getting started”.');
      return false;
    }
    if (!form.termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return false;
    }
    return true;
  };

  const onContinueStep1 = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateStep1()) return;
    setStep(2);
  };

  const onContinueStep2 = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateStep2()) return;
    setStep(3);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setExistingEmail(false);

    if (isDemoMode()) {
      setLoading(true);
      const draft = completeDemoSignup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        businessName: businessNameForSubmit,
        accountType: form.accountType,
        gettingStarted: form.gettingStarted,
        businessStructure: form.businessStructure,
        termsAccepted: form.termsAccepted,
        marketingOptIn: form.marketingOptIn,
        returnUrl,
      });
      setLoading(false);
      setVerifySent(true);
      saveDemoSignupDraft(draft);
      return;
    }

    if (!isBackendMode()) {
      setError('Account creation requires backend mode with All In One Supabase credentials.');
      return;
    }

    setLoading(true);
    const { user, error: err } = await signUp({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      businessName: businessNameForSubmit,
      accountType: form.accountType,
      gettingStarted: form.gettingStarted,
      marketingOptIn: form.marketingOptIn,
    });
    setLoading(false);

    if (err) {
      if (err.toLowerCase().includes('already exists')) {
        setExistingEmail(true);
      }
      setError(err);
      return;
    }

    if (user && !user.email_confirmed_at) {
      setVerifySent(true);
      return;
    }

    navigate(`${aioPaths.onboarding}?return=${encodeURIComponent(returnUrl)}`, { replace: true });
  };

  const onResend = async () => {
    if (isDemoMode()) return;
    setLoading(true);
    const { error: err } = await resendVerification(form.email.trim());
    setLoading(false);
    setError(err);
  };

  if (verifySent) {
    return (
      <div className="aio-auth-card">
        <h1>Check your email</h1>
        <p className="aio-auth-card__sub">
          We sent a verification link to <strong>{form.email}</strong>.
          {isDemoMode() ? ' (Demo — no email was sent.)' : ''}
        </p>
        {!isDemoMode() ? (
          <button type="button" className="aio-btn aio-btn--outline aio-btn--block" disabled={loading} onClick={() => void onResend()}>
            Resend Email
          </button>
        ) : null}
        <Link
          to={`${aioPaths.onboarding}?return=${encodeURIComponent(returnUrl)}`}
          className="aio-btn aio-btn--gold aio-btn--block"
          style={{ marginTop: '0.75rem' }}
        >
          Continue (Demo)
        </Link>
        <p className="aio-auth-card__links">
          <Link to={aioPaths.login}>Log In</Link>
        </p>
      </div>
    );
  }

  if (existingEmail) {
    return (
      <div className="aio-auth-card">
        <h1>An account already exists for this email</h1>
        <p className="aio-auth-card__sub">Log in or reset your password to continue.</p>
        <Link to={aioPaths.login} className="aio-btn aio-btn--gold aio-btn--block">
          Log In
        </Link>
        <p className="aio-auth-card__links">
          <Link to={aioPaths.forgotPassword}>Forgot Password?</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="aio-auth-card aio-auth-card--wide">
      <AuthStepIndicator current={step} />
      <h1>Create your All In One account</h1>
      <p className="aio-auth-card__sub">
        Start your Road Ready™ roadmap, request services, track compliance, and manage your trucking business from one place.
      </p>

      {step === 1 ? (
        <form onSubmit={onContinueStep1} className="aio-auth-form">
          <p className="aio-auth-form__step-title">Step 1 — Your Account</p>
          <div className="aio-auth-form__row">
            <label>
              First Name
              <input
                required
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </label>
            <label>
              Last Name
              <input
                required
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </label>
          </div>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone <span className="aio-auth-form__optional">(optional)</span>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <p className="aio-auth-form__hint">At least 8 characters.</p>
          <label>
            Confirm Password
            <input
              type="password"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </label>
          {error ? <p className="aio-auth-form__error" role="alert">{error}</p> : null}
          <button type="submit" className="aio-btn aio-btn--gold aio-btn--block">
            Continue
          </button>
        </form>
      ) : null}

      {step === 2 ? (
        <form onSubmit={onContinueStep2} className="aio-auth-form">
          <p className="aio-auth-form__step-title">Step 2 — Your Business</p>
          <fieldset className="aio-auth-form__fieldset">
            <legend>Do you already have a trucking business?</legend>
            <label className="aio-auth-form__radio">
              <input
                type="radio"
                name="gettingStarted"
                checked={!form.gettingStarted}
                onChange={() => setForm({ ...form, gettingStarted: false })}
              />
              Yes — I already operate
            </label>
            <label className="aio-auth-form__radio">
              <input
                type="radio"
                name="gettingStarted"
                checked={form.gettingStarted}
                onChange={() => setForm({ ...form, gettingStarted: true })}
              />
              No — I&apos;m just getting started
            </label>
          </fieldset>
          <label>
            Business Name {!form.gettingStarted ? null : <span className="aio-auth-form__optional">(optional for now)</span>}
            <input
              autoComplete="organization"
              required={!form.gettingStarted}
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder={form.gettingStarted ? 'We will help you name it later' : ''}
            />
          </label>
          <label>
            Business structure <span className="aio-auth-form__optional">(optional)</span>
            <select value={form.businessStructure} onChange={(e) => setForm({ ...form, businessStructure: e.target.value })}>
              {structureOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <p className="aio-auth-form__disclaimer">General information only — not legal advice.</p>
          <label className="aio-auth-form__checkbox">
            <input
              type="checkbox"
              required
              checked={form.termsAccepted}
              onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
            />
            <span>
              I agree to the{' '}
              <Link to={aioPaths.contact} target="_blank" rel="noreferrer">Terms of Service</Link>
              {' '}and{' '}
              <Link to={aioPaths.contact} target="_blank" rel="noreferrer">Privacy Policy</Link>.
            </span>
          </label>
          <label className="aio-auth-form__checkbox">
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
            />
            <span>Send me helpful AIO updates and service reminders. (optional)</span>
          </label>
          {error ? <p className="aio-auth-form__error" role="alert">{error}</p> : null}
          <div className="aio-auth-form__nav-row">
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="submit" className="aio-btn aio-btn--gold">
              Continue
            </button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form onSubmit={onSubmit} className="aio-auth-form">
          <p className="aio-auth-form__step-title">Step 3 — Get Started</p>
          <fieldset className="aio-auth-form__fieldset">
            <legend>How will you use All In One?</legend>
            {usageOptions.map((opt) => (
              <label key={opt.value} className="aio-auth-form__radio aio-auth-form__radio--card">
                <input
                  type="radio"
                  name="accountType"
                  checked={form.accountType === opt.value}
                  onChange={() => setForm({ ...form, accountType: opt.value })}
                />
                <span>
                  <strong>{opt.label}</strong>
                  <small>{opt.description}</small>
                </span>
              </label>
            ))}
          </fieldset>
          {error && !existingEmail ? <p className="aio-auth-form__error" role="alert">{error}</p> : null}
          <div className="aio-auth-form__nav-row">
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="submit" className="aio-btn aio-btn--gold" disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </div>
        </form>
      ) : null}

      <p className="aio-auth-card__links">
        Already have an account? <Link to={aioPaths.login}>Log In</Link>
      </p>
    </div>
  );
}
