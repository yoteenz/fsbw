import type { IntakeAnswers, IntakeGoal, IntakeSection } from './intakeTypes';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA',
  'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
].map((s) => ({ value: s, label: s }));

const isShipper = (a: IntakeAnswers) => a.goal === 'move_freight';
const isCarrierFlow = (a: IntakeAnswers) => !isShipper(a);
const isFactoringGoal = (a: IntakeAnswers) => a.goal === 'factoring';
const isInsuranceGoal = (a: IntakeAnswers) => a.goal === 'insurance';

export const ASSET_CHECKLIST_ITEMS = [
  { id: 'registered_business', label: 'Registered Business' },
  { id: 'ein', label: 'EIN' },
  { id: 'usdot', label: 'USDOT Number' },
  { id: 'operating_authority', label: 'Operating Authority / MC' },
  { id: 'boc3', label: 'BOC-3' },
  { id: 'commercial_insurance', label: 'Commercial Insurance' },
  { id: 'irp', label: 'IRP / Apportioned Registration' },
  { id: 'ifta', label: 'IFTA Account' },
  { id: 'state_permits', label: 'State Permits' },
  { id: 'road_taxes', label: 'Road/Highway Tax Accounts' },
  { id: 'dispatch', label: 'Dispatch Service' },
  { id: 'factoring', label: 'Factoring' },
  { id: 'other', label: 'Other' },
];

export const PAIN_POINT_OPTIONS = [
  { value: 'starting_business', label: 'Starting My Business' },
  { value: 'authority', label: 'Getting Authority' },
  { value: 'tags_registration', label: 'Tags / Registration' },
  { value: 'permits', label: 'Permits' },
  { value: 'fuel_taxes', label: 'Fuel Taxes' },
  { value: 'road_taxes', label: 'Road Taxes' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'renewals', label: 'Renewals' },
  { value: 'finding_loads', label: 'Finding Loads' },
  { value: 'dispatching', label: 'Dispatching' },
  { value: 'factoring', label: 'Getting Paid Faster / Factoring' },
  { value: 'moving_freight', label: 'Moving Freight' },
  { value: 'documents', label: 'Documents' },
  { value: 'not_sure', label: 'Not Sure Where to Start' },
];

