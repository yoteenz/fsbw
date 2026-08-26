import type {
  DesignScreenRecord,
  PageCompilationConfidence,
  ProjectPageRouteRecord,
  ProjectWebsiteExperienceClassification,
  CustomerJourneyStage,
} from './types';
import { PRIMARY_EXPERIENCE_CLASSES } from './constants';

type ClassifyInput = {
  screen: DesignScreenRecord;
  route?: ProjectPageRouteRecord;
  projectId: string;
};

const SITE00_HOST_PATTERNS = [
  /^\/bluprint/,
  /^\/admin\/studio/,
  /^\/admin\/site00\/production/,
];

const SITE00_CLIENT_PATTERNS: Array<{ re: RegExp; exp: ProjectWebsiteExperienceClassification; group: string }> = [
  { re: /^\/origin/, exp: 'PUBLIC_WEBSITE', group: 'ORIGIN' },
  { re: /^\/idnty/, exp: 'CLIENT_WORKFLOW', group: 'IDENTITY' },
  { re: /^\/bldr/, exp: 'CLIENT_WORKFLOW', group: 'BUILDER' },
  { re: /^\/evolve/, exp: 'CLIENT_WORKFLOW', group: 'EVOLVE' },
  { re: /^\/assts/, exp: 'FOUNDER_WORKSPACE', group: 'ASSET VAULT' },
  { re: /^\/(guide|about|faq|contact)/, exp: 'CONTENT_EXPERIENCE', group: 'INFORMATION' },
  { re: /^\/(sign-in|account|auth)/, exp: 'AUTH_FLOW', group: 'ACCOUNT/AUTH' },
  { re: /^\/waiting/, exp: 'CLIENT_WORKFLOW', group: 'WAITING ROOM' },
];

function classifyFrontalSlayer({ screen, route }: ClassifyInput): {
  classification: ProjectWebsiteExperienceClassification;
  group: string;
  journey: CustomerJourneyStage;
  confidence: PageCompilationConfidence;
} {
  const path = screen.representativeRoute;
  const name = screen.displayName.toLowerCase();

  if (route?.designableSurface === 'DEV_ONLY' || route?.designableSurface === 'TEST_ONLY') {
    return { classification: 'DEV_ONLY', group: 'DEV', journey: 'ENTRY', confidence: 'HIGH' };
  }
  if (route?.status === 'LEGACY' || route?.deprecated) {
    return { classification: 'HISTORICAL', group: 'LEGACY', journey: 'ENTRY', confidence: 'HIGH' };
  }
  if (/^\/admin/.test(path)) {
    return { classification: 'ADMIN_INTERNAL', group: 'ADMIN', journey: 'SUPPORT', confidence: 'HIGH' };
  }
  if (/^\/(sign-in|register|reset|verify|forgot)/.test(path) || name.includes('sign in')) {
    return { classification: 'AUTH_FLOW', group: 'ACCOUNT', journey: 'ENTRY', confidence: 'HIGH' };
  }
  if (/^\/account/.test(path) || screen.routeFamily === 'ACCOUNT') {
    return { classification: 'ACCOUNT_FLOW', group: 'ACCOUNT', journey: 'ACCOUNT', confidence: 'HIGH' };
  }
  if (/^\/(membership|rewards|affiliate|slay-challenge)/.test(path) || name.includes('membership') || name.includes('reward')) {
    return { classification: 'MEMBERSHIP_FLOW', group: 'MEMBERSHIP', journey: 'RETENTION', confidence: 'HIGH' };
  }
  if (screen.routeTemplateId?.includes('product-pdp') || screen.displayName === 'Product Page') {
    return { classification: 'COMMERCE_FLOW', group: 'COMMERCE', journey: 'CONSIDERATION', confidence: 'HIGH' };
  }
  if (/^\/(bag|checkout)/.test(path) || name.includes('checkout') || name.includes('cart')) {
    return { classification: 'COMMERCE_FLOW', group: 'COMMERCE', journey: 'CONVERSION', confidence: 'HIGH' };
  }
  if (/build-a-wig/i.test(screen.displayName) || /\/build-a-wig/.test(path)) {
    return { classification: 'CUSTOMER_FLOW', group: 'PERSONALIZATION', journey: 'CONFIGURATION', confidence: 'HIGH' };
  }
  if (/hair analysis|showroom|extensions|transformation/i.test(name) || /\/(analysis|showroom|extensions)/.test(path)) {
    return { classification: 'CUSTOMER_FLOW', group: 'PERSONALIZATION', journey: 'CONSIDERATION', confidence: 'MEDIUM' };
  }
  if (/^\/(desktop|lobby|lounge|penthouse|elevator|mansion)/.test(path) || screen.routeTemplateId?.includes('desktop-room')) {
    return { classification: 'IMMERSIVE_EXPERIENCE', group: 'EXPERIENCE', journey: 'DISCOVERY', confidence: 'HIGH' };
  }
  if (/^\/home\/shop|^\/shop/.test(path) || name.includes('shop')) {
    return { classification: 'COMMERCE_FLOW', group: 'COMMERCE', journey: 'DISCOVERY', confidence: 'HIGH' };
  }
  if (/^\/(brand|education|psa|lounge|content|blog|story)/.test(path) || screen.routeFamily === 'CONTENT') {
    return { classification: 'CONTENT_EXPERIENCE', group: 'EXPERIENCE', journey: 'DISCOVERY', confidence: 'MEDIUM' };
  }
  if (/concierge|support|help|contact/.test(name) || /^\/support/.test(path)) {
    return { classification: 'SUPPORT_FLOW', group: 'SUPPORT', journey: 'SUPPORT', confidence: 'MEDIUM' };
  }
  if (route?.routeFamily === 'MARKETING' || /^\/(home|landing)?\/?$/.test(path)) {
    return { classification: 'PUBLIC_WEBSITE', group: 'HOME', journey: 'ENTRY', confidence: 'MEDIUM' };
  }
  return { classification: 'PUBLIC_WEBSITE', group: 'OTHER', journey: 'DISCOVERY', confidence: 'LOW' };
}

