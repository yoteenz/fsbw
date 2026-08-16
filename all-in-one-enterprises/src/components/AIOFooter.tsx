import { Link } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';
import { AIOLogo } from './AIOLogo';

const footerGroups = [
  {
    heading: 'Services',
    links: [
      { label: 'Permitting & Compliance', href: aioPaths.permitting },
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
      { label: 'About Us', href: aioPaths.about },
      { label: 'Contact', href: aioPaths.contact },
      { label: 'Roadmap', href: aioPaths.roadmap },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Start Your Business', href: aioPaths.businessFormation },
      { label: 'Compliance Guide', href: aioPaths.roadmap },
      { label: 'Insurance Assistance', href: aioPaths.insurance },
      { label: 'Factoring Solutions', href: aioPaths.factoring },
    ],
  },
  {
    heading: 'Client Access',
    links: [{ label: 'Client Portal', href: aioPaths.portal }],
  },
  {
    heading: 'Contact',
    links: [
      { label: aioAppConfig.contact.phone, href: aioAppConfig.contact.phoneHref },
      { label: aioAppConfig.contact.email, href: aioAppConfig.contact.emailHref },
    ],
  },
];

export function AIOFooter() {
  return (
    <footer className="aio-footer">
      <div className="aio-footer__grid">
        <div>
          <AIOLogo />
          <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)' }}>
            {aioAppConfig.company.tagline}
          </p>
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
          © {new Date().getFullYear()} {aioAppConfig.company.legalName} · Debug preview environment
        </p>
      </div>
    </footer>
  );
}
