/** P0.VR.3I — Experience page curation constants */
export const EXPERIENCE_CURATION_SCHEMA_VERSION = 'studio-world-experience-curation@1';
export const EXPERIENCE_CURATION_STORE_RELATIVE_PATH = 'public/studio-world/experience-curation-store.json';

export const DESIGN_ROUTE_MANIFEST_VERSION_3_3 = '3.3.0';
export const DESIGN_ROUTE_MANIFEST_SCHEMA_V3_3 = 'studio-world-design-route-manifest@3.3';

export const FS_INTERNAL_WORKSPACE_SECTION = 'frontal-slayer:section:internal-workspace';

/** High-confidence Frontal Slayer founder/admin/workspace routes (not customer primary nav). */
export const FRONTAL_SLAYER_INTERNAL_ROUTE_PATTERNS: RegExp[] = [
  /^\/admin(\/|$)/,
  /^\/studio(\/|$)/,
  /^\/studio-os(\/|$)/,
  /^\/dashboard(\/|$)/,
  /^\/clients(\/|$)/,
  /^\/analytics(\/|$)/,
  /^\/backend(\/|$)/,
  /^\/meetings(\/|$)/,
  /^\/revenue(\/|$)/,
  /^\/audit(\/|$)/,
  /^\/workers(\/|$)/,
  /^\/headquarters(\/|$)/,
  /^\/founder-intelligence(\/|$)/,
  /^\/collaboration-intelligence(\/|$)/,
  /^\/expert-capture(\/|$)/,
  /^\/trend-desk(\/|$)/,
  /^\/onboarding(\/|$)/,
  /^\/context-updates(\/|$)/,
  /^\/context(\/|$)/,
  /^\/pending(\/|$)/,
  /^\/users(\/|$)/,
  /^\/all-in-one(\/|$)/,
  /^\/target(\/|$)/,
  /^\/vision\//,
  /^\/studio-institute(\/|$)/,
  /^\/{ pathname:/,
  /^\/{ pathnameparam/,
  /^\/{ target/,
  /^\/{`\$\{target/,
  /^\*\//,
  /^\/accessibility-auditor(\/|$)/,
];

export const FRONTAL_SLAYER_CUSTOMER_ROUTE_GUARD: RegExp[] = [
  /^\/$/,
  /^\/sign-in(\/|$)/,
  /^\/account(\/|$)/,
  /^\/home\/shop(\/|$)/,
  /^\/shop(\/|$)/,
  /^\/units\//,
  /^\/lobby(\/|$)/,
  /^\/lounge(\/|$)/,
  /^\/checkout(\/|$)/,
  /^\/bag(\/|$)/,
  /^\/build-a-wig(\/|$)/,
  /^\/wishlist(\/|$)/,
  /^\/reviews(\/|$)/,
  /^\/referrals(\/|$)/,
  /^\/tools\//,
  /^\/slay-cam(\/|$)/,
  /^\/slay-forecast(\/|$)/,
  /^\/booking\//,
  /^\/desktop\//,
  /^\/wavy\//,
  /^\/membership(\/|$)/,
];

/** AIO service marketing routes that share public service shell → consolidate as instances. */
export const AIO_SERVICE_MARKETING_ROUTE_PATTERNS: RegExp[] = [
  /^\/services\//,
  /^\/(bookkeeping|brokerage|dispatch|factoring|insurance|permitting|compliance|road-ready|fleetcare|driverlink|business-formation)(\/|$)/i,
];

export const AIO_PORTAL_ROUTE_PATTERNS: RegExp[] = [
  /^\/portal(\/|$)/,
  /^\/office(\/|$)/,
  /^\/carrier(\/|$)/,
  /^\/shipper(\/|$)/,
  /^\/driverlink(\/|$)/i,
  /^\/load-board(\/|$)/i,
];
