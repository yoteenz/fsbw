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
        <div className="aio-auth-nav-section">
          <p className="aio-auth-nav-section__label">Account</p>
          <Link to={aioPaths.portal} className="aio-mobile-nav__link" onClick={onNavigate}>
            My Portal
          </Link>
          <button
            type="button"
            className="aio-mobile-nav__link aio-mobile-nav__link--button"
            onClick={() => void handleSignOut()}
          >
            Log Out
          </button>
        </div>
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
      <AIOButton to={aioPaths.login} variant="outline-gold" size="sm" className="aio-header__auth-login-mobile">
        Log In
      </AIOButton>
    );
  }

  if (variant === 'mobile-menu') {
    return (
      <div className="aio-auth-nav-section">
        <p className="aio-auth-nav-section__label">Account</p>
        <Link to={aioPaths.login} className="aio-mobile-nav__link" onClick={onNavigate}>
          Log In
        </Link>
        <p className="aio-auth-nav-section__eyebrow">New to All In One?</p>
        <AIOButton to={aioPaths.signUp} variant="gold" size="sm" className="aio-mobile-nav__signup-btn" onClick={onNavigate}>
          Sign Up
        </AIOButton>
        {isDemoMode() ? (
          <Link to={aioPaths.portal} className="aio-mobile-nav__sublink" onClick={onNavigate}>
            Enter Demo Portal →
          </Link>
        ) : null}
      </div>
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