export const intakeSections: IntakeSection[] = [
  {
    id: 'goal',
    title: 'Choose Your Goal',
    description: 'What are you looking to do?',
    questions: [
      {
        id: 'goal',
        section: 'goal',
        question: 'What are you looking to do?',
        type: 'single_select',
        field: 'goal',
        required: true,
        options: [
          { value: 'start_business', label: 'START MY TRUCKING BUSINESS', description: "I'm starting from the beginning and need help getting set up." },
          { value: 'get_legal', label: 'GET MY TRUCK LEGAL', description: 'Registrations, permits, authorities, taxes or related requirements.' },
          { value: 'compliance', label: 'KEEP MY BUSINESS COMPLIANT', description: 'Filings, renewals and deadlines.' },
          { value: 'insurance', label: 'GET TRUCKING INSURANCE', description: 'Commercial transportation coverage.' },
          { value: 'dispatch', label: 'FIND LOADS & RUN MY TRUCK', description: 'Dispatch support.' },
          { value: 'factoring', label: 'GET PAID FASTER', description: 'Factoring eligible freight invoices.' },
          { value: 'move_freight', label: 'MOVE FREIGHT', description: 'Shipper/business freight brokerage services.' },
        ],
      },
    ],
  },
  {
    id: 'journey',
    title: 'Business Status',
    description: 'Where are you in your journey?',
    condition: isCarrierFlow,
    questions: [
      {
        id: 'journey',
        section: 'journey',
        question: 'Where are you in your journey?',
        type: 'single_select',
        field: 'journey',
        required: true,
        options: [
          { value: 'just_starting', label: 'Just Getting Started', description: "I haven't formed the business yet." },
          { value: 'business_formed', label: 'Business Formed', description: "I have an LLC/corporation but haven't completed my trucking setup." },
          { value: 'getting_road_ready', label: 'Getting Road Ready', description: "I've started registrations/authority but still need help." },
          { value: 'already_operating', label: 'Already Operating', description: "I'm currently hauling freight." },
          { value: 'growing_fleet', label: 'Growing My Fleet', description: "I'm operating and adding trucks/drivers/services." },
        ],
      },
    ],
  },
  {
    id: 'business',
    title: 'Business Information',
    description: 'Tell us about your business.',
    condition: isCarrierFlow,
    questions: [
      { id: 'formation_state', section: 'business', question: 'State of Formation', type: 'select', field: 'business.formationState', required: true, options: US_STATES },
      {
        id: 'business_name',
        section: 'business',
        question: 'Business Name',
        description: "Enter the name you'd like to use. We'll check it against the business registry for the state where you're forming your company.",
        type: 'business_name_check',
        field: 'business.name',
        required: false,
      },
      {
        id: 'business_structure',
        section: 'business',
        question: 'Business Structure',
        type: 'single_select',
        field: 'business.structure',
        required: true,
        options: [
          { value: 'not_formed', label: 'Not Formed Yet' },
          { value: 'sole_proprietor', label: 'Sole Proprietor' },
          { value: 'llc', label: 'LLC' },
          { value: 'corporation', label: 'Corporation' },
          { value: 'other', label: 'Other' },
        ],
      },
      { id: 'operating_state', section: 'business', question: 'Primary Operating State', type: 'select', field: 'business.operatingState', required: true, options: US_STATES },
      { id: 'trucks', section: 'business', question: 'Number of Trucks', type: 'number', field: 'business.trucks', required: true },
      { id: 'trailers', section: 'business', question: 'Number of Trailers', type: 'number', field: 'business.trailers' },
      { id: 'drivers', section: 'business', question: 'Number of Drivers', type: 'number', field: 'business.drivers' },
      {
        id: 'operation_type',
        section: 'business',
        question: 'Operation Type',
        type: 'single_select',
        field: 'business.operationType',
        required: true,
        options: [
          { value: 'owner_operator', label: 'Owner Operator' },
          { value: 'carrier', label: 'Carrier' },
          { value: 'fleet', label: 'Fleet' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'operating',
    title: 'Operating Profile',
    description: 'Help us understand how you operate.',
    condition: isCarrierFlow,
    questions: [
      {
        id: 'operating_scope',
        section: 'operating',
        question: 'Do you plan to operate',
        type: 'single_select',
        field: 'operating.scope',
        required: true,
        options: [
          { value: 'intrastate', label: 'Intrastate' },
          { value: 'interstate', label: 'Interstate' },
          { value: 'not_sure', label: 'Not Sure' },
        ],
      },
      {
        id: 'equipment',
        section: 'operating',
        question: 'What equipment do you operate?',
        type: 'multi_select',
        field: 'operating.equipment',
        options: [
          { value: 'dry_van', label: 'Dry Van' },
          { value: 'reefer', label: 'Reefer' },
          { value: 'flatbed', label: 'Flatbed' },
          { value: 'step_deck', label: 'Step Deck' },
          { value: 'box_truck', label: 'Box Truck' },
          { value: 'hotshot', label: 'Hotshot' },
          { value: 'power_only', label: 'Power Only' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'freight_types',
        section: 'operating',
        question: 'What type of freight do you typically haul?',
        type: 'multi_select',
        field: 'operating.freightTypes',
        options: [
          { value: 'general', label: 'General Freight' },
          { value: 'refrigerated', label: 'Refrigerated' },
          { value: 'flatbed', label: 'Flatbed / Construction' },
          { value: 'automotive', label: 'Automotive' },
          { value: 'hazmat', label: 'Hazmat' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'crosses_state_lines',
        section: 'operating',
        question: 'Does your business cross state lines?',
        type: 'single_select',
        field: 'operating.crossesStateLines',
        options: [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
          { value: 'not_sure', label: 'Not Sure' },
        ],
      },
      {
        id: 'currently_operating',
        section: 'operating',
        question: 'Is the business currently operating?',
        type: 'single_select',
        field: 'operating.currentlyOperating',
        options: [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
          { value: 'not_sure', label: 'Not Sure' },
        ],
      },
    ],
  },
  {
    id: 'assets',
    title: 'What Do You Already Have?',
    description: 'Select the status for each item. "Not Sure" is a valid answer.',
    condition: isCarrierFlow,
    questions: ASSET_CHECKLIST_ITEMS.map((item) => ({
      id: `asset_${item.id}`,
      section: 'assets',
      question: item.label,
      type: 'single_select' as const,
      field: `assets.${item.id}`,
      required: false,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'not_sure', label: 'Not Sure' },
      ],
      roadmapImpact: [item.id],
    })),
  },
  {
    id: 'pain_points',
    title: 'Current Pain Points',
    description: 'What do you need the most help with?',
    condition: isCarrierFlow,
    questions: [
      {
        id: 'pain_points',
        section: 'pain_points',
        question: 'What do you need the most help with?',
        description: 'Select all that apply.',
        type: 'multi_select',
        field: 'painPoints',
        options: PAIN_POINT_OPTIONS,
      },
    ],
  },
  {
    id: 'factoring_branch',
    title: 'Factoring Preliminary Questions',
    description: 'Lightweight questions to guide your preliminary roadmap.',
    condition: (a) => isCarrierFlow(a) && !!(isFactoringGoal(a) || a.painPoints?.includes('factoring')),
    questions: [
      {
        id: 'factoring_operating',
        section: 'factoring',
        question: 'Are you currently operating?',
        type: 'single_select',
        field: 'factoring.operating',
        options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }],
      },
      {
        id: 'factoring_invoices',
        section: 'factoring',
        question: 'Do you currently have unpaid freight invoices?',
        type: 'single_select',
        field: 'factoring.unpaidInvoices',
        options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }, { value: 'not_sure', label: 'Not Sure' }],
      },
      {
        id: 'factoring_payer',
        section: 'factoring',
        question: 'Who currently pays you?',
        type: 'single_select',
        field: 'factoring.payer',
        options: [
          { value: 'broker', label: 'Broker' },
          { value: 'shipper', label: 'Shipper' },
          { value: 'combination', label: 'Combination' },
          { value: 'not_sure', label: 'Not Sure' },
        ],
      },
      {
        id: 'factoring_other',
        section: 'factoring',
        question: 'Are you currently using another factoring company?',
        type: 'single_select',
        field: 'factoring.usingOtherFactor',
        options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'not_sure', label: 'Not Sure' }],
      },
      {
        id: 'factoring_volume',
        section: 'factoring',
        question: 'Approximate monthly freight invoice volume',
        type: 'single_select',
        field: 'factoring.monthlyVolume',
        options: [
          { value: 'under_10k', label: 'Under $10K' },
          { value: '10k_25k', label: '$10K–$25K' },
          { value: '25k_50k', label: '$25K–$50K' },
          { value: '50k_100k', label: '$50K–$100K' },
          { value: '100k_plus', label: '$100K+' },
          { value: 'prefer_not', label: 'Prefer Not to Say' },
        ],
      },
    ],
  },
  {
    id: 'insurance_branch',
    title: 'Insurance Preliminary Questions',
    description: 'Information to guide an insurance review recommendation.',
    condition: (a) => isCarrierFlow(a) && !!(isInsuranceGoal(a) || a.painPoints?.includes('insurance')),
    questions: [
      {
        id: 'insurance_coverage',
        section: 'insurance',
        question: 'Type of coverage needed',
        type: 'multi_select',
        field: 'insurance.coverageTypes',
        options: [
          { value: 'liability', label: 'Commercial Auto Liability' },
          { value: 'cargo', label: 'Cargo Coverage' },
          { value: 'physical_damage', label: 'Physical Damage' },
          { value: 'general_review', label: 'General Transportation Insurance Review' },
        ],
      },
      {
        id: 'insurance_power_units',
        section: 'insurance',
        question: 'Number of power units',
        type: 'number',
        field: 'insurance.powerUnits',
      },
    ],
  },
  {
    id: 'shipper',
    title: 'Freight Quote Information',
    description: 'Tell us about your shipment (demo only).',
    condition: isShipper,
    questions: [
      { id: 'shipper_company', section: 'shipper', question: 'Company Name', type: 'text', field: 'shipper.companyName', required: true },
      { id: 'shipper_contact', section: 'shipper', question: 'Contact Name', type: 'text', field: 'shipper.contactName', required: true },
      { id: 'shipper_origin', section: 'shipper', question: 'Freight Origin', type: 'text', field: 'shipper.origin', required: true },
      { id: 'shipper_destination', section: 'shipper', question: 'Freight Destination', type: 'text', field: 'shipper.destination', required: true },
      {
        id: 'shipper_equipment',
        section: 'shipper',
        question: 'Equipment Type',
        type: 'select',
        field: 'shipper.equipmentType',
        options: [
          { value: 'dry_van', label: 'Dry Van' },
          { value: 'reefer', label: 'Reefer' },
          { value: 'flatbed', label: 'Flatbed' },
          { value: 'step_deck', label: 'Step Deck' },
          { value: 'box_truck', label: 'Box Truck' },
          { value: 'other', label: 'Other' },
        ],
      },
      { id: 'shipper_commodity', section: 'shipper', question: 'Commodity', type: 'text', field: 'shipper.commodity' },
      { id: 'shipper_weight', section: 'shipper', question: 'Approximate Weight', type: 'text', field: 'shipper.weight' },
      { id: 'shipper_pickup', section: 'shipper', question: 'Pickup Date', type: 'date', field: 'shipper.pickupDate' },
      { id: 'shipper_delivery', section: 'shipper', question: 'Delivery Date', type: 'date', field: 'shipper.deliveryDate' },
      {
        id: 'shipper_recurring',
        section: 'shipper',
        question: 'Recurring or one-time shipment?',
        type: 'single_select',
        field: 'shipper.recurring',
        options: [
          { value: 'one_time', label: 'One-Time Shipment' },
          { value: 'recurring', label: 'Recurring Shipment' },
        ],
      },
      { id: 'shipper_notes', section: 'shipper', question: 'Additional Notes', type: 'textarea', field: 'shipper.notes' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'How should we follow up? (Demo — no sensitive data.)',
    questions: [
      { id: 'contact_name', section: 'contact', question: 'Your Name', type: 'text', field: 'contact.name', required: true },
      { id: 'contact_email', section: 'contact', question: 'Email', type: 'text', field: 'contact.email', required: true },
      { id: 'contact_phone', section: 'contact', question: 'Phone (optional)', type: 'text', field: 'contact.phone' },
    ],
  },
];

export function getVisibleSections(answers: IntakeAnswers): IntakeSection[] {
  return intakeSections.filter((s) => !s.condition || s.condition(answers));
}

export function getVisibleQuestions(section: IntakeSection, answers: IntakeAnswers) {
  return section.questions.filter((q) => !q.condition || q.condition(answers));
}

export function goalFromQueryParam(param: string | null): IntakeGoal | undefined {
  if (!param) return undefined;
  const map: Record<string, IntakeGoal> = {
    'start-business': 'start_business',
    'get-legal': 'get_legal',
    compliance: 'compliance',
    insurance: 'insurance',
    dispatch: 'dispatch',
    factoring: 'factoring',
    'move-freight': 'move_freight',
  };
  return map[param];
}
