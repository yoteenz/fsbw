export type RegistryLookupMethod = 'none' | 'topograph_api' | 'demo';

export interface StateRegistryCapability {
  stateCode: string;
  stateName: string;
  automatedLookupSupported: boolean;
  lookupMethod: RegistryLookupMethod;
  sourceName: string;
  sourceUrl: string;
  manualReviewRequired: boolean;
  entityRulesSupported: boolean;
  rateLimitBehavior: 'standard' | 'strict' | 'none';
  knownLimitations: string[];
}

const TN: StateRegistryCapability = {
  stateCode: 'TN',
  stateName: 'Tennessee',
  automatedLookupSupported: true,
  lookupMethod: 'topograph_api',
  sourceName: 'Tennessee Secretary of State Business Information Search',
  sourceUrl: 'https://tncab.tnsos.gov/business-entity-search',
  manualReviewRequired: false,
  entityRulesSupported: true,
  rateLimitBehavior: 'standard',
  knownLimitations: [
    'No official public REST API; automated lookup requires configured registry provider.',
    'Name search is starts-with; similar names may not all appear.',
  ],
};

const GA: StateRegistryCapability = {
  stateCode: 'GA',
  stateName: 'Georgia',
  automatedLookupSupported: true,
  lookupMethod: 'topograph_api',
  sourceName: 'Georgia Secretary of State eCorp Business Search',
  sourceUrl: 'https://ecorp.sos.ga.gov/BusinessSearch',
  manualReviewRequired: false,
  entityRulesSupported: true,
  rateLimitBehavior: 'standard',
  knownLimitations: [
    'No official public REST API; automated lookup requires configured registry provider.',
    'Portal notes search is not intended as a name availability search.',
  ],
};

const IL: StateRegistryCapability = {
  stateCode: 'IL',
  stateName: 'Illinois',
  automatedLookupSupported: true,
  lookupMethod: 'topograph_api',
  sourceName: 'Illinois Secretary of State Business Entity Search',
  sourceUrl: 'https://apps.ilsos.gov/corporatellc/',
  manualReviewRequired: false,
  entityRulesSupported: true,
  rateLimitBehavior: 'standard',
  knownLimitations: ['Automated lookup requires configured registry provider.'],
};

function unsupported(stateCode: string, stateName: string, sourceUrl: string): StateRegistryCapability {
  return {
    stateCode,
    stateName,
    automatedLookupSupported: false,
    lookupMethod: 'none',
    sourceName: `${stateName} Secretary of State Business Registry`,
    sourceUrl,
    manualReviewRequired: true,
    entityRulesSupported: false,
    rateLimitBehavior: 'none',
    knownLimitations: ['No supported automated lookup integration configured for this state.'],
  };
}

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming',
};

const PROVIDER_SUPPORTED = new Map<string, StateRegistryCapability>([
  ['TN', TN],
  ['GA', GA],
  ['IL', IL],
]);

export function getStateRegistryCapability(stateCode: string): StateRegistryCapability {
  const code = stateCode.trim().toUpperCase();
  const configured = PROVIDER_SUPPORTED.get(code);
  if (configured) return configured;
  const name = STATE_NAMES[code] ?? code;
  return unsupported(code, name, `https://www.google.com/search?q=${encodeURIComponent(name + ' secretary of state business search')}`);
}

export function listStateRegistryCapabilities(): StateRegistryCapability[] {
  return Object.keys(STATE_NAMES).map((code) => getStateRegistryCapability(code));
}

export function isProviderConfigured(): boolean {
  if (typeof process !== 'undefined' && process.env?.AIO_TOPOGRAPH_API_KEY) return true;
  return false;
}

export function resolveEffectiveLookupMethod(stateCode: string, demoMode: boolean): RegistryLookupMethod {
  if (demoMode) return 'demo';
  const cap = getStateRegistryCapability(stateCode);
  if (!cap.automatedLookupSupported) return 'none';
  if (cap.lookupMethod === 'topograph_api' && isProviderConfigured()) return 'topograph_api';
  return 'none';
}
