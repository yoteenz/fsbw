import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { aioAppConfig } from '../../config/appConfig';
import { aioPaths } from '../../utils/paths';
import { AIOLogo } from '../AIOLogo';

type FooterGroup = {
  heading: string;
  links: { label: string; href: string }[];
};

const footerGroups: FooterGroup[] = [
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

export function AioMobileFooterAccordion() {
  const baseId = useId();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <footer className="aio-footer aio-footer--mobile-accordion">
      <div className="aio-footer-accordion">
        {footerGroups.map((group) => {
          const panelId = `${baseId}-${group.heading}`;
          const isOpen = open === group.heading;
          return (
            <div key={group.heading} className="aio-footer-accordion__item">
              <button
                type="button"
                className="aio-footer-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : group.heading)}
              >
                <span>{group.heading}</span>
                <span className="aio-footer-accordion__chevron" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen ? (
                <ul id={panelId} className="aio-footer-accordion__panel">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="aio-footer-accordion__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="aio-footer-accordion__identity">
        <AIOLogo variant="footer" />
        <p className="aio-footer-accordion__tagline">
          WHERE BUSINESS
          <br />
          MEETS THE ROAD.
        </p>
      </div>

      <div className="aio-footer-accordion__legal">
        <Link to={aioPaths.contact}>Privacy Policy</Link>
        <Link to={aioPaths.contact}>Terms of Service</Link>
        <Link to={aioPaths.contact}>Accessibility</Link>
      </div>

      <p className="aio-footer-accordion__copy">
        © {new Date().getFullYear()} {aioAppConfig.company.legalName} All rights reserved.
      </p>
      <p className="aio-footer-accordion__disclaimer">{aioAppConfig.disclaimer}</p>
    </footer>
  );
}
