import { Link, Outlet, useLocation } from 'react-router-dom';
import { AIOLogo } from '../components/AIOLogo';
import { aioPaths } from '../utils/paths';

export function AIOAuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname.endsWith('/login');
  const isSignUp = location.pathname.includes('/signup') || location.pathname.includes('/sign-up');

  return (
    <div className="aio-app aio-auth">
      <div className="aio-auth__shell">
        <header className="aio-auth__header">
          <div className="aio-auth__header-row">
            <Link to={aioPaths.home}>
              <AIOLogo />
            </Link>
            <Link to={aioPaths.home} className="aio-auth__home-link">
              Back to Home
            </Link>
          </div>
          <p className="aio-auth__header-switch">
            {isLogin ? (
              <>
                Need an account? <Link to={aioPaths.signUp}>Sign Up</Link>
              </>
            ) : isSignUp ? (
              <>
                Already have an account? <Link to={aioPaths.login}>Log In</Link>
              </>
            ) : (
              <>
                <Link to={aioPaths.login}>Log In</Link>
                {' · '}
                <Link to={aioPaths.signUp}>Sign Up</Link>
              </>
            )}
          </p>
        </header>
        <main className="aio-auth__main">
          <Outlet />
        </main>
        <footer className="aio-auth__footer">
          <p>Secure access for All In One Enterprises Inc.</p>
        </footer>
      </div>
    </div>
  );
}
