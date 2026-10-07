import { Link } from 'react-router-dom';
import type { Client, OrganizationMember } from '../../demo/demoTypes';
import type { BusinessProfile } from '../../road-ready/roadReadyTypes';
import { aioPaths } from '../../utils/paths';
import type { ReviewSectionResponse } from '../types';
import { AioMigrationCTA, AioMigrationPanel, AioMonogram, AioStatusPill, AioWhatNext, Ico, type IcoName } from './AioMigrationKit';
import { MigrationSelectSteps } from './MigrationExistingScreens';

const CHOICES: Array<{ response: ReviewSectionResponse; label: string; icon: IcoName; tone: 'green' | 'amber' | 'gray' }> = [
  { response: 'LOOKS_RIGHT', label: 'LOOKS RIGHT', icon: 'success', tone: 'green' },
  { response: 'NEEDS_UPDATE', label: 'NEEDS AN UPDATE', icon: 'pencil', tone: 'amber' },
  { response: 'NOT_SURE', label: 'I’M NOT SURE', icon: 'help-mark', tone: 'gray' },
];

const ROLE_LABEL: Partial<Record<OrganizationMember['role'], string>> = {
  owner: 'Owner',
  admin: 'Administrator',
  operations: 'Operations',
  driver: 'Driver',
};

/** "1234 Freedom Way, Freightville, TX 75001" → street line + locality line (as drawn in the authority). */
function addressLines(address: string | undefined): string[] {
  const raw = (address ?? '').trim();
  if (!raw) return [];
  const cut = raw.indexOf(',');
  return cut < 0 ? [raw] : [raw.slice(0, cut).trim(), raw.slice(cut + 1).trim()];
}

/** PASS 05 · client reconciliation, company section (AIO-MIG-ACTIVATION-COMPANY-001). Client actor: no staff dock. */
export function ActivationCompanyScreen({
  client,
  business,
  identifiers,
  contact,
  active,
  response,
  onRespond,
  onContinue,
}: {
  client: Client;
  business?: BusinessProfile;
  /** Strong identifiers (USDOT · MC), shown under the name when no street address is on file. */
  identifiers: string[];
  contact?: OrganizationMember;
  active: boolean;
  response?: ReviewSectionResponse;
  onRespond: (response: ReviewSectionResponse) => void;
  onContinue: () => void;
}) {
  const name = business?.legalName || client.companyName;
  const phone = business?.phone || client.contactPhone;
  const email = business?.email || client.contactEmail;
  const role = contact ? ROLE_LABEL[contact.role] : undefined;
  const address = addressLines(business?.address || business?.mailingAddress);
  const locator = address.length ? address : identifiers.length ? [identifiers.join('  |  ')] : [];
  return (
    <div className="amg-activation amg-company">
      <MigrationSelectSteps current={0} />
      <AioMigrationPanel className="amg-cinfo">
        <h2 className="amg-cinfo__title">COMPANY INFORMATION</h2>
        <p className="amg-cinfo__sub">This information is already on file in AIO.</p>
        <span className="amg-cinfo__pill">
          {active ? (
            <AioStatusPill tone="green" icon="success">ACTIVE</AioStatusPill>
          ) : (
            <AioStatusPill tone="red" icon="warning">NOT ACTIVE YET</AioStatusPill>
          )}
        </span>
        <AioMonogram name={name} className="amg-cinfo__mono" />
        <b className="amg-cinfo__name">{name}</b>
        <span className="amg-cinfo__addr">
          {locator.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
        <span className="amg-cinfo__rule amg-cinfo__rule--1" aria-hidden="true" />
        <ul className="amg-cinfo__contact">
          {phone ? (
            <li>
              <Ico name="phone" />
              <span>{phone}</span>
            </li>
          ) : null}
          {email ? (
            <li>
              <Ico name="envelope" />
              <span>{email}</span>
            </li>
          ) : null}
          <li>
            <Ico name="person" />
            <span>
              {client.contactName}
              <small>{role ?? 'Primary contact'}</small>
            </span>
          </li>
        </ul>
        <span className="amg-cinfo__rule amg-cinfo__rule--2" aria-hidden="true" />
        <h3 className="amg-cinfo__q">DOES THIS INFORMATION LOOK RIGHT?</h3>
        <p className="amg-cinfo__qs">Please review the company details above and let us know.</p>
        <div className="amg-choices" role="group" aria-label="Company information">
          {CHOICES.map((choice) => (
            <button
              key={choice.response}
              type="button"
              className={`amg-choice amg-choice--${choice.tone}${response === choice.response ? ' is-on' : ''}`}
              aria-pressed={response === choice.response}
              onClick={() => onRespond(choice.response)}
            >
              <span className="amg-choice__icon" aria-hidden="true">
                <Ico name={choice.icon} />
              </span>
              <span className="amg-choice__label">{choice.label}</span>
            </button>
          ))}
        </div>
      </AioMigrationPanel>
      <AioWhatNext>
        Once you confirm the company information, we’ll keep your existing records and move to the next step to activate your account.
      </AioWhatNext>
      <AioMigrationCTA label="CONTINUE" onClick={onContinue} />
    </div>
  );
}

const OFFICE: Array<{ to: string; title: string; body: string; icon: IcoName }> = [
  { to: aioPaths.portalBusiness, title: 'My Business', body: 'Your company details and profile', icon: 'building' },
  { to: aioPaths.portalOperations, title: 'Operations', body: 'Manage your trucks, drivers, and compliance', icon: 'gear' },
  { to: aioPaths.portalMoney, title: 'Finances', body: 'View your financials and documents', icon: 'bars' },
  { to: aioPaths.portalVault, title: 'Vault', body: 'Access your important files', icon: 'shield' },
  { to: aioPaths.portalInbox, title: 'Inbox', body: 'Your messages and notifications', icon: 'envelope' },
];

/** PASS 06 · active arrival (AIO-MIG-ACTIVATION-COMPLETE-002). Render only for lifecycle ACTIVE — the caller gates it. */
export function ActivationCompleteScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="amg-activation amg-arrival">
      <span className="amg-arrival__state">
        <Ico name="success" className="amg-arrival__check" />
        ACTIVE
      </span>
      <AioMigrationPanel className="amg-office">
        <h2 className="amg-office__title">YOUR OFFICE IS READY</h2>
        <p className="amg-office__sub">Access everything you need, all in one place.</p>
        <ul className="amg-office__list">
          {OFFICE.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className="amg-office__row">
                <span className="amg-office__tile" aria-hidden="true">
                  <Ico name={item.icon} />
                </span>
                <b>{item.title}</b>
                <span>{item.body}</span>
                <Ico name="chevron" className="amg-office__chev" />
              </Link>
            </li>
          ))}
        </ul>
        <AioMigrationCTA label="ENTER YOUR OFFICE" onClick={onEnter} />
      </AioMigrationPanel>
    </div>
  );
}