function classifySite00({ screen }: ClassifyInput): {
  classification: ProjectWebsiteExperienceClassification;
  group: string;
  journey: CustomerJourneyStage;
  confidence: PageCompilationConfidence;
} {
  const path = screen.representativeRoute;
  if (SITE00_HOST_PATTERNS.some((re) => re.test(path))) {
    return { classification: 'ADMIN_INTERNAL', group: 'DESIGN HOST', journey: 'SUPPORT', confidence: 'HIGH' };
  }
  for (const p of SITE00_CLIENT_PATTERNS) {
    if (p.re.test(path)) return { classification: p.exp, group: p.group, journey: 'CONSIDERATION', confidence: 'HIGH' };
  }
  if (/^\/admin\/site00/.test(path)) {
    return { classification: 'FOUNDER_WORKSPACE', group: 'PRODUCTION OS', journey: 'SUPPORT', confidence: 'HIGH' };
  }
  return { classification: 'PUBLIC_WEBSITE', group: 'SITE 00', journey: 'ENTRY', confidence: 'MEDIUM' };
}

function classifyAio({ screen, route }: ClassifyInput): {
  classification: ProjectWebsiteExperienceClassification;
  group: string;
  journey: CustomerJourneyStage;
  confidence: PageCompilationConfidence;
} {
  const path = screen.representativeRoute;
  if (screen.routeTemplateId?.includes('aio-portal') || /^\/portal/.test(path)) {
    return { classification: 'PORTAL_FLOW', group: 'CUSTOMER PORTAL', journey: 'ACCOUNT', confidence: 'HIGH' };
  }
  if (/^\/office/.test(path) || screen.routeTemplateId?.includes('aio-office')) {
    return { classification: 'FOUNDER_WORKSPACE', group: 'OFFICE', journey: 'SUPPORT', confidence: 'HIGH' };
  }
  if (/^\/(carrier|shipper|driver)/.test(path)) {
    return { classification: 'PORTAL_FLOW', group: path.includes('carrier') ? 'CARRIER' : 'SHIPPER', journey: 'ACCOUNT', confidence: 'HIGH' };
  }
  if (/^\/(sign-in|auth|login)/.test(path)) {
    return { classification: 'AUTH_FLOW', group: 'AUTH', journey: 'ENTRY', confidence: 'HIGH' };
  }
  if (/load.?board|dispatch|brokerage|permitting|factoring|insurance|compliance|bookkeeping|mechanic|road.?ready/i.test(screen.displayName)) {
    return { classification: 'PUBLIC_WEBSITE', group: 'SERVICES', journey: 'DISCOVERY', confidence: 'MEDIUM' };
  }
  if (route?.routeFamily === 'MARKETING' || screen.routeFamily === 'MARKETING') {
    return { classification: 'PUBLIC_WEBSITE', group: 'PUBLIC WEBSITE', journey: 'ENTRY', confidence: 'MEDIUM' };
  }
  if (/^\/admin/.test(path)) {
    return { classification: 'ADMIN_INTERNAL', group: 'ADMIN', journey: 'SUPPORT', confidence: 'HIGH' };
  }
  return { classification: 'PUBLIC_WEBSITE', group: 'PUBLIC', journey: 'DISCOVERY', confidence: 'LOW' };
}

function classifyNdxbook({ screen }: ClassifyInput): {
  classification: ProjectWebsiteExperienceClassification;
  group: string;
  journey: CustomerJourneyStage;
  confidence: PageCompilationConfidence;
} {
  const path = screen.representativeRoute;
  if (/^\/admin\/studio\/ndxbook/.test(path)) {
    return { classification: 'FOUNDER_WORKSPACE', group: 'NDXBOOK WORKSPACE', journey: 'CONSIDERATION', confidence: 'HIGH' };
  }
  return { classification: 'CONTENT_EXPERIENCE', group: 'CONTENT', journey: 'DISCOVERY', confidence: 'MEDIUM' };
}

export function classifyWebsiteExperience(input: ClassifyInput): {
  classification: ProjectWebsiteExperienceClassification;
  experienceGroup: string;
  journeyStage: CustomerJourneyStage;
  confidence: PageCompilationConfidence;
} {
  const { projectId } = input;
  let result;
  switch (projectId) {
    case 'frontal-slayer':
      result = classifyFrontalSlayer(input);
      break;
    case 'site00':
      result = classifySite00(input);
      break;
    case 'all-in-one-enterprise':
      result = classifyAio(input);
      break;
    case 'ndxbook':
      result = classifyNdxbook(input);
      break;
    default:
      result = { classification: 'PUBLIC_WEBSITE' as const, group: 'OTHER', journey: 'DISCOVERY' as const, confidence: 'LOW' as const };
  }
  return {
    classification: result.classification,
    experienceGroup: result.group,
    journeyStage: result.journey,
    confidence: result.confidence,
  };
}

export function isPrimaryExperience(classification: ProjectWebsiteExperienceClassification): boolean {
  return (PRIMARY_EXPERIENCE_CLASSES as readonly string[]).includes(classification);
}

export function isExcludedFromPrimary(classification: ProjectWebsiteExperienceClassification): boolean {
  return ['ADMIN_INTERNAL', 'SYSTEM_INTERNAL', 'DEV_ONLY', 'HISTORICAL'].includes(classification);
}
