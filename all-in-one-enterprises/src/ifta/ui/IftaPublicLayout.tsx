import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { aioPaths } from '../../utils/paths';
import { IftaMark } from './IftaMark';
import './ifta-ui.css';

export function IftaPublicLayout() {
  return (
    <div className="ifta-root ifta-root--dark ifta-public-wrap">
      <div className="ifta-public-hero__atmosphere" aria-hidden="true" />
      <header className="ifta-tight-nav">
        <IftaMark />
        <nav className="ifta-tight-nav__links" aria-label="IFTA public">
          <Link to={aioPaths.services}>Services</Link>
          <Link to={aioPaths.login}>Log in</Link>
          <Link to={aioPaths.getStartedForService('ifta-filing')} className="ifta-cta">
            Request filing
          </Link>
        </nav>
      </header>
      <Outlet />
      <footer className="ifta-public-footer">All In One Enterprises · IFTA filing support</footer>
    </div>
  );
}
