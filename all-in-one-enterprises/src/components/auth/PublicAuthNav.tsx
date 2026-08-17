import { Link, useNavigate } from 'react-router-dom';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { isDemoMode } from '../../config/dataMode';
import { aioPaths } from '../../utils/paths';
import { AIOButton } from '../AIOButton';

type Props = {
  variant: 'desktop' | 'mobile-header' | 'mobile-menu';
  onNavigate?: () => void;
};

export function PublicAuthNav({ variant, onNavigate }: Props) {
  const { isAuthenticated, signOut, loading } = useAIOAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    onNavigate?.();
    navigate(aioPaths.home);
  };

  if (loading) return null;

  if (isAuthenticated) {
    if (variant === 'mobile-menu') {
      return (
        <section className="aio-mobile-drawer__section aio-mobile-drawer__section--account">
          <h2 className="aio-mobile-drawer__section-label">Account</h2>
          <ul className="aio-mobile-drawer__list">
            <li>
              <Link to={aioPaths.portal} className="aio-mobile-drawer__row" onClick={onNavigate}>
                <span className="aio-mobile-drawer__row-label">My Portal</span>
                <span className="aio-mobile-drawer__chevron" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
            <li>
              <button type="button" className="aio-mobile-drawer__row aio-mobile-drawer__row--button" onClick={() => void handleSignOut()}>
                <span className="aio-mobile-drawer__row-label">Log Out</span>
                <span className="aio-mobile-drawer__chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          </ul>
        </section>
      );
    }
    return (
      <div className="aio-header__auth-actions">
        <AIOButton to={aioPaths.portal} variant="gold" size="sm">
          Portal
        </AIOButton>
        <button type="button" className="aio-header__auth-link" onClick={() => void handleSignOut()}>
          Log Out
        </button>
      </div>
    );
  }

  if (variant === 'mobile-header') {
    return (
      <div className="aio-header__auth-mobile">
        <AIOButton to={aioPaths.login} variant="outline-gold" size="sm">
          Log In
        </AIOButton>
        <AIOButton to={aioPaths.signUp} variant="gold" size="sm">
          Sign Up
        </AIOButton>
      </div>
    );
  }

  if (variant === 'mobile-menu') {
    return (
      <section className="aio-mobile-drawer__section aio-mobile-drawer__section--account">
        <h2 className="aio-mobile-drawer__section-label">Account</h2>
        <ul className="aio-mobile-drawer__list">
          <li>
            <Link to={aioPaths.login} className="aio-mobile-drawer__row" onClick={onNavigate}>
              <span className="aio-mobile-drawer__row-label">Log In</span>
              <span className="aio-mobile-drawer__chevron" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
          <li>
            <Link to={aioPaths.signUp} className="aio-mobile-drawer__row" onClick={onNavigate}>
              <span className="aio-mobile-drawer__row-label">Sign Up</span>
              <span className="aio-mobile-drawer__chevron" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
          {isDemoMode() ? (
            <li>
              <Link to={aioPaths.portal} className="aio-mobile-drawer__row" onClick={onNavigate}>
                <span className="aio-mobile-drawer__row-label">Enter Demo Portal</span>
                <span className="aio-mobile-drawer__chevron" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ) : null}
        </ul>
      </section>
    );
  }

  return (
    <div className="aio-header__auth-actions">
      <AIOButton to={aioPaths.login} variant="outline-gold" size="sm">
        Log In
      </AIOButton>
      <AIOButton to={aioPaths.signUp} variant="gold" size="sm">
        Sign Up
      </AIOButton>
    </div>
  );
}
