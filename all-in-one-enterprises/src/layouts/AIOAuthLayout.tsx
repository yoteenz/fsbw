import { Link, Outlet } from 'react-router-dom';
import { AIOLogo } from '../components/AIOLogo';
import { aioPaths } from '../utils/paths';

export function AIOAuthLayout() {
  return (
    <div className="aio-app aio-auth">
      <div className="aio-auth__shell">
        <header className="aio-auth__header">
          <Link to={aioPaths.home}>
            <AIOLogo />
          </Link>
        </header>
        <main className="aio-auth__main">
          <Outlet />
        </main>
        <footer className="aio-auth__footer">
          <p>Secure sign-in for All In One Enterprises Inc.</p>
        </footer>
      </div>
    </div>
  );
}
