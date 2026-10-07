import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { loadDemoStore, updateDemoStore } from '../../demo/demoStore';
import { redeemActivationInvite } from '../../client-migration/services/activationInviteService';
import { aioPaths } from '../../utils/paths';

export function OfficeActivationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token?.trim()) {
      setError('Missing activation token');
      return;
    }
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters');
      return;
    }
    setBusy(true);
    setError(null);
    const store = loadDemoStore();
    const { store: next, organizationId, error: redeemError } = await redeemActivationInvite(store, token);
    if (redeemError || !organizationId) {
      setError(redeemError ?? 'Activation failed');
      setBusy(false);
      return;
    }
    updateDemoStore(() => next);
    navigate(aioPaths.portalActivationReview, { replace: true, state: { organizationId } });
    setBusy(false);
  }

  const client = loadDemoStore().clients.find((c) => c.clientLifecycle === 'INVITED' || c.clientLifecycle === 'PREBUILT');

  return (
    <div className="aio-page" style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 className="aio-display-md">Activate your AIO office</h1>
      <p className="aio-body" style={{ margin: '1rem 0' }}>
        {client?.companyName ? `${client.companyName} — ` : ''}
        Set your password to review what AIO already knows. AIO never emails plaintext passwords.
      </p>
      <form onSubmit={onSubmit} className="aio-stack" style={{ gap: '1rem' }}>
        <label className="aio-label">
          New password
          <input
            className="aio-input"
            type="password"
            data-aio-password=""
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </label>
        {error ? <p className="aio-body" style={{ color: 'var(--aio-danger, #c00)' }}>{error}</p> : null}
        <button type="submit" className="aio-btn aio-btn--gold" disabled={busy}>
          {busy ? 'Working…' : 'Continue to review'}
        </button>
      </form>
      <p className="aio-body" style={{ marginTop: '1.5rem' }}>
        <Link to={aioPaths.login}>Already signed in</Link>
      </p>
    </div>
  );
}
