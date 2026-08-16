import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { isBackendMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';
import { Link } from 'react-router-dom';

export function PortalSettingsPage() {
  const { session, signOut } = useAIOAuth();

  return (
    <div className="aio-portal-page">
      <header className="aio-portal-page__header">
        <h1>Account Settings</h1>
      </header>

      <section className="aio-portal-panel">
        <h2>Profile</h2>
        {isBackendMode() && session ? (
          <dl className="aio-office-dl">
            <dt>Name</dt>
            <dd>{session.profile?.firstName} {session.profile?.lastName}</dd>
            <dt>Email</dt>
            <dd>{session.profile?.email}</dd>
          </dl>
        ) : (
          <p className="aio-prototype-note">Demo mode — sign in with backend credentials for persistent profile.</p>
        )}
      </section>

      <section className="aio-portal-panel">
        <h2>Business Information</h2>
        {session?.organization ? (
          <dl className="aio-office-dl">
            <dt>Business</dt>
            <dd>{session.organization.name}</dd>
            <dt>Type</dt>
            <dd>{session.organization.organizationType.replace('_', ' ')}</dd>
          </dl>
        ) : (
          <p>—</p>
        )}
      </section>

      <section className="aio-portal-panel">
        <h2>Password & Security</h2>
        <Link to={aioPaths.portalSettingsSecurity} className="aio-btn aio-btn--outline aio-btn--sm">Security settings</Link>
        <Link to={aioPaths.forgotPassword} className="aio-btn aio-btn--outline aio-btn--sm">Reset password</Link>
      </section>

      <section className="aio-portal-panel">
        <h2>Privacy</h2>
        <Link to={aioPaths.portalSettingsPrivacy} className="aio-btn aio-btn--outline aio-btn--sm">Privacy settings</Link>
      </section>

      <section className="aio-portal-panel">
        <h2>Connected Services</h2>
        <Link to={aioPaths.portalConnections} className="aio-btn aio-btn--outline aio-btn--sm">Manage connections</Link>
      </section>

      <section className="aio-portal-panel">
        <p className="aio-prototype-note">Coming soon — in-app and email notification controls.</p>
      </section>

      {isBackendMode() && (
        <button type="button" className="aio-btn aio-btn--outline" onClick={() => void signOut()}>
          Sign Out
        </button>
      )}
    </div>
  );
}
