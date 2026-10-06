/**
 * IFTA three-mode proof — asset manifest (authority → runtime binding).
 * Source: docs/aio/ifta/authority-bundle + experience contracts; no paid generation.
 */
export type IftaAssetRecord = {
  authoritySource: string;
  actor: 'PUBLIC' | 'CLIENT' | 'STAFF';
  route: string;
  purpose: string;
  path: string;
  crop: string;
  responsive: string;
};

export const IFTA_ASSET_MANIFEST: IftaAssetRecord[] = [
  {
    authoritySource: 'AIO_IFTA_PUBLIC_PAGE_CONTRACT.json · THRESHOLD',
    actor: 'PUBLIC',
    route: '/services/ifta-filing',
    purpose: 'Compliance mark — IFTA / fuel tax service identity',
    path: '/brand/icons/compliance/aio-icon-ifta-fuel-tax.png',
    crop: 'contain · icon tile',
    responsive: 'fixed 48–64px mobile/desktop',
  },
  {
    authoritySource: 'AIO_IFTA_VISUAL_CONTRACT · PUBLIC cinematic hero',
    actor: 'PUBLIC',
    route: '/services/ifta-filing',
    purpose: 'Dark hero atmosphere — road / operational (CSS layer, no stock)',
    path: 'ifta-ui.css · .ifta-public-hero__atmosphere',
    crop: 'full-bleed gradient mesh',
    responsive: 'independent mobile/desktop composition',
  },
  {
    authoritySource: 'CLIENT FILING ROOM authority · quarter specimen',
    actor: 'CLIENT',
    route: '/portal/workspaces/ifta/:quarter',
    purpose: 'Quarter card hero — mountain/highway tone',
    path: 'ifta-ui.css · .ifta-client-hero__scene',
    crop: 'cover bottom-weighted',
    responsive: 'shorter strip mobile · wide band tablet/desktop',
  },
  {
    authoritySource: 'AIO_IFTA_STAFF_WORKSPACE_CONTRACT · queue',
    actor: 'STAFF',
    route: '/office/workspaces/ifta',
    purpose: 'Operational mark in tight header',
    path: '/brand/icons/compliance/aio-icon-ifta-fuel-tax.png',
    crop: 'contain',
    responsive: '32px header mark',
  },
  {
    authoritySource: 'INTERACTION 09 · RUN FAQS',
    actor: 'PUBLIC',
    route: '/services/ifta-filing#run-faqs',
    purpose: 'Interaction identity 09 — RUN FAQS section anchor',
    path: 'IftaPublicPage · #run-faqs',
    crop: 'n/a',
    responsive: 'stacked FAQ mobile · two-column desktop where space',
  },
  {
    authoritySource: 'INTERACTION 09 · RUN FAQS',
    actor: 'STAFF',
    route: '/office/workspaces/ifta/:clientId/:quarter',
    purpose: 'Staff case auxiliary — RUN FAQS panel (identity preserved)',
    path: 'IftaStaffCasePage · RunFaqsPanel',
    crop: 'n/a',
    responsive: 'sidebar tablet/desktop · accordion mobile',
  },
];
