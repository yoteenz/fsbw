/**
 * Authoritative AIO brokerage operating model.
 * AIO is THE broker — not a multi-broker marketplace.
 */

export const AIO_BROKERAGE_OPERATING_MODEL = `
SHIPPER → AIO BROKERAGE → AIO OFFICE → AIO LOAD BOARD → APPROVED CARRIERS / DRIVERS
`.trim();

export const AIO_BROKERAGE_PRINCIPLES = [
  'AIO owns the shipper relationship and brokers every load.',
  'The Load Board is AIO private carrier distribution — not a third-party broker marketplace.',
  'One canonical Load entity with role-specific authorized views (office / shipper / carrier / driver).',
  'Shipper rate, carrier rate, and AIO gross margin are never interchangeable.',
  'Internal brokerage economics are enforced in projection layers — not hidden with CSS.',
] as const;

/** UI copy — carrier-facing surfaces */
export const AIO_CARRIER_FREIGHT_DISCLOSURE =
  'Freight is brokered and distributed by All In One Enterprises. AIO is the broker — this is not a third-party broker marketplace.';

/** Dispatch TMS: external broker contacts a carrier may call to find freight elsewhere */
export const DISPATCH_EXTERNAL_BROKER_CONTACTS_LABEL = 'External Freight Broker Contacts';

export const DISPATCH_EXTERNAL_BROKER_CONTACTS_NOTE =
  'Contact directory for dispatch clients — third parties who broker freight outside AIO. Not AIO platform broker accounts or a load-posting marketplace.';

/** Office integrations: future authorized freight sources normalized into AIO loads */
export const FREIGHT_SOURCE_IMPORT_DISCLOSURE =
  'Future authorized freight sources import into AIO-owned loads. AIO staff review and publish to the AIO Load Board — carriers never browse third-party broker storefronts here.';
