import { AioMobileFooterAccordion } from './homepage/AioMobileFooterAccordion';
import { Link } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';
import { AIOLogo } from './AIOLogo';

const footerGroups = [
  {
    heading: 'Services',
    links: [
      { label: 'Start Your Business', href: aioPaths.startYourBusiness },
      { label: 'Permits & Compliance', href: aioPaths.permitting },
      { label: 'Business Formation', href: aioPaths.businessFormation },
      { label: 'Trucking Insurance', href: aioPaths.insurance },
      { label: 'Dispatching', href: aioPaths.dispatching },
      { label: 'Factoring', href: aioPaths.factoring },
      { label: 'Brokerage', href: aioPaths.brokerage },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: aioPaths.about },
      { label: 'Contact', href: aioPaths.contact },
      { label: 'Client Portal', href: aioPaths.clientPortalInfo },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Road Ready™', href: aioPaths.roadReadyPublic },
      { label: 'Compliance Guide', href: aioPaths.roadmap },
      { label: 'Get Started', href: aioPaths.getStarted },
    ],
  },
  {
    heading: 'Contact',
    links: [
      { label: aioAppConfig.contact.phone, href: aioAppConfig.contact.phoneHref },
      { label: aioAppConfig.contact.email, href: aioAppConfig.contact.emailHref },
    ],
  },
];

function AIOFooterDesktop() {
  return (
    <footer className="aio-footer aio-footer--desktop">
      <div className="aio-footer__grid">
        <div>
          <AIOLogo variant="footer" />
          <p className="aio-footer__tagline">{aioAppConfig.company.tagline}</p>
          <Link to={aioPaths.login} className="aio-footer__link" style={{ display: 'inline-block', marginTop: '0.75rem' }}>
            Log In
          </Link>
          {' · '}
          <Link to={aioPaths.signUp} className="aio-footer__link">
            Sign Up
          </Link>
        </div>
        {footerGroups.map((group) => (
          <div key={group.heading}>
            <h3 className="aio-footer__heading">{group.heading}</h3>
            {group.links.map((link) => (
              <Link key={link.label} to={link.href} className="aio-footer__link">
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="aio-footer__disclaimer">
        <p>{aioAppConfig.disclaimer}</p>
        <p className="aio-footer__copy">
          © {new Date().getFullYear()} {aioAppConfig.company.legalName}
        </p>
      </div>
    </footer>
  );
}

export function AIOFooter() {
  return (
    <>
      <div className="aio-mobile-only">
        <AioMobileFooterAccordion />
      </div>
      <div className="aio-desktop-only">
        <AIOFooterDesktop />
      </div>
    </>
  );
}
