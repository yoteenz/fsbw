import { aioPaths } from '../utils/paths';
import { MY_OFFICE_DISPLAY_NAME } from './displayNames';

export type PortalNavItem = { label: string; href: string; section?: string };

/** Carrier portal primary nav — structurally aligned to customer containers (no visual redesign). */
export function buildCarrierPortalNav(): PortalNavItem[] {
  return [
    { label: MY_OFFICE_DISPLAY_NAME, href: aioPaths.portal, section: 'MY OFFICE' },
    { label: 'My Business', href: aioPaths.portalBusiness, section: 'MY BUSINESS' },
    { label: 'Road Ready', href: aioPaths.roadReady, section: 'MY BUSINESS' },
    { label: 'Fleet', href: aioPaths.portalFleet, section: 'MY BUSINESS' },
    { label: 'Insurance', href: aioPaths.portalInsurance, section: 'MY BUSINESS' },
    { label: 'Calendar', href: aioPaths.portalCalendar, section: 'MY BUSINESS' },
    { label: 'Renewals', href: aioPaths.portalRenewals, section: 'MY BUSINESS' },
    { label: 'Operations', href: aioPaths.portalOperations, section: 'OPERATIONS' },
    { label: 'Dispatch', href: aioPaths.portalDispatch, section: 'OPERATIONS' },
    { label: 'Load Board', href: aioPaths.portalLoadBoard, section: 'OPERATIONS' },
    { label: 'FleetCare', href: aioPaths.portalFleetCare, section: 'OPERATIONS' },
    { label: 'DriverLink', href: aioPaths.portalDriverLink, section: 'OPERATIONS' },
    { label: 'AIO Freight', href: aioPaths.portalBrokerage, section: 'OPERATIONS' },
    { label: 'Money', href: aioPaths.portalMoney, section: 'FINANCES' },
    { label: 'Billing', href: aioPaths.portalBilling, section: 'FINANCES' },
    { label: 'Factoring', href: aioPaths.portalFactoring, section: 'FINANCES' },
    { label: 'Bookkeeping', href: aioPaths.portalBookkeeping, section: 'FINANCES' },
    { label: 'Documents', href: aioPaths.portalDocuments, section: 'VAULT' },
    { label: 'Vault', href: aioPaths.portalVault, section: 'VAULT' },
    { label: 'Inbox', href: aioPaths.portalInbox, section: 'INBOX' },
    { label: 'Service Requests', href: aioPaths.portalRequestsCenter, section: 'ACCOUNT' },
    { label: 'Team', href: aioPaths.portalTeam, section: 'ACCOUNT' },
    { label: 'Settings', href: aioPaths.portalSettings, section: 'ACCOUNT' },
  ];
}

export function buildShipperPortalNav(): PortalNavItem[] {
  return [
    { label: 'Shipper Home', href: aioPaths.shipper },
    { label: 'Shipments', href: aioPaths.shipperShipments },
    { label: 'Quotes', href: aioPaths.shipperQuotes },
    { label: 'Billing', href: aioPaths.shipperBilling },
    { label: 'Inbox', href: aioPaths.portalInbox },
  ];
}
