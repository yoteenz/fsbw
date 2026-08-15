/** Configurable product name — no ™/® in UI strings */
export const ROAD_READY_PRODUCT_NAME = 'Road Ready';

export const ROAD_READY_RULE_VERSION = '2026.08';

export const EXPIRATION_WINDOWS_DAYS = [90, 60, 30, 7] as const;

export const ONBOARDING_STEPS = [
  { id: 'business', label: 'Business', category: 'business' },
  { id: 'operations', label: 'Operations', category: 'business' },
  { id: 'authority', label: 'Authority', category: 'authority' },
  { id: 'fleet', label: 'Fleet', category: 'fleet' },
  { id: 'registration', label: 'Registration', category: 'registration' },
  { id: 'tax_fuel', label: 'Tax & Fuel', category: 'tax_fuel' },
  { id: 'insurance', label: 'Insurance', category: 'insurance' },
  { id: 'permits', label: 'Permits', category: 'permits' },
  { id: 'documents', label: 'Documents', category: 'ongoing' },
  { id: 'review', label: 'Review', category: 'ongoing' },
] as const;

export const ROAD_READY_CATEGORIES = [
  { id: 'business', label: 'Business', order: 1 },
  { id: 'authority', label: 'Authority', order: 2 },
  { id: 'registration', label: 'Registration', order: 3 },
  { id: 'tax_fuel', label: 'Tax & Fuel', order: 4 },
  { id: 'insurance', label: 'Insurance', order: 5 },
  { id: 'permits', label: 'Permits', order: 6 },
  { id: 'fleet', label: 'Fleet', order: 7 },
  { id: 'ongoing', label: 'Ongoing Compliance', order: 8 },
] as const;

export const GLOSSARY: Record<string, string> = {
  USDOT: 'A unique identifier assigned by the U.S. Department of Transportation for safety monitoring.',
  MC: 'Motor carrier operating authority issued by the FMCSA for interstate commerce.',
  'BOC-3': 'A filing that designates process agents for certain federally regulated motor carriers.',
  IRP: 'Apportioned vehicle registration used by qualifying interstate commercial carriers.',
  IFTA: 'A system used by qualifying interstate carriers to report and distribute fuel taxes.',
  'Road Tax': 'State highway or road-use taxes that may apply depending on jurisdiction.',
  'Trip Permit': 'Temporary permit allowing operation in a state where permanent registration may not yet apply.',
  Factoring: 'A business service that converts invoices into faster access to working capital through a partner.',
  Dispatching: 'Operational support matching available trucks with freight opportunities.',
};

export const REQUIREMENT_DEFINITIONS: Record<
  string,
  { title: string; category: string; weight: number; serviceSlug?: string; optional?: boolean }
> = {
  business_formation: { title: 'Business Formation', category: 'business', weight: 10, serviceSlug: 'llc-formation-assistance' },
  business_structure: { title: 'Business Structure', category: 'business', weight: 5 },
  ein_status: { title: 'EIN / Tax Identity', category: 'business', weight: 5 },
  usdot: { title: 'USDOT Number', category: 'authority', weight: 12, serviceSlug: 'usdot-registration' },
  operating_authority: { title: 'Operating Authority (MC)', category: 'authority', weight: 12, serviceSlug: 'operating-authority' },
  boc3: { title: 'BOC-3 Process Agents', category: 'authority', weight: 8, serviceSlug: 'boc-3-filing' },
  vehicle_registration: { title: 'Vehicle Registration', category: 'registration', weight: 10, serviceSlug: 'vehicle-registration' },
  irp: { title: 'IRP / Apportioned Registration', category: 'registration', weight: 10, serviceSlug: 'irp-registration' },
  commercial_tags: { title: 'Commercial Tags', category: 'registration', weight: 6 },
  ifta: { title: 'IFTA Account', category: 'tax_fuel', weight: 10, serviceSlug: 'ifta-setup' },
  highway_tax: { title: 'Highway / Road Tax', category: 'tax_fuel', weight: 6 },
  commercial_insurance: { title: 'Commercial Insurance', category: 'insurance', weight: 12, serviceSlug: 'insurance-review' },
  trip_permits: { title: 'Trip Permits', category: 'permits', weight: 4, optional: true },
  state_permits: { title: 'State-Specific Permits', category: 'permits', weight: 4, optional: true },
  dispatching: { title: 'Dispatch Services', category: 'operate', weight: 0, optional: true, serviceSlug: 'dispatch-services' },
  factoring: { title: 'Factoring', category: 'operate', weight: 0, optional: true, serviceSlug: 'factoring-consultation' },
  brokerage: { title: 'Brokerage Services', category: 'operate', weight: 0, optional: true, serviceSlug: 'freight-brokerage' },
};
