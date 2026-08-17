import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthStepIndicator } from '../../components/auth/AuthStepIndicator';
import { AuthBrandIntro } from '../../components/auth/AuthBrandIntro';
import { AuthCheckbox } from '../../components/auth/AuthCheckbox';
import { AuthError } from '../../components/auth/AuthError';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthPasswordInput } from '../../components/auth/AuthPasswordInput';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';
import { AuthSecondaryButton } from '../../components/auth/AuthSecondaryButton';
import { PasswordRequirements } from '../../components/auth/PasswordRequirements';
import { signUp, type SignUpAccountType, resendVerification } from '../../auth/authService';
import { completeDemoSignup, saveDemoSignupDraft } from '../../auth/demoSignup';
import { returnUrlFromSearch, sanitizeReturnUrl } from '../../auth/returnUrl';
import { isBackendMode, isDemoMode } from '../../config/dataMode';
import { maskEmail } from '../../utils/maskEmail';
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
  const loginHref = `${aioPaths.login}?return=${encodeURIComponent(returnUrl)}`;

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
      setError('Enter your business name or select "I\'m just getting started".');
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
      <>
        <AuthBrandIntro
          headline="Check your email"
          supporting={
            <>
              We sent a verification link to{' '}
              <span className="aio-auth-premium__success-email">{maskEmail(form.email)}</span>.
              {isDemoMode() ? ' (Demo — no email was sent.)' : ''}
            </>
          }
        />
        {!isDemoMode() ? (
          <button
            type="button"
            className="aio-auth-premium__btn aio-auth-premium__btn--ghost"
            disabled={loading}
            onClick={() => void onResend()}
          >
            {loading ? 'Sending…' : 'Resend Email'}
          </button>
        ) : null}
        <Link
          to={`${aioPaths.onboarding}?return=${encodeURIComponent(returnUrl)}`}
          className="aio-auth-premium__btn aio-auth-premium__btn--primary"
          style={{ marginTop: '0.75rem' }}
        >
          Continue (Demo) →
        </Link>
        <Link to={loginHref} className="aio-auth-premium__back-link">
          ← Back to Log In
        </Link>
      </>
    );
  }

  if (existingEmail) {
    return (
      <>
        <AuthBrandIntro
          headline="Account already exists"
          supporting="Log in or reset your password to continue."
        />
        <AuthSecondaryButton to={loginHref}>Log In →</AuthSecondaryButton>
        <Link to={aioPaths.forgotPassword} className="aio-auth-premium__back-link">
          Forgot password?
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthStepIndicator current={step} />
      <AuthBrandIntro
        headline={
          <>
            Let&apos;s get your
            <br />
            business moving.
          </>
        }
        supporting="Create your account to build your plan, manage services, upload documents, and track your progress."
      />

      {step === 1 ? (
        <form onSubmit={onContinueStep1} className="aio-auth-premium__form aio-auth-form">
          <p className="aio-auth-form__step-title">Step 1 — Your Account</p>
          <div className="aio-auth-premium__row">
            <AuthInput
              label="First Name"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <AuthInput
              label="Last Name"
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <AuthInput
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <AuthInput
            label="Phone"
            type="tel"
            autoComplete="tel"
            optional
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <AuthPasswordInput
            label="Password"
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <AuthPasswordInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={(confirmPassword) => setForm({ ...form, confirmPassword })}
            autoComplete="new-password"
            required
          />
          <PasswordRequirements password={form.password} confirmPassword={form.confirmPassword} />
          {error ? <AuthError title="Please check your information" message={error} /> : null}
          <AuthPrimaryButton loading={false}>Continue →</AuthPrimaryButton>
        </form>
      ) : null}

      {step === 2 ? (
        <form onSubmit={onContinueStep2} className="aio-auth-premium__form aio-auth-form">
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
          <AuthInput
            label="Business Name"
            optional={form.gettingStarted}
            required={!form.gettingStarted}
            autoComplete="organization"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            placeholder={form.gettingStarted ? 'We will help you name it later' : undefined}
          />
          <div className="aio-auth-premium__field">
            <label className="aio-auth-premium__label" htmlFor="business-structure">
              Business structure <span className="aio-auth-premium__optional">(optional)</span>
            </label>
            <select
              id="business-structure"
              value={form.businessStructure}
              onChange={(e) => setForm({ ...form, businessStructure: e.target.value })}
            >
              {structureOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <p className="aio-auth-form__disclaimer">General information only — not legal advice.</p>
          <AuthCheckbox
            label={
              <span>
                I agree to the{' '}
                <Link to={aioPaths.contact} target="_blank" rel="noreferrer">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to={aioPaths.contact} target="_blank" rel="noreferrer">
                  Privacy Policy
                </Link>
                .
              </span>
            }
            required
            checked={form.termsAccepted}
            onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
          />
          <AuthCheckbox
            label="Send me helpful AIO updates and service reminders. (optional)"
            checked={form.marketingOptIn}
            onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
          />
          {error ? <AuthError title="Please check your information" message={error} /> : null}
          <div className="aio-auth-form__nav-row">
            <button type="button" className="aio-auth-premium__btn aio-auth-premium__btn--ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <AuthPrimaryButton loading={false}>Continue →</AuthPrimaryButton>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form onSubmit={onSubmit} className="aio-auth-premium__form aio-auth-form">
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
          {error && !existingEmail ? <AuthError title="Something went wrong" message={error} /> : null}
          <div className="aio-auth-form__nav-row">
            <button type="button" className="aio-auth-premium__btn aio-auth-premium__btn--ghost" onClick={() => setStep(2)}>
              Back
            </button>
            <AuthPrimaryButton loading={loading} loadingLabel="Creating account…">
              Create Account →
            </AuthPrimaryButton>
          </div>
        </form>
      ) : null}

      <div className="aio-auth-premium__alt">
        <p className="aio-auth-premium__alt-label">Already have an account?</p>
        <AuthSecondaryButton to={loginHref}>Log In →</AuthSecondaryButton>
      </div>
    </>
  );
}
